'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { SettingsService } from '@/lib/api/services/SettingsService';
import type { SettingsProfileResponse, UpdateSettingsProfilePayload } from '@/lib/api/models/SettingsProfile';
import { toast } from 'sonner';
import type { User } from '@/lib/api';
import {
  settingsBusinessDetailsSchema,
  settingsStudentProfileSchema,
  settingsTeacherProfileSchema,
  settingsUserDetailsSchema
} from '@/lib/schemas';
import { normalizePhoneDigits } from '@/lib/validation';
import { resolveAssetUrl } from '@/lib/assets/assetUrl';
import {
  PROFILE_IMAGE_UPLOAD_CONFIG,
  PROFILE_IMAGE_UPLOAD_MAX_SIZE_BYTES,
} from '@/lib/content-upload.config';
import type { SettingsProfileFormState, SettingsInputChangeEvent, SettingsTextFieldKey } from '@/lib/api/models/settingsProfileTypes';
import { SettingsProfileEditForm } from './SettingsProfileEditForm';
import { SettingsProfilePreview } from './SettingsProfilePreview';

const EMPTY_FORM: SettingsProfileFormState = {
  name: '',
  mobile: '',
  teacherQualification: '',
  teacherExperienceYears: '',
  teacherDesignation: '',
  teacherBio: '',
  teacherLanguages: [],
  teacherGender: '',
  teacherDob: '',
  teacherAddress: '',
  studentGender: '',
  studentDob: '',
  studentLanguages: [],
  studentAddress: '',
  studentCity: '',
  studentBio: '',
  businessInstituteName: '',
  businessTagline: '',
  businessContactNumber: '',
  businessEmail: '',
  businessAddress: '',
};

const formatDateInput = (value?: string | Date | null): string => {
  if (!value) return '';
  return String(value).slice(0, 10);
};

const getImageValidationError = (file: File): string | null => {
  const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
  if (!PROFILE_IMAGE_UPLOAD_CONFIG.mimeTypes.includes(file.type as (typeof PROFILE_IMAGE_UPLOAD_CONFIG.mimeTypes)[number])) {
    return `Unsupported image type. Allowed: ${PROFILE_IMAGE_UPLOAD_CONFIG.extensions.join(', ')}`;
  }
  if (!PROFILE_IMAGE_UPLOAD_CONFIG.extensions.includes(extension as (typeof PROFILE_IMAGE_UPLOAD_CONFIG.extensions)[number])) {
    return `Unsupported image extension. Allowed: ${PROFILE_IMAGE_UPLOAD_CONFIG.extensions.join(', ')}`;
  }
  if (file.size > PROFILE_IMAGE_UPLOAD_MAX_SIZE_BYTES) {
    return `Image size must be ${PROFILE_IMAGE_UPLOAD_CONFIG.maxSizeMb}MB or less`;
  }
  return null;
};

export function SettingsProfilePage() {
  const { setProfile, user: authUser } = useAuthStore();
  const [activeTab] = useState<'profile'>('profile');
  const [profile, setProfileData] = useState<SettingsProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState<SettingsProfileFormState>(EMPTY_FORM);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [businessLogoFile, setBusinessLogoFile] = useState<File | null>(null);
  const [profilePicturePreviewUrl, setProfilePicturePreviewUrl] = useState<string | null>(null);
  const [businessLogoPreviewUrl, setBusinessLogoPreviewUrl] = useState<string | null>(null);

  const isAdmin = profile?.role === 'ADMIN';
  const isTeacher = profile?.role === 'TEACHER';
  const isStudent = profile?.role === 'STUDENT';
  // Allow teachers and students to create/edit their own profile from settings
  const profileSectionReadOnly = false;

  const currentProfilePicture = useMemo(() => resolveAssetUrl(profile?.profilePicture), [profile?.profilePicture]);
  const currentBusinessLogo = useMemo(() => resolveAssetUrl(profile?.business?.logo), [profile?.business?.logo]);
  const displayedProfilePicture = profilePicturePreviewUrl || currentProfilePicture;
  const displayedBusinessLogo = businessLogoPreviewUrl || currentBusinessLogo;

  const hydrateForm = (data: SettingsProfileResponse): SettingsProfileFormState => ({
    name: data.name || '',
    mobile: data.mobile || '',
    teacherQualification: data.teacher?.qualification || '',
    teacherExperienceYears: data.teacher?.experienceYears?.toString() || '',
    teacherDesignation: data.teacher?.designation || '',
    teacherBio: data.teacher?.bio || '',
    teacherLanguages: data.teacher?.languages || [],
    teacherGender: data.teacher?.gender || '',
    teacherDob: formatDateInput(data.teacher?.dob),
    teacherAddress: data.teacher?.address || '',
    studentGender: data.student?.gender || '',
    studentDob: formatDateInput(data.student?.dob),
    studentLanguages: data.student?.languages || [],
    studentAddress: data.student?.address || '',
    studentCity: data.student?.city || '',
    studentBio: data.student?.bio || '',
    businessInstituteName: data.business?.instituteName || '',
    businessTagline: data.business?.tagline || '',
    businessContactNumber: data.business?.contactNumber || '',
    businessEmail: data.business?.email || '',
    businessAddress: data.business?.address || '',
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await SettingsService.getSettingsProfile();
      if (!data) throw new Error('Profile not found');

      setProfileData(data);
      setForm(hydrateForm(data));
    } catch (error: unknown) {
      const typedError = error as { response?: { status?: number; data?: { message?: string } } };
      const status = typedError?.response?.status;
      if (status === 404) {
        toast.error('Settings profile is unavailable right now');
        if (authUser) {
          const authFallback: SettingsProfileResponse = {
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            mobile: authUser.mobile,
            role: (authUser.role as SettingsProfileResponse['role']) || 'USER',
            profilePicture: null,
            businessId: authUser.businessId,
            business: authUser.business,
            teacher: null,
            student: null
          };
          setProfileData(authFallback);
          setForm(hydrateForm(authFallback));
        }
      } else {
        toast.error(typedError?.response?.data?.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const setValue = useCallback(<K extends keyof SettingsProfileFormState>(key: K, value: SettingsProfileFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onInput =
    (key: SettingsTextFieldKey) =>
    (event: SettingsInputChangeEvent) => {
      const phoneFields: SettingsTextFieldKey[] = ['mobile', 'businessContactNumber'];
      const nextValue = phoneFields.includes(key)
        ? normalizePhoneDigits(event.target.value)
        : event.target.value;
      setValue(key, nextValue);
    };

  const onProfilePictureChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      setProfilePictureFile(null);
      setProfilePicturePreviewUrl(null);
      return;
    }
    const validationError = getImageValidationError(selectedFile);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setProfilePictureFile(selectedFile);
    setProfilePicturePreviewUrl(URL.createObjectURL(selectedFile));
  };

  const onBusinessLogoChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      setBusinessLogoFile(null);
      setBusinessLogoPreviewUrl(null);
      return;
    }
    const validationError = getImageValidationError(selectedFile);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setBusinessLogoFile(selectedFile);
    setBusinessLogoPreviewUrl(URL.createObjectURL(selectedFile));
  };

  useEffect(() => {
    return () => {
      if (profilePicturePreviewUrl) URL.revokeObjectURL(profilePicturePreviewUrl);
    };
  }, [profilePicturePreviewUrl]);

  useEffect(() => {
    return () => {
      if (businessLogoPreviewUrl) URL.revokeObjectURL(businessLogoPreviewUrl);
    };
  }, [businessLogoPreviewUrl]);

  const handleSave = async () => {
    const parsedUserDetails = settingsUserDetailsSchema.safeParse({
      name: form.name,
      mobile: form.mobile || undefined
    });
    if (!parsedUserDetails.success) {
      toast.error(parsedUserDetails.error.issues[0]?.message || 'Please check your input');
      return;
    }

    setSaving(true);
    try {
      const payload: UpdateSettingsProfilePayload = {
        userDetails: parsedUserDetails.data
      };

      if (isTeacher) {
        // Allow teacher to create or update their profile from settings
        const parsedTeacherDetails = settingsTeacherProfileSchema.safeParse({
          qualification: form.teacherQualification,
          experienceYears: form.teacherExperienceYears || undefined,
          designation: form.teacherDesignation,
          bio: form.teacherBio,
          languages: form.teacherLanguages,
          gender: form.teacherGender,
          dob: form.teacherDob,
          address: form.teacherAddress
        });
        if (!parsedTeacherDetails.success) {
          toast.error(parsedTeacherDetails.error.issues[0]?.message || 'Please check teacher details');
          return;
        }
        payload.profileDetails = parsedTeacherDetails.data;
      } else if (isStudent) {
        // Allow student to create or update their profile from settings
        const parsedStudentDetails = settingsStudentProfileSchema.safeParse({
          gender: form.studentGender,
          dob: form.studentDob,
          languages: form.studentLanguages,
          address: form.studentAddress,
          city: form.studentCity,
          bio: form.studentBio
        });
        if (!parsedStudentDetails.success) {
          toast.error(parsedStudentDetails.error.issues[0]?.message || 'Please check student details');
          return;
        }
        payload.profileDetails = parsedStudentDetails.data;
      }

      if (isAdmin) {
        const parsedBusinessDetails = settingsBusinessDetailsSchema.safeParse({
          instituteName: form.businessInstituteName,
          contactNumber: form.businessContactNumber,
          email: form.businessEmail,
          tagline: form.businessTagline,
          address: form.businessAddress
        });
        if (!parsedBusinessDetails.success) {
          toast.error(parsedBusinessDetails.error.issues[0]?.message || 'Please check business details');
          return;
        }
        payload.businessDetails = parsedBusinessDetails.data;
      }

      payload.profilePictureFile = profilePictureFile;
      payload.businessLogoFile = businessLogoFile;

      const updated = await SettingsService.updateSettingsProfile(payload);
      setProfileData(updated);
      setProfile(updated as User);
      setForm(hydrateForm(updated));

      setProfilePictureFile(null);
      setBusinessLogoFile(null);
      setProfilePicturePreviewUrl(null);
      setBusinessLogoPreviewUrl(null);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      const typedError = error as { response?: { data?: { message?: string } } };
      toast.error(typedError?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm(hydrateForm(profile));
    }
    setProfilePictureFile(null);
    setBusinessLogoFile(null);
    setProfilePicturePreviewUrl(null);
    setBusinessLogoPreviewUrl(null);
    setIsEditing(false);
  };

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">Loading profile...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section>
        {activeTab === 'profile' && (
          isEditing ? (
            <SettingsProfileEditForm
              form={form}
              displayedProfilePicture={displayedProfilePicture}
              profileSectionReadOnly={profileSectionReadOnly}
              isTeacher={isTeacher}
              isStudent={isStudent}
              isAdmin={isAdmin}
              saving={saving}
              onCancel={handleCancel}
              onSave={handleSave}
              onInput={onInput}
              onValueChange={setValue}
              onProfilePictureChange={onProfilePictureChange}
              onBusinessLogoChange={onBusinessLogoChange}
              displayedBusinessLogo={displayedBusinessLogo}
              profilePictureFile={profilePictureFile}
              businessLogoFile={businessLogoFile}
            />
          ) : (
            <SettingsProfilePreview
              profile={profile}
              form={form}
              displayedProfilePicture={displayedProfilePicture}
              displayedBusinessLogo={displayedBusinessLogo}
              isAdmin={isAdmin}
              isTeacher={isTeacher}
              isStudent={isStudent}
              profileSectionReadOnly={profileSectionReadOnly}
              onEditProfile={() => setIsEditing(true)}
            />
          )
        )}
      </section>
    </div>
  );
}
