'use client';

import { BatchUser } from '@/lib/api';
import { UserCog, Users } from 'lucide-react';
import { BatchMemberCard, BatchMemberRole } from './BatchMemberCard';
import { USER_ROLES } from '@/lib/constants';

interface BatchMembersPanelProps {
  role: BatchMemberRole;
  members: BatchUser[];
  onViewDetails: (member: BatchUser, role: BatchMemberRole) => void;
  onDeleteMember?: (member: BatchUser, role: BatchMemberRole) => void;
  deletingUserId?: number | null;
}

export function BatchMembersPanel({ role, members, onViewDetails, onDeleteMember, deletingUserId = null }: BatchMembersPanelProps) {
  const title = role === USER_ROLES.TEACHER ? 'Assigned Teachers' : 'Enrolled Students';
  const Icon = role === USER_ROLES.TEACHER ? UserCog : Users;
  const emptyMessage =
    role === USER_ROLES.TEACHER
      ? 'No teachers assigned to this batch yet.'
      : 'No students enrolled in this batch yet.';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          {title} <span className="text-slate-400 font-normal ml-2">({members.length})</span>
        </h2>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <Icon className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {members.map((member) => (
            <BatchMemberCard
              key={member.id}
              member={member}
              role={role}
              onViewDetails={onViewDetails}
              onDelete={onDeleteMember}
              isDeleting={
                deletingUserId !== null &&
                (member.userId ?? member.user?.id) === deletingUserId
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
