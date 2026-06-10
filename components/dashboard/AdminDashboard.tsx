'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Bell, BookOpen, GraduationCap, Users } from 'lucide-react';
import { DashboardService } from '@/lib/api';
import { AdminDashboardData, isAdminDashboardData } from '@/lib/api/models/Dashboard';

const formatDate = (value: string) => new Date(value).toLocaleDateString();

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await DashboardService.getApiDashboard();
        if (!response.data || !isAdminDashboardData(response.data)) {
          throw new Error('Invalid dashboard response for admin');
        }
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-24 sm:h-28 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-24 sm:h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error || 'Failed to load dashboard'}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">My Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Live institute overview with users, courses, and announcements.</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total Users" value={data.stats.totalUsers} tone="blue" icon={<Users className="h-5 w-5 sm:h-8 sm:w-8" />} />
        <StatCard title="Teachers" value={data.stats.totalTeachers} tone="green" icon={<Users className="h-5 w-5 sm:h-8 sm:w-8" />} />
        <StatCard title="Students" value={data.stats.totalStudents} tone="indigo" icon={<GraduationCap className="h-5 w-5 sm:h-8 sm:w-8" />} />
        <StatCard title="Announcements" value={data.stats.activeAnnouncements} tone="amber" icon={<Bell className="h-5 w-5 sm:h-8 sm:w-8" />} />
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Active Exams" value={data.stats.totalExams} tone="slate" icon={<BookOpen className="h-5 w-5 sm:h-8 sm:w-8" />} />
        <StatCard title="Active Courses" value={data.stats.totalCourses} tone="slate" icon={<BookOpen className="h-5 w-5 sm:h-8 sm:w-8" />} />
        <StatCard title="Active Batches" value={data.stats.totalBatches} tone="slate" icon={<GraduationCap className="h-5 w-5 sm:h-8 sm:w-8" />} />
        <StatCard title="Active Content" value={data.stats.totalContent} tone="slate" icon={<BookOpen className="h-5 w-5 sm:h-8 sm:w-8" />} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <Panel title="Recent Users" subtitle="Latest active users in your business">
          {data.recentUsers.length === 0 && <EmptyState message="No users found." />}
          {data.recentUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate" title={user.name}>{user.name}</p>
                <p className="text-sm text-slate-500 truncate" title={user.email}>{user.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 max-w-24 truncate">{user.role}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Recent Announcements" subtitle="Active announcements visible to admins">
          {data.recentAnnouncements.length === 0 && <EmptyState message="No announcements found." />}
          {data.recentAnnouncements.map((announcement) => (
            <div key={announcement.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="font-semibold text-slate-900 truncate" title={announcement.heading}>{announcement.heading}</p>
              <p className="mt-1 text-xs text-slate-500">
                {formatDate(announcement.startDate)} - {formatDate(announcement.endDate)}
              </p>
            </div>
          ))}
        </Panel>
      </section>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mb-4 text-sm text-slate-500">{subtitle}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">{message}</p>;
}

function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  tone: 'blue' | 'green' | 'indigo' | 'amber' | 'slate';
}) {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    indigo: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <article className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-500 truncate" title={title}>{title}</p>
          <p className="mt-1 text-xl sm:text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`rounded-lg sm:rounded-xl border p-1.5 sm:p-2 shrink-0 ${toneMap[tone]}`}>{icon}</div>
      </div>
    </article>
  );
}
