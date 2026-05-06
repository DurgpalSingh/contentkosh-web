'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { SettingsProfileResponse } from '@/lib/api/models/SettingsProfile';
import type { SettingsProfileFormState } from '@/lib/api/models/settingsProfileTypes';

type SettingsProfilePreviewProps = {
  profile: SettingsProfileResponse | null;
  form: SettingsProfileFormState;
  displayedProfilePicture: string | null;
  displayedBusinessLogo: string | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  profileSectionReadOnly: boolean;
  onEditProfile: () => void;
};

export function SettingsProfilePreview({
  profile,
  form,
  displayedProfilePicture,
  displayedBusinessLogo,
  isAdmin,
  isTeacher,
  isStudent,
  profileSectionReadOnly,
  onEditProfile,
}: SettingsProfilePreviewProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
              {displayedProfilePicture ? (
                <Image src={displayedProfilePicture} alt="Profile" width={64} height={64} unoptimized className="h-full w-full object-cover" />
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
              {profile?.role || 'USER'}
            </span>
            <Button type="button" onClick={onEditProfile} className="rounded-xl bg-blue-600 text-white hover:bg-blue-700">
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
            <p className="mt-2 text-sm text-amber-700">Profile setup in progress. You can edit your details once the admin activates your account.</p>
          ) : isTeacher ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="text-sm text-slate-700"><span className="font-medium">Qualification:</span> {form.teacherQualification || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">Experience:</span> {form.teacherExperienceYears || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">Designation:</span> {form.teacherDesignation || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">Languages:</span> {form.teacherLanguages.join(', ') || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">Gender:</span> {form.teacherGender || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">DOB:</span> {form.teacherDob || '-'}</p>
              <p className="text-sm text-slate-700 sm:col-span-2"><span className="font-medium">Address:</span> {form.teacherAddress || '-'}</p>
              <p className="text-sm text-slate-700 sm:col-span-2"><span className="font-medium">Bio:</span> {form.teacherBio || '-'}</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="text-sm text-slate-700"><span className="font-medium">Gender:</span> {form.studentGender || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">DOB:</span> {form.studentDob || '-'}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">Languages:</span> {form.studentLanguages.join(', ') || '-'}</p>
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
              <Image src={displayedBusinessLogo} alt="Business logo" width={56} height={56} unoptimized className="h-14 w-14 rounded-xl border border-slate-200 object-cover" />
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
}

