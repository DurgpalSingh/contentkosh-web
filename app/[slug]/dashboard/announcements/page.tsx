'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AdminAnnouncementsView } from '@/components/dashboard/announcements/AdminAnnouncementsView';
import { TeacherAnnouncementsView } from '@/components/dashboard/announcements/TeacherAnnouncementsView';
import { StudentAnnouncementsView } from '@/components/dashboard/announcements/StudentAnnouncementsView';

export default function AnnouncementsPage() {
  const { user, isInitialized, isLoading } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const role = (user as any)?.role;

  if (role === 'ADMIN' || role === 'SUPERADMIN') return <AdminAnnouncementsView />;
  if (role === 'TEACHER') return <TeacherAnnouncementsView />;
  return <StudentAnnouncementsView />;
}
