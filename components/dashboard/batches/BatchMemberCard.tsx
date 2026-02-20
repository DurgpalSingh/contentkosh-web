'use client';

import { BatchUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CalendarDays, Info, Mail, Trash2, UserCog, Users } from 'lucide-react';

export type BatchMemberRole = 'STUDENT' | 'TEACHER';

interface BatchMemberCardProps {
  member: BatchUser;
  role: BatchMemberRole;
  onViewDetails: (member: BatchUser, role: BatchMemberRole) => void;
  onDelete?: (member: BatchUser, role: BatchMemberRole) => void;
  isDeleting?: boolean;
}

export function BatchMemberCard({ member, role, onViewDetails, onDelete, isDeleting = false }: BatchMemberCardProps) {

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };
  const name = member.user?.name?.trim() || 'Unknown user';
  const email = member.user?.email?.trim() || 'No email';
  const joinedDate = member.createdAt ? formatDate(member.createdAt) : 'N/A';
  const roleTheme =
    role === 'TEACHER'
      ? {
        avatar: 'bg-purple-50 text-purple-700 border-purple-200',
        badge: 'bg-purple-100 text-purple-800 border-purple-200',
      }
      : {
        avatar: 'bg-blue-50 text-blue-700 border-blue-200',
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
      };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
        <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${roleTheme.avatar}`}
            aria-hidden="true"
          >
            {role === 'TEACHER' ? <UserCog className="h-6 w-6" /> : <Users className="h-6 w-6" />}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="max-w-full truncate text-base font-semibold text-slate-900" title={name}>
                {name}
              </h3>
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${roleTheme.badge}`}
              >
                {role}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <div className="flex min-w-0 items-center gap-2" title={email}>
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4 md:w-auto md:border-0 md:pt-0">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-700 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => onViewDetails(member, role)}
          >
            <Info className="mr-2 h-4 w-4" />
            Details
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:border-red-500 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(member, role)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {/* {isDeleting ? 'Removing...' : 'Remove'} */}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
