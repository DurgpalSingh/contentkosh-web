'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Briefcase, Building2, Edit, GraduationCap, Mail, Phone, User as UserIcon } from 'lucide-react';
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

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        <div className="text-blue-600">{icon}</div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className="truncate text-sm font-semibold text-slate-900">{value || 'Not specified'}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-600">{label}</p>
      <p className="break-words text-sm font-semibold text-slate-900">{value || 'Not specified'}</p>
    </div>
  );
}

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
  const roleLabel = profile?.role || 'USER';

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white/40 bg-white/10">
                {displayedProfilePicture ? (
                  <Image
                    src={displayedProfilePicture}
                    alt={`${form.name || 'User'} profile`}
                    width={80}
                    height={80}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-100 text-2xl font-bold text-blue-700">
                    {(form.name || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold sm:text-3xl">{form.name || 'Profile Settings'}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-blue-50">
                  <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 font-medium">
                    {roleLabel}
                  </span>
                  {profile?.email && (
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button type="button" onClick={onEditProfile} variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard icon={<UserIcon className="h-4 w-4" />} label="Name" value={form.name} />
          <SummaryCard icon={<Phone className="h-4 w-4" />} label="Mobile" value={form.mobile} />
          <SummaryCard
            icon={isTeacher ? <Briefcase className="h-4 w-4" /> : isStudent ? <GraduationCap className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            label="Profile Type"
            value={roleLabel}
          />
        </div>
      </div>

      {(isTeacher || isStudent) && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">{isTeacher ? 'Teacher Details' : 'Student Details'}</h2>
          </div>
          {profileSectionReadOnly ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              Profile setup in progress. You can edit your details once the admin activates your account.
            </p>
          ) : isTeacher ? (
            <div className="grid gap-5 md:grid-cols-2">
              <DetailRow label="Qualification" value={form.teacherQualification} />
              <DetailRow label="Experience" value={form.teacherExperienceYears ? `${form.teacherExperienceYears} years` : ''} />
              <DetailRow label="Designation" value={form.teacherDesignation} />
              <DetailRow label="Gender" value={form.teacherGender} />
              <DetailRow label="Date of Birth" value={form.teacherDob} />
              <DetailRow label="Languages" value={form.teacherLanguages.join(', ')} />
              <div className="md:col-span-2">
                <DetailRow label="Address" value={form.teacherAddress} />
              </div>
              <div className="md:col-span-2">
                <DetailRow label="Bio" value={form.teacherBio} />
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              <DetailRow label="Gender" value={form.studentGender} />
              <DetailRow label="Date of Birth" value={form.studentDob} />
              <DetailRow label="City" value={form.studentCity} />
              <DetailRow label="Languages" value={form.studentLanguages.join(', ')} />
              <div className="md:col-span-2">
                <DetailRow label="Address" value={form.studentAddress} />
              </div>
              <div className="md:col-span-2">
                <DetailRow label="Bio" value={form.studentBio} />
              </div>
            </div>
          )}
        </section>
      )}

      {isAdmin && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {displayedBusinessLogo ? (
                  <Image src={displayedBusinessLogo} alt="Business logo" width={56} height={56} unoptimized className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Business Details</h2>
                <p className="text-sm text-slate-500">Institute profile and public contact details.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <DetailRow label="Institute" value={form.businessInstituteName} />
            <DetailRow label="Contact" value={form.businessContactNumber} />
            <DetailRow label="Email" value={form.businessEmail} />
            <DetailRow label="Tagline" value={form.businessTagline} />
            <div className="md:col-span-2">
              <DetailRow label="Address" value={form.businessAddress} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
