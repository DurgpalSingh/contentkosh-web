'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, Bell, BookOpen, Clock, FileText, GraduationCap } from 'lucide-react';
import { DashboardService } from '@/lib/api';
import { isStudentDashboardData, StudentDashboardData } from '@/lib/api/models/Dashboard';
import { studentTestBasePath } from '@/lib/tests/studentTestCatalog';
import { formatDateTime } from '@/lib/tests/testUiMappers';

const formatDate = (value: string) => new Date(value).toLocaleDateString();

export function StudentDashboard() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await DashboardService.getApiDashboard();
        if (!response.data || !isStudentDashboardData(response.data)) {
          throw new Error('Invalid dashboard response for student');
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

  const highlightedExam = useMemo(() => {
    const now = Date.now();

    return (data?.recentExams ?? [])
      .map((exam) => {
        const startMs = new Date(exam.startAt).getTime();
        const deadlineMs = new Date(exam.deadlineAt).getTime();
        return {
          ...exam,
          isLive: startMs <= now && now <= deadlineMs,
          startMs,
          deadlineMs,
        };
      })
      .filter((exam) => now <= exam.deadlineMs)
      .sort((a, b) => {
        const priorityDiff = Number(b.isLive) - Number(a.isLive);
        if (priorityDiff !== 0) return priorityDiff;
        return (a.isLive ? a.deadlineMs : a.startMs) - (b.isLive ? b.deadlineMs : b.startMs);
      })[0];
  }, [data?.recentExams]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-24 sm:h-28 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
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
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-cyan-50 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">My Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Your batches, content updates, and announcements in a single view.</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Enrolled Batches" value={data.stats.enrolledBatches} tone="blue" icon={<GraduationCap className="h-5 w-5 sm:h-8 sm:w-8" />} />
        <StatCard title="Available Content" value={data.stats.totalContent} tone="green" icon={<BookOpen className="h-5 w-5 sm:h-8 sm:w-8" />} />
        <StatCard title="Announcements" value={data.stats.activeAnnouncements} tone="amber" icon={<Bell className="h-5 w-5 sm:h-8 sm:w-8" />} />
        <StatCard title="Recent Content" value={data.recentContent.length} tone="indigo" icon={<FileText className="h-5 w-5 sm:h-8 sm:w-8" />} />
      </section>

      {highlightedExam && (
        <section
          role="button"
          tabIndex={0}
          onClick={() => router.push(studentTestBasePath(slug))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              router.push(studentTestBasePath(slug));
            }
          }}
          className="cursor-pointer rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-blue-700">
                  <Clock className="h-3.5 w-3.5" />
                  {highlightedExam.isLive ? 'Live exam' : 'Upcoming exam'}
                </span>
                <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                  {highlightedExam.isLive ? 'Available now' : 'Starts soon'}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 break-words">{highlightedExam.name}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {highlightedExam.batchName || 'Batch'}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                {highlightedExam.isLive
                  ? `Deadline: ${formatDateTime(highlightedExam.deadlineAt)}`
                  : `Starts: ${formatDateTime(highlightedExam.startAt)}`}
              </p>
            </div>
            <div className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
              Open My Tests <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <Panel title="My Batches" subtitle="Current batches you are enrolled in">
          {data.myBatches.length === 0 && <EmptyState message="No batches found." />}
          {data.myBatches.map((batch) => (
            <div key={batch.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="font-semibold text-slate-900 truncate" title={batch.displayName}>{batch.displayName}</p>
              <p className="text-sm text-slate-500 truncate" title={batch.courseName}>{batch.courseName}</p>
              <p className="mt-1 text-xs text-slate-500">
                {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
              </p>
            </div>
          ))}
        </Panel>

        <Panel title="Recent Content" subtitle="Latest content published to your batches">
          {data.recentContent.length === 0 && <EmptyState message="No content found." />}
          {data.recentContent.map((content) => (
            <div key={content.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="font-semibold text-slate-900 truncate" title={content.title}>{content.title}</p>
              <p className="text-sm text-slate-500 truncate" title={`${content.batchName} | ${content.type}`}>
                {content.batchName} | {content.type}
              </p>
              <p className="mt-1 text-xs text-slate-500">{formatDate(content.createdAt)}</p>
            </div>
          ))}
        </Panel>
      </section>

      <Panel title="Recent Announcements" subtitle="Active announcements visible to students">
        {data.recentAnnouncements.length === 0 && <EmptyState message="No announcements found." />}
        {data.recentAnnouncements.map((announcement) => (
          <div key={announcement.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="font-semibold text-slate-900 break-words" title={announcement.heading}>{announcement.heading}</p>
            <p className="mt-1 text-sm text-slate-600 line-clamp-3 break-words" title={announcement.content}>{announcement.content}</p>
            <p className="mt-2 text-xs text-slate-500">
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
  tone: 'blue' | 'green' | 'indigo' | 'amber';
}) {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    indigo: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
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
