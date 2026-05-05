'use client';

import type { ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LanguageInputChips } from '@/components/modals/LanguageInputChips';
import type { SettingsProfileFormState, SettingsInputChangeEvent, SettingsTextFieldKey } from '@/lib/api/models/settingsProfileTypes';

type SettingsProfileEditFormProps = {
  form: SettingsProfileFormState;
  displayedProfilePicture: string | null;
  profileSectionReadOnly: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  saving: boolean;
  profileImageUploadAccept: string;
  onCancel: () => void;
  onSave: () => void;
  onInput: (key: SettingsTextFieldKey) => (event: SettingsInputChangeEvent) => void;
  onValueChange: <K extends keyof SettingsProfileFormState>(key: K, value: SettingsProfileFormState[K]) => void;
  onProfilePictureChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBusinessLogoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  displayedBusinessLogo: string | null;
};

export function SettingsProfileEditForm({
  form,
  displayedProfilePicture,
  profileSectionReadOnly,
  isTeacher,
  isStudent,
  isAdmin,
  saving,
  profileImageUploadAccept,
  onCancel,
  onSave,
  onInput,
  onValueChange,
  onProfilePictureChange,
  onBusinessLogoChange,
  displayedBusinessLogo,
}: SettingsProfileEditFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Edit Profile</h1>
          <p className="text-sm text-slate-500">Update your details and save changes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving} className="rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700">
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
          <Image src={displayedProfilePicture} alt="Profile" width={88} height={88} unoptimized className="mb-3 h-20 w-20 rounded-full border border-slate-200 object-cover" />
        )}
        <Input type="file" accept={profileImageUploadAccept} onChange={onProfilePictureChange} />
      </div>

      {isTeacher && (
        <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Teacher Details</h2>
          {profileSectionReadOnly && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              Profile not initialized by admin yet. You can update user details now, and profile details will unlock after initialization.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input disabled={profileSectionReadOnly} placeholder="Qualification" value={form.teacherQualification || ''} onChange={onInput('teacherQualification')} />
            <Input disabled={profileSectionReadOnly} placeholder="Experience Years" type="number" value={form.teacherExperienceYears || ''} onChange={onInput('teacherExperienceYears')} />
            <Input disabled={profileSectionReadOnly} placeholder="Designation" value={form.teacherDesignation || ''} onChange={onInput('teacherDesignation')} />
            <LanguageInputChips
              disabled={profileSectionReadOnly}
              languages={form.teacherLanguages}
              onChange={(next) => onValueChange('teacherLanguages', next)}
            />
            <select disabled={profileSectionReadOnly} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.teacherGender || ''} onChange={onInput('teacherGender')}>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <DatePicker disabled={profileSectionReadOnly} value={form.teacherDob || ''} onChange={(next) => onValueChange('teacherDob', next)} />
          </div>
          <Textarea disabled={profileSectionReadOnly} placeholder="Address" value={form.teacherAddress || ''} onChange={onInput('teacherAddress')} />
          <Textarea disabled={profileSectionReadOnly} placeholder="Bio" value={form.teacherBio || ''} onChange={onInput('teacherBio')} />
        </div>
      )}

      {isStudent && (
        <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Student Details</h2>
          {profileSectionReadOnly && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              Profile not initialized by admin yet. You can update user details now, and profile details will unlock after initialization.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <select disabled={profileSectionReadOnly} className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.studentGender || ''} onChange={onInput('studentGender')}>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <DatePicker disabled={profileSectionReadOnly} value={form.studentDob || ''} onChange={(next) => onValueChange('studentDob', next)} />
            <LanguageInputChips
              disabled={profileSectionReadOnly}
              languages={form.studentLanguages}
              onChange={(next) => onValueChange('studentLanguages', next)}
            />
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
            <Image src={displayedBusinessLogo} alt="Business logo" width={96} height={96} unoptimized className="mb-3 h-24 w-24 rounded-xl border border-slate-200 object-cover" />
          )}
          <Input type="file" accept={profileImageUploadAccept} onChange={onBusinessLogoChange} />
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
}

