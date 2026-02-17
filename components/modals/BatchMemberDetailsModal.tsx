'use client';

import { BatchUser } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { UserCog, Users } from 'lucide-react';
import { BatchMemberRole } from './BatchMemberCard';

interface BatchMemberDetailsModalProps {
  member: BatchUser | null;
  role: BatchMemberRole;
  onClose: () => void;
}

export function BatchMemberDetailsModal({ member, role, onClose }: BatchMemberDetailsModalProps) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`px-6 py-4 border-b border-slate-100 flex justify-between items-center ${
            role === 'TEACHER' ? 'bg-purple-50' : 'bg-blue-50'
          }`}
        >
          <h3 className="text-lg font-bold text-slate-800">Member Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div
              className={`h-16 w-16 rounded-full flex items-center justify-center border-2 ${
                role === 'TEACHER'
                  ? 'bg-purple-100 text-purple-600 border-purple-200'
                  : 'bg-blue-100 text-blue-600 border-blue-200'
              }`}
            >
              {role === 'TEACHER' ? <UserCog className="h-8 w-8" /> : <Users className="h-8 w-8" />}
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">{member.user?.name || 'Unknown'}</h4>
              <p className="text-slate-500 text-sm">{member.user?.email || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-400 uppercase font-semibold">Joined Batch</p>
              <p className="text-sm font-medium text-slate-700 mt-1">
                {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-400 uppercase font-semibold">Status</p>
              <p className="text-sm font-medium text-slate-700 mt-1">{member.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-400 uppercase font-semibold">Role</p>
              <p className="text-sm font-medium text-slate-700 mt-1">{role}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-400 uppercase font-semibold">User ID</p>
              <p className="text-sm font-medium text-slate-700 mt-1">{member.userId ?? '-'}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
