'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { resolveAssetUrl } from '@/lib/assets/assetUrl';
import {
  PROFILE_IMAGE_UPLOAD_ACCEPT,
  PROFILE_IMAGE_UPLOAD_CONFIG,
  PROFILE_IMAGE_UPLOAD_MAX_SIZE_BYTES,
} from '@/lib/content-upload.config';

type FormState = {
  name: string;
  mobile: string;
  teacherQualification: string;
  teacherExperienceYears: string;
  teacherDesignation: string;
  teacherBio: string;
  teacherLanguages: string;
  teacherGender: string;
  teacherDob: string;
  teacherAddress: string;
  studentGender: string;
  studentDob: string;
  studentLanguages: string;
  studentAddress: string;
  studentCity: string;
  studentBio: string;
  businessInstituteName: string;
  businessTagline: string;
  businessContactNumber: string;
  businessEmail: string;
  businessAddress: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  mobile: '',
  teacherQualification: '',
  teacherExperienceYears: '',
  teacherDesignation: '',
  teacherBio: '',
  teacherLanguages: '',
  teacherGender: '',
  teacherDob: '',
  teacherAddress: '',
  studentGender: '',
  studentDob: '',
  studentLanguages: '',
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

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [businessLogoFile, setBusinessLogoFile] = useState<File | null>(null);
  const [profilePicturePreviewUrl, setProfilePicturePreviewUrl] = useState<string | null>(null);
  const [businessLogoPreviewUrl, setBusinessLogoPreviewUrl] = useState<string | null>(null);

  const isAdmin = profile?.role === 'ADMIN';
  const isTeacher = profile?.role === 'TEACHER';
  const isStudent = profile?.role === 'STUDENT';
  const hasTeacherProfile = Boolean(profile?.teacher?.id);
  const hasStudentProfile = Boolean(profile?.student?.id);
  const profileSectionReadOnly = (isTeacher && !hasTeacherProfile) || (isStudent && !hasStudentProfile);

  const currentProfilePicture = useMemo(() => resolveAssetUrl(profile?.profilePicture), [profile?.profilePicture]);
  const currentBusinessLogo = useMemo(() => resolveAssetUrl(profile?.business?.logo), [profile?.business?.logo]);
  const displayedProfilePicture = profilePicturePreviewUrl || currentProfilePicture;
  const displayedBusinessLogo = businessLogoPreviewUrl || currentBusinessLogo;

  const hydrateForm = (data: SettingsProfileResponse): FormState => ({
    name: data.name || '',
    mobile: data.mobile || '',
    teacherQualification: data.teacher?.qualification || '',
    teacherExperienceYears: data.teacher?.experienceYears?.toString() || '',
    teacherDesignation: data.teacher?.designation || '',
    teacherBio: data.teacher?.bio || '',
    teacherLanguages: data.teacher?.languages?.join(', ') || '',
    teacherGender: data.teacher?.gender || '',
    teacherDob: formatDateInput(data.teacher?.dob),
    teacherAddress: data.teacher?.address || '',
    studentGender: data.student?.gender || '',
    studentDob: formatDateInput(data.student?.dob),
    studentLanguages: data.student?.languages?.join(', ') || '',
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

  const onInput = (key: string) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [key]: event.target.value }));
  };

  const onProfilePictureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (!selectedFile) {
      setProfilePictureFile(null);
      setProfilePicturePreviewUrl(null);
      return;
    }
    const validationError = getImageValidationError(selectedFile);
    if (validationError) {
      toast.error(validationError);
      event.target.value = '';
      return;
    }
    setProfilePictureFile(selectedFile);
    setProfilePicturePreviewUrl(URL.createObjectURL(selectedFile));
  };

  const onBusinessLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (!selectedFile) {
      setBusinessLogoFile(null);
      setBusinessLogoPreviewUrl(null);
      return;
    }
    const validationError = getImageValidationError(selectedFile);
    if (validationError) {
      toast.error(validationError);
      event.target.value = '';
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
        if (!hasTeacherProfile) {
          toast.error('Teacher profile is not initialized by admin yet');
          return;
        }
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
        if (!hasStudentProfile) {
          toast.error('Student profile is not initialized by admin yet');
          return;
        }
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

  const ProfilePreview = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
              {displayedProfilePicture ? (
                <Image
                  src={displayedProfilePicture}
                  alt="Profile"
                  width={64}
                  height={64}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-400">
                  {(profile?.name || 'U').slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Profile Settings</h1>
              <p className="text-sm text-slate-600">Review your account information and role details.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
              Role: {profile?.role || 'USER'}
            </span>
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{form.name || '-'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Mobile</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{form.mobile || '-'}</p>
        </div>
      </div>

      {(isTeacher || isStudent) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{isTeacher ? 'Teacher Details' : 'Student Details'}</h2>
          {profileSectionReadOnly ? (
            <p className="mt-2 text-sm text-amber-700">Profile is not initialized by admin yet.</p>
          ) : isTeacher ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="text-sm text-slate-700"><span className="font-medium">Qualification:</span> {form.teacherQualification || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">Experience:</span> {form.teacherExperienceYears || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">Designation:</span> {form.teacherDesignation || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">Languages:</span> {form.teacherLanguages || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">Gender:</span> {form.teacherGender || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">DOB:</span> {form.teacherDob || '-'}</p>
              <p className="text-sm text-slate-700 sm:col-span-2"><span className="font-medium">Address:</span> {form.teacherAddress || '-'}</p>
              <p className="text-sm text-slate-700 sm:col-span-2"><span className="font-medium">Bio:</span> {form.teacherBio || '-'}</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="text-sm text-slate-700"><span className="font-medium">Gender:</span> {form.studentGender || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">DOB:</span> {form.studentDob || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">Languages:</span> {form.studentLanguages || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">City:</span> {form.studentCity || '-'}</p>
              <p className="text-sm text-slate-700 sm:col-span-2"><span className="font-medium">Address:</span> {form.studentAddress || '-'}</p>
              <p className="text-sm text-slate-700 sm:col-span-2"><span className="font-medium">Bio:</span> {form.studentBio || '-'}</p>
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            {displayedBusinessLogo && (
              <Image
                src={displayedBusinessLogo}
                alt="Business logo"
                width={56}
                height={56}
                unoptimized
                className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
              />
            )}
            <h2 className="text-lg font-semibold text-slate-900">Business Details</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <p className="text-sm text-slate-700"><span className="font-medium">Institute:</span> {form.businessInstituteName || '-'}</p>
            <p className="text-sm text-slate-700"><span className="font-medium">Contact:</span> {form.businessContactNumber || '-'}</p>
            <p className="text-sm text-slate-700"><span className="font-medium">Email:</span> {form.businessEmail || '-'}</p>
            <p className="text-sm text-slate-700"><span className="font-medium">Tagline:</span> {form.businessTagline || '-'}</p>
            <p className="text-sm text-slate-700 sm:col-span-2"><span className="font-medium">Address:</span> {form.businessAddress || '-'}</p>
          </div>
        </div>
      )}
    </div>
  );

  const ProfileEditForm = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Edit Profile</h1>
          <p className="text-sm text-slate-500">Update your details and save changes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <Input value={form.name || ''} onChange={onInput('name')} maxLength={100} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mobile</label>
          <Input value={form.mobile || ''} onChange={onInput('mobile')} maxLength={20} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">Profile Picture</label>
        {displayedProfilePicture && (
          <Image
            src={displayedProfilePicture}
            alt="Profile"
            width={88}
            height={88}
            unoptimized
            className="mb-3 h-20 w-20 rounded-full border border-slate-200 object-cover"
          />
        )}
        <Input type="file" accept={PROFILE_IMAGE_UPLOAD_ACCEPT} onChange={onProfilePictureChange} />
      </div>

      {isTeacher && (
        <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Teacher Details</h2>
          {profileSectionReadOnly && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">Profile not initialized by admin yet. You can update user details now, and profile details will unlock after initialization.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input disabled={profileSectionReadOnly} placeholder="Qualification" value={form.teacherQualification || ''} onChange={onInput('teacherQualification')} />
            <Input disabled={profileSectionReadOnly} placeholder="Experience Years" type="number" value={form.teacherExperienceYears || ''} onChange={onInput('teacherExperienceYears')} />
            <Input disabled={profileSectionReadOnly} placeholder="Designation" value={form.teacherDesignation || ''} onChange={onInput('teacherDesignation')} />
            <Input disabled={profileSectionReadOnly} placeholder="Languages (comma separated)" value={form.teacherLanguages || ''} onChange={onInput('teacherLanguages')} />
            <select disabled={profileSectionReadOnly} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.teacherGender || ''} onChange={onInput('teacherGender')}>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <Input disabled={profileSectionReadOnly} type="date" value={form.teacherDob || ''} onChange={onInput('teacherDob')} />
          </div>
          <Textarea disabled={profileSectionReadOnly} placeholder="Address" value={form.teacherAddress || ''} onChange={onInput('teacherAddress')} />
          <Textarea disabled={profileSectionReadOnly} placeholder="Bio" value={form.teacherBio || ''} onChange={onInput('teacherBio')} />
        </div>
      )}

      {isStudent && (
        <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Student Details</h2>
          {profileSectionReadOnly && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">Profile not initialized by admin yet. You can update user details now, and profile details will unlock after initialization.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <select disabled={profileSectionReadOnly} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.studentGender || ''} onChange={onInput('studentGender')}>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <Input disabled={profileSectionReadOnly} type="date" value={form.studentDob || ''} onChange={onInput('studentDob')} />
            <Input disabled={profileSectionReadOnly} placeholder="Languages (comma separated)" value={form.studentLanguages || ''} onChange={onInput('studentLanguages')} />
            <Input disabled={profileSectionReadOnly} placeholder="City" value={form.studentCity || ''} onChange={onInput('studentCity')} />
          </div>
          <Textarea disabled={profileSectionReadOnly} placeholder="Address" value={form.studentAddress || ''} onChange={onInput('studentAddress')} />
          <Textarea disabled={profileSectionReadOnly} placeholder="Bio" value={form.studentBio || ''} onChange={onInput('studentBio')} />
        </div>
      )}

      {isAdmin && (
        <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Business Details</h2>
          {displayedBusinessLogo && (
            <Image
              src={displayedBusinessLogo}
              alt="Business logo"
              width={96}
              height={96}
              unoptimized
              className="mb-3 h-24 w-24 rounded-xl border border-slate-200 object-cover"
            />
          )}
          <Input type="file" accept={PROFILE_IMAGE_UPLOAD_ACCEPT} onChange={onBusinessLogoChange} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Institute Name" value={form.businessInstituteName || ''} onChange={onInput('businessInstituteName')} />
            <Input placeholder="Contact Number" value={form.businessContactNumber || ''} onChange={onInput('businessContactNumber')} />
            <Input placeholder="Business Email" value={form.businessEmail || ''} onChange={onInput('businessEmail')} />
            <Input placeholder="Tagline" value={form.businessTagline || ''} onChange={onInput('businessTagline')} />
          </div>
          <Textarea placeholder="Business Address" value={form.businessAddress || ''} onChange={onInput('businessAddress')} />
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">Loading profile...</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-gradient-to-b from-blue-50 to-white p-4 shadow-sm">
        <button className="w-full rounded-xl border border-blue-100 bg-white px-4 py-2 text-left text-sm font-semibold text-blue-700 shadow-sm">
          Profile
        </button>
        <p className="mt-3 text-xs text-slate-500">Manage account and role-specific details.</p>
      </aside>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {activeTab === 'profile' && (isEditing ? <ProfileEditForm /> : <ProfilePreview />)}
      </section>
    </div>
  );
}
