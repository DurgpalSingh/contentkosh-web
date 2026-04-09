'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnnouncementsService, type Announcement } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAnnouncementsListRefreshListener } from '@/lib/hooks/useAnnouncementsListRefreshListener';
import { AdminAnnouncementModal } from '@/components/modals/AdminAnnouncementModal';
import { TeacherAnnouncementModal } from '@/components/modals/TeacherAnnouncementModal';
import { AnnouncementFeed } from '@/components/announcements/AnnouncementFeed';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { USER_ROLES } from '@/lib/constants';
import { getErrorMessage } from '@/components/announcements/announcementHelpers';

function getRole(user: { role?: string } | null): string {
  return user?.role?.toUpperCase() ?? '';
}

function SectionCard({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function ConfirmDeleteModal({
  open,
  title,
  description,
  confirmLabel,
  isLoading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={isLoading ? undefined : onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-base font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementPage() {
  const { user, business, isInitialized } = useAuthStore();
  const businessId = business?.id;

  const [receivedAnnouncements, setReceivedAnnouncements] = useState<Announcement[]>([]);
  const [managedAnnouncements, setManagedAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleteRole, setDeleteRole] = useState<'ADMIN' | 'TEACHER' | null>(null);
  const [deleting, setDeleting] = useState(false);

  const role = getRole(user);
  const isAdmin = role === USER_ROLES.ADMIN;
  const isTeacher = role === USER_ROLES.TEACHER;
  const isStudent = role === USER_ROLES.STUDENT;

  const teacherInbox =
    isTeacher && user?.id != null
      ? receivedAnnouncements.filter((a) => a.createdBy !== user.id)
      : receivedAnnouncements;

  const loadAnnouncements = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const receivedAnnounceRes = await AnnouncementsService.getMyAnnouncements();
      setReceivedAnnouncements(receivedAnnounceRes.data ?? []);

      if (isAdmin || isTeacher) {
        const managedAnnounceRes = await AnnouncementsService.getManagedAnnouncements();
        setManagedAnnouncements(managedAnnounceRes.data ?? []);
      } else {
        setManagedAnnouncements([]);
      }
    } catch (e) {
      console.error(e);
      toast.error(getErrorMessage(e, 'Failed to load announcements'));
    } finally {
      setLoading(false);
    }
  }, [businessId, isAdmin, isTeacher]);

  useEffect(() => {
    if (!isInitialized || !businessId) return;
    void loadAnnouncements();
  }, [isInitialized, businessId, loadAnnouncements]);

  useAnnouncementsListRefreshListener(loadAnnouncements, Boolean(businessId && isInitialized));

  const openCreateAdmin = () => {
    setEditTarget(null);
    setAdminModalOpen(true);
  };

  const openCreateTeacher = () => {
    setEditTarget(null);
    setTeacherModalOpen(true);
  };

  const openEditAdmin = (a: Announcement) => {
    setEditTarget(a);
    setAdminModalOpen(true);
  };

  const openEditTeacher = (a: Announcement) => {
    setEditTarget(a);
    setTeacherModalOpen(true);
  };

  const requestDelete = (a: Announcement, asRole: 'ADMIN' | 'TEACHER') => {
    setDeleteTarget(a);
    setDeleteRole(asRole);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await AnnouncementsService.deleteAnnouncement(deleteTarget.id);
      toast.success('Announcement deleted');
      setDeleteTarget(null);
      setDeleteRole(null);
      await loadAnnouncements();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to delete'));
    } finally {
      setDeleting(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!businessId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-sm text-slate-600">You need to be assigned to an institute to see announcements.</p>
      </div>
    );
  }

  if (loading && receivedAnnouncements.length === 0 && managedAnnouncements.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">
            {isStudent && 'Updates from your institute and instructors.'}
            {isTeacher && 'See institute-wide announcements and manage your own.'}
            {isAdmin && 'Create and manage announcements for your institute.'}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin ? (
            <Button
              type="button"
              onClick={openCreateAdmin}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              New announcement
            </Button>
          ) : null}
          {isTeacher ? (
            <Button
              type="button"
              onClick={openCreateTeacher}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              New announcement
            </Button>
          ) : null}
        </div>
      </div>

      {isAdmin && (
        <SectionCard
          title="All announcements"
          subtitle={`${managedAnnouncements.length} total`}
        >
          <AnnouncementFeed
            items={managedAnnouncements}
            emptyLabel="No announcements yet."
            showActions
            onEdit={openEditAdmin}
            onDelete={(a) => requestDelete(a, 'ADMIN')}
          />
        </SectionCard>
      )}

      {isTeacher && (
        <>
          <SectionCard
            title="For you"
            subtitle={`${teacherInbox.length} items`}
          >
            <AnnouncementFeed
              items={teacherInbox}
              emptyLabel="No announcements in your inbox."
            />
          </SectionCard>
          <SectionCard
            title="Your announcements"
            subtitle={`${managedAnnouncements.length} created`}
          >
            <AnnouncementFeed
              items={managedAnnouncements}
              emptyLabel="You have not created any announcements yet."
              showActions
              onEdit={openEditTeacher}
              onDelete={(a) => requestDelete(a, 'TEACHER')}
            />
          </SectionCard>
        </>
      )}

      {isStudent && (
        <SectionCard title="Your announcements" subtitle={`${receivedAnnouncements.length} items`}>
          <AnnouncementFeed items={receivedAnnouncements} emptyLabel="No announcements yet." />
        </SectionCard>
      )}

      {!isAdmin && !isTeacher && !isStudent && (
        <p className="text-sm text-slate-600">Announcements are not available for your account.</p>
      )}

      {businessId != null && (
        <>
          <AdminAnnouncementModal
            isOpen={adminModalOpen}
            onClose={() => {
              setAdminModalOpen(false);
              setEditTarget(null);
            }}
            businessId={businessId}
            initial={editTarget}
            onSuccess={loadAnnouncements}
          />
          <TeacherAnnouncementModal
            isOpen={teacherModalOpen}
            onClose={() => {
              setTeacherModalOpen(false);
              setEditTarget(null);
            }}
            initial={editTarget}
            onSuccess={loadAnnouncements}
          />
        </>
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteTarget?.id && deleteRole)}
        title="Delete announcement?"
        description="This action cannot be undone. The announcement will be removed for everyone."
        confirmLabel="Delete"
        isLoading={deleting}
        onCancel={() => {
          if (deleting) return;
          setDeleteTarget(null);
          setDeleteRole(null);
        }}
        onConfirm={() => {
          if (deleting) return;
          void confirmDelete();
        }}
      />
    </div>
  );
}
