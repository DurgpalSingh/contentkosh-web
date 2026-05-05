'use client';

import type { Announcement } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { OverviewCard, type OverviewCardMenuItem } from '@/components/common/OverviewCard';
import { Calendar, Clock, Edit, Target, Trash2, Users } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { USER_ROLES } from '@/lib/constants';

function formatRange(start?: string, end?: string): string {
  if (!start || !end) return '';
  try {
    return `${new Date(start).toLocaleString()} → ${new Date(end).toLocaleString()}`;
  } catch {
    return '';
  }
}

function formatCreated(date?: string): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
}

function targetSummary(a: Announcement): string {
  if (a.scope === 'COURSE') {
    if (a.targetAllCourses) return 'All courses';
    const n = a.targets?.filter((t) => t.courseId != null).length ?? 0;
    return n ? `${n} course(s)` : 'Courses';
  }
  if (a.scope === 'BATCH') {
    if (a.targetAllBatches) return 'All batches';
    const n = a.targets?.filter((t) => t.batchId != null).length ?? 0;
    return n ? `${n} batch(es)` : 'Batches';
  }
  return '';
}

function audienceSummary(a: Announcement): string {
  const parts: string[] = [];
  if (a.visibleToAdmins) parts.push('Admins');
  if (a.visibleToTeachers) parts.push('Teachers');
  if (a.visibleToStudents) parts.push('Students');
  return parts.join(', ') || '—';
}

export interface AnnouncementFeedProps {
  items: Announcement[];
  emptyLabel: string;
  showActions?: boolean;
  onEdit?: (a: Announcement) => void;
  onDelete?: (a: Announcement) => void;
}

export function AnnouncementFeed({
  items,
  emptyLabel,
  showActions = false,
  onEdit,
  onDelete,
}: AnnouncementFeedProps) {
  const {user} = useAuthStore();
   const isStudent = user?.role?.toUpperCase() === USER_ROLES.STUDENT;
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4">
      {items.map((a) => (
        <li
          key={a.id}
          id={a.id != null ? `announcement-${a.id}` : undefined}
          className="scroll-mt-24"
        >
          <OverviewCard
            title={a.heading ?? 'Announcement'}
            subtitle={
              a.createdByUser?.name ? (
                <span>
                  By <span className="font-medium text-slate-700">{a.createdByUser.name}</span>
                </span>
              ) : (
                <span className="text-slate-500">Announcement details</span>
              )
            }
            badges={[
              <span
                key="scope"
                className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
              >
                {a.scope === 'COURSE' ? 'Course' : a.scope === 'BATCH' ? 'Batch' : 'Announcement'}
              </span>,
              <span
                key="active"
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  a.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {a.isActive ? 'Active' : 'Inactive'}
              </span>,
            ]}
            menuItems={
              showActions && (onEdit || onDelete)
                ? ([
                    ...(onEdit
                      ? ([
                          {
                            label: 'Edit',
                            icon: Edit,
                            onClick: () => onEdit(a),
                          },
                        ] satisfies OverviewCardMenuItem[])
                      : []),
                    ...(onDelete
                      ? ([
                          {
                            label: 'Delete',
                            icon: Trash2,
                            onClick: () => onDelete(a),
                            variant: 'danger',
                          },
                        ] satisfies OverviewCardMenuItem[])
                      : []),
                  ] satisfies OverviewCardMenuItem[])
                : undefined
            }
          >
            <div className="space-y-3">
              <p className="whitespace-pre-wrap text-sm text-slate-700 line-clamp-4">
                {a.content || '—'}
              </p>

             {!isStudent && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex items-center text-sm text-slate-600">
                  <Clock className="mr-2 h-4 w-4 text-slate-400" />
                  <span className="line-clamp-2">{formatRange(a.startDate, a.endDate) || '—'}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                  <span>Created {formatCreated(a.createdAt)}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Target className="mr-2 h-4 w-4 text-slate-400" />
                  <span>Target: {targetSummary(a) || '—'}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Users className="mr-2 h-4 w-4 text-slate-400" />
                  <span>Audience: {audienceSummary(a)}</span>
                </div>
              </div>)}
            </div>
          </OverviewCard>
        </li>
      ))}
    </ul>
  );
}
