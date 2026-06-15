'use client';

import type { ReactNode } from 'react';
import { Briefcase, Building2, GraduationCap, Image as ImageIcon, Loader2, Save, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LanguageInputChips } from '@/components/modals/LanguageInputChips';
import { FileUploadArea } from '@/components/dashboard/contents/FileUploadArea';
import { PROFILE_IMAGE_UPLOAD_ACCEPT } from '@/lib/content-upload.config';
import type { SettingsProfileFormState, SettingsInputChangeEvent, SettingsTextFieldKey } from '@/lib/api/models/settingsProfileTypes';
import { toast } from 'sonner';

type SettingsProfileEditFormProps = {
  form: SettingsProfileFormState;
  displayedProfilePicture: string | null;
  profileSectionReadOnly: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
  onInput: (key: SettingsTextFieldKey) => (event: SettingsInputChangeEvent) => void;
  onValueChange: <K extends keyof SettingsProfileFormState>(key: K, value: SettingsProfileFormState[K]) => void;
  onProfilePictureChange: (file: File | null) => void;
  onBusinessLogoChange: (file: File | null) => void;
  displayedBusinessLogo: string | null;
  profilePictureFile: File | null;
  businessLogoFile: File | null;
};

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function SettingsProfileEditForm({
  form,
  displayedProfilePicture,
  profileSectionReadOnly,
  isTeacher,
  isStudent,
  isAdmin,
  saving,
  onCancel,
  onSave,
  onInput,
  onValueChange,
  onProfilePictureChange,
  onBusinessLogoChange,
  displayedBusinessLogo,
  profilePictureFile,
  businessLogoFile,
}: SettingsProfileEditFormProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <UserRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
              <p className="text-sm text-slate-600">Update account, profile and institute details.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="button" onClick={onSave} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              icon={<UserRound className="h-5 w-5" />}
              title="Account Details"
              description="Basic information used across your account."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <Input value={form.name || ''} onChange={onInput('name')} maxLength={100} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Mobile</label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  value={form.mobile || ''}
                  onChange={onInput('mobile')}
                  maxLength={10}
                  placeholder="9876543210"
                />
              </div>
            </div>
          </section>

          {isTeacher && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader
                icon={<Briefcase className="h-5 w-5" />}
                title="Teacher Details"
                description="Professional details visible on your teacher profile."
              />
              {profileSectionReadOnly && (
                <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
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
              <div className="mt-4 grid gap-4">
                <Textarea disabled={profileSectionReadOnly} placeholder="Address" value={form.teacherAddress || ''} onChange={onInput('teacherAddress')} />
                <Textarea disabled={profileSectionReadOnly} placeholder="Bio" value={form.teacherBio || ''} onChange={onInput('teacherBio')} />
              </div>
            </section>
          )}

          {isStudent && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader
                icon={<GraduationCap className="h-5 w-5" />}
                title="Student Details"
                description="Personal details used on your student profile."
              />
              {profileSectionReadOnly && (
                <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
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
              <div className="mt-4 grid gap-4">
                <Textarea disabled={profileSectionReadOnly} placeholder="Address" value={form.studentAddress || ''} onChange={onInput('studentAddress')} />
                <Textarea disabled={profileSectionReadOnly} placeholder="Bio" value={form.studentBio || ''} onChange={onInput('studentBio')} />
              </div>
            </section>
          )}

          {isAdmin && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader
                icon={<Building2 className="h-5 w-5" />}
                title="Business Details"
                description="Institute branding and contact information."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input placeholder="Institute Name" value={form.businessInstituteName || ''} onChange={onInput('businessInstituteName')} />
                <Input
                  placeholder="Contact Number"
                  type="tel"
                  inputMode="numeric"
                  value={form.businessContactNumber || ''}
                  onChange={onInput('businessContactNumber')}
                  maxLength={10}
                />
                <Input placeholder="Business Email" value={form.businessEmail || ''} onChange={onInput('businessEmail')} />
                <Input placeholder="Tagline" value={form.businessTagline || ''} onChange={onInput('businessTagline')} />
              </div>
              <Textarea className="mt-4" placeholder="Business Address" value={form.businessAddress || ''} onChange={onInput('businessAddress')} />
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              icon={<ImageIcon className="h-5 w-5" />}
              title="Profile Picture"
              description="Drag and drop a square image."
            />
            <FileUploadArea
              accept={PROFILE_IMAGE_UPLOAD_ACCEPT}
              value={profilePictureFile}
              onChange={onProfilePictureChange}
              onError={(message) => {
                if (message) toast.error(message);
              }}
              acceptedLabel="JPG, PNG, or WebP"
              previewUrl={displayedProfilePicture}
              previewAlt="Profile picture preview"
              isUploading={saving && Boolean(profilePictureFile)}
            />
          </section>

          {isAdmin && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader
                icon={<Building2 className="h-5 w-5" />}
                title="Business Logo"
                description="Upload your institute logo."
              />
              <FileUploadArea
                accept={PROFILE_IMAGE_UPLOAD_ACCEPT}
                value={businessLogoFile}
                onChange={onBusinessLogoChange}
                onError={(message) => {
                  if (message) toast.error(message);
                }}
                acceptedLabel="JPG, PNG, or WebP"
                previewUrl={displayedBusinessLogo}
                previewAlt="Business logo preview"
                isUploading={saving && Boolean(businessLogoFile)}
              />
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
