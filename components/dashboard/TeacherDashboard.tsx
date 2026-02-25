'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Bell, BookOpen, GraduationCap, Users } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { isTeacherDashboardData, TeacherDashboardData } from '@/types/dashboard';

const formatDate = (value: string) => new Date(value).toLocaleDateString();

export function TeacherDashboard() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardService.getDashboard();
        if (!isTeacherDashboardData(response)) {
          throw new Error('Invalid dashboard response for teacher');
        }
        setData(response);
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
      <div className="space-y-4">
        <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
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
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-emerald-50 p-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teacher Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Track your batches, students, and content activity in one place.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="My Batches" value={data.stats.totalBatches} tone="blue" icon={<GraduationCap className="h-8 w-8" />} />
        <StatCard title="Total Students" value={data.stats.totalStudents} tone="green" icon={<Users className="h-8 w-8" />} />
        <StatCard title="My Content" value={data.stats.totalContent} tone="indigo" icon={<BookOpen className="h-8 w-8" />} />
        <StatCard title="Announcements" value={data.stats.activeAnnouncements} tone="amber" icon={<Bell className="h-8 w-8" />} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Panel title="My Batches" subtitle="Batches where you are currently active">
          {data.myBatches.length === 0 && <EmptyState message="No batches found." />}
          {data.myBatches.map((batch) => (
            <div key={batch.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{batch.displayName}</p>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">{batch.studentCount} students</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{batch.courseName}</p>
            </div>
          ))}
        </Panel>

        <Panel title="Recent Content" subtitle="Latest content uploaded by you">
          {data.recentContent.length === 0 && <EmptyState message="No content found." />}
          {data.recentContent.map((content) => (
            <div key={content.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="font-semibold text-slate-900">{content.title}</p>
              <p className="text-sm text-slate-500">{content.batchName}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDate(content.createdAt)}</p>
            </div>
          ))}
        </Panel>
      </section>

      <Panel title="Recent Announcements" subtitle="Active announcements visible to teachers">
        {data.recentAnnouncements.length === 0 && <EmptyState message="No announcements found." />}
        {data.recentAnnouncements.map((announcement) => (
          <div key={announcement.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="font-semibold text-slate-900">{announcement.heading}</p>
            <p className="mt-1 text-xs text-slate-500">
              {formatDate(announcement.startDate)} - {formatDate(announcement.endDate)}
            </p>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
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
  tone: 'blue' | 'green' | 'indigo' | 'amber';
}) {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    indigo: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl border p-2 ${toneMap[tone]}`}>{icon}</div>
      </div>
    </article>
  );
}
