'use client';

import { BatchUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Clock, Info, Mail, Trash2, UserCog, Users } from 'lucide-react';

export type BatchMemberRole = 'STUDENT' | 'TEACHER';

interface BatchMemberCardProps {
  member: BatchUser;
  role: BatchMemberRole;
  onViewDetails: (member: BatchUser, role: BatchMemberRole) => void;
  onDelete?: (member: BatchUser, role: BatchMemberRole) => void;
  isDeleting?: boolean;
}

export function BatchMemberCard({ member, role, onViewDetails, onDelete, isDeleting = false }: BatchMemberCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start md:items-center gap-4 flex-1">
        <div
          className={`h-14 w-14 flex-shrink-0 rounded-full flex items-center justify-center border-2 ${
            role === 'TEACHER'
              ? 'bg-purple-50 text-purple-600 border-purple-100'
              : 'bg-blue-50 text-blue-600 border-blue-100'
          }`}
        >
          {role === 'TEACHER' ? <UserCog className="h-7 w-7" /> : <Users className="h-7 w-7" />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2 w-full">
          <div className="min-w-[150px]">
            <h3 className="text-base font-bold text-slate-900 line-clamp-1" title={member.user?.name}>
              {member.user?.name || 'Unknown'}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide mt-1 ${
                role === 'TEACHER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {role}
            </span>
          </div>

          <div className="flex flex-col justify-center min-w-[200px]">
            <div className="flex items-center text-sm text-slate-600" title={member.user?.email}>
              <Mail className="h-3.5 w-3.5 mr-2 text-slate-400" />
              <span className="truncate">{member.user?.email || 'No email'}</span>
            </div>
          </div>

          <div className="flex flex-col justify-center min-w-[150px]">
            <div className="flex items-center text-sm text-slate-600">
              <Clock className="h-3.5 w-3.5 mr-2 text-slate-400" />
              <span>
                Joined {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 self-end md:self-center flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-slate-600 border-slate-300 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-colors"
          onClick={() => onViewDetails(member, role)}
        >
          <Info className="h-4 w-4 mr-2" />
          Show Details
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 border-red-300 hover:text-red-700 hover:border-red-600 hover:bg-red-50 transition-colors"
            onClick={() => onDelete(member, role)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {/* {isDeleting ? 'Removing...' : 'Remove'} */}
          </Button>
        )}
      </div>
    </div>
  );
}
