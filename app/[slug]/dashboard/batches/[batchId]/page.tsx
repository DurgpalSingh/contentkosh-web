'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, ChevronDown, Filter, Plus, Search, UserCog, Users } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Batch, BatchUser, BatchUsersService, BatchesService } from '@/lib/api';
import { USER_ROLES } from '@/lib/constants';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { BatchMembersTabs } from '@/components/dashboard/batches/BatchMembersTabs';
import { BatchMembersPanel } from '@/components/dashboard/batches/BatchMembersPanel';
import { BatchMemberDetailsModal } from '@/components/modals/BatchMemberDetailsModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { BatchMemberRole } from '@/components/dashboard/batches/BatchMemberCard';
import { Input } from '@/components/ui/input';
import { AddBatchMemberModal } from '@/components/modals/AddBatchMemberModal';
import { toast } from 'sonner';

export const TAB_ROLES = {
  TEACHER: 'Teacher',
  STUDENT: 'Student',
} as const;

type MemberTab = typeof TAB_ROLES.STUDENT | typeof TAB_ROLES.TEACHER;

type ApiResponse<T> = {
  data?: T;
};

function hasDataProperty<T>(response: unknown): response is ApiResponse<T> {
  return typeof response === 'object' && response !== null && 'data' in response;
}

function getResponseData<T>(response: unknown): T | null {
  if (!response) return null;
  if (hasDataProperty<T>(response)) {
    return response.data ?? null;
  }
  return response as T;
}

function toBatchUsers(response: unknown): BatchUser[] {
  const data = getResponseData<unknown>(response);
  return Array.isArray(data) ? (data as BatchUser[]) : [];
}

function toBatches(response: unknown): Batch[] {
  const data = getResponseData<unknown>(response);
  return Array.isArray(data) ? (data as Batch[]) : [];
}

function getSortedBatches(batches: Batch[]): Batch[] {
  return [...batches].sort((a, b) =>
    (a.displayName || a.codeName || '').localeCompare(b.displayName || b.codeName || '')
  );
}

function getMemberUserId(member: BatchUser): number | null {
  return member.userId ?? member.user?.id ?? null;
}

function getRoleFromTab(tab: MemberTab): typeof USER_ROLES.STUDENT | typeof USER_ROLES.TEACHER {
  return tab === TAB_ROLES.STUDENT ? USER_ROLES.STUDENT : USER_ROLES.TEACHER;
}

export default function BatchDetailsPage() {
  const { user: currentUser, business, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const params = useParams<{ slug: string; batchId: string }>();
  const router = useRouter();

  const batchId = Number(params?.batchId);
  const hasValidBatchId = Number.isInteger(batchId) && batchId > 0;
  const slug = params?.slug;
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [batchById, setBatchById] = useState<Map<number, Batch>>(new Map());
  const [batch, setBatch] = useState<Batch | null>(null);
  const [members, setMembers] = useState<BatchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MemberTab>(TAB_ROLES.STUDENT);
  const [memberSearch, setMemberSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<{
    member: BatchUser;
    role: BatchMemberRole;
  } | null>(null);
  const [selectedMember, setSelectedMember] = useState<{
    member: BatchUser;
    role: BatchMemberRole;
  } | null>(null);

  const fetchBatchDetails = useCallback(async () => {
    if (!hasValidBatchId) {
      setError('Invalid batch ID');
      setBatch(null);
      setLoading(false);
      return;
    }

    // Reuse cached batches to avoid refetching on batch switch.
    if (batchById.size > 0) {
      const cachedBatch = batchById.get(batchId) ?? null;
      setBatch(cachedBatch);
      setError(cachedBatch ? null : 'Batch not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const allBatchesRes = await BatchesService.getApiBatchesAll();
      const sortedBatches = getSortedBatches(toBatches(allBatchesRes));
      const fetchedBatchById = new Map(sortedBatches.map((item) => [item.id, item]));
      const targetBatch = fetchedBatchById.get(batchId) ?? null;

      setBatchById(fetchedBatchById as Map<number, Batch>);
      setAllBatches(sortedBatches);
      setBatch(targetBatch);
      if (!targetBatch) setError('Batch not found');
    } catch (requestError) {
      console.error('Failed to load batch details:', requestError);
      setError('Failed to load batch details. Please try again.');
      setBatch(null);
    } finally {
      setLoading(false);
    }
  }, [batchById, batchId, hasValidBatchId]);

  const loadBatchMembers = useCallback(async (targetBatchId: number, role: BatchMemberRole) => {
    const membersRes = await BatchUsersService.getApiBatchesUsers(targetBatchId, role);
    setMembers(toBatchUsers(membersRes));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchBatchDetails();
  }, [fetchBatchDetails, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !hasValidBatchId) return;

    let isMounted = true;

    const fetchMembersByTab = async () => {
      try {
        const role = getRoleFromTab(activeTab);
        await loadBatchMembers(batchId, role);
      } catch (requestError) {
        console.error('Failed to load batch members:', requestError);
        if (!isMounted) return;
        setError('Failed to load batch members. Please try again.');
      }
    };

    fetchMembersByTab();

    return () => {
      isMounted = false;
    };
  }, [activeTab, batchId, hasValidBatchId, isAuthenticated, loadBatchMembers]);

  const tabs = useMemo(
    () => [
      { id: TAB_ROLES.STUDENT, label: TAB_ROLES.STUDENT, icon: Users },
      { id: TAB_ROLES.TEACHER, label: TAB_ROLES.TEACHER, icon: UserCog },
    ],
    []
  );

  function filterBatchMembers(members: BatchUser[], search: string): BatchUser[] {
    const query = search.trim().toLowerCase();
    if (!query) return members;

    return members.filter((member) => {
      const name = member.user?.name?.toLowerCase() || '';
      const email = member.user?.email?.toLowerCase() || '';
      return name.includes(query) || email.includes(query) || String(member.userId || '').includes(query);
    });
  }


  const filteredMembers = useMemo(() => filterBatchMembers(members, memberSearch), [memberSearch, members]);

  const goToBatchesList = () => {
    if (slug) {
      router.push(`/${slug}/dashboard/batches?${batch?.courseId ? `courseId=${batch?.courseId}` : ''}`);
      return;
    }
    router.back();
  };

  const handleBatchChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    if (!slug || !selectedId || selectedId === batchId) return;
    router.push(`/${slug}/dashboard/batches/${selectedId}`);
  };

  const handleMemberAdded = async (targetBatchId: number) => {
    if (targetBatchId === batchId) {
      const role = getRoleFromTab(activeTab);
      await loadBatchMembers(targetBatchId, role);
      return;
    }
  };

  const handleDeleteMember = async (member: BatchUser, role: BatchMemberRole) => {
    if (!getMemberUserId(member)) return;
    setMemberToDelete({ member, role });
  };

  const confirmDeleteMember = async () => {
    if (!batch?.id || !memberToDelete?.member) {
      throw new Error('Invalid member or batch');
    }

    const userId = getMemberUserId(memberToDelete.member);
    if (!userId) {
      throw new Error('Invalid member user ID');
    }

    try {
      setDeletingUserId(userId);
      await BatchUsersService.postApiBatchesRemoveUser({
        userId,
        batchId: batch.id,
      });
      const role = getRoleFromTab(activeTab);
      await loadBatchMembers(batch.id, role);
      toast.success(`${memberToDelete.role === USER_ROLES.TEACHER ? 'Teacher' : 'Student'} removed from batch`);

      if (selectedMember?.member && getMemberUserId(selectedMember.member) === userId) {
        setSelectedMember(null);
      }
      setMemberToDelete(null);
    } catch (requestError) {
      console.error('Failed to remove member from batch:', requestError);
      toast.error('Failed to remove member. Please try again.');
      throw requestError;
    } finally {
      setDeletingUserId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="p-8 text-center text-red-600 mb-4 bg-red-50 rounded-lg">
        <p>{error || 'Batch not found'}</p>
        <Button variant="outline" onClick={goToBatchesList} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Batches
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-full flex-col gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  className="w-full min-w-60 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm font-semibold text-slate-900 outline-none transition-colors hover:bg-slate-100 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  value={batch?.id || ''}
                  onChange={handleBatchChange}
                >
                  <option value="" disabled>Select a Batch</option>
                  {allBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.displayName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${batch.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}
              >
                {batch.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs">
                {batch.codeName || '-'}
              </span>
              <span className="flex items-center">
                <Calendar className="mr-1.5 h-4 w-4" />
                {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'} -{' '}
                {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <Button variant="ghost" onClick={goToBatchesList} className="w-full text-slate-600 hover:text-slate-900 sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="z-10 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="px-4 pt-4 sm:px-6">
            <BatchMembersTabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as MemberTab)} />
          </div>

          <div className="flex flex-col gap-3 px-4 pb-4 pt-3 sm:px-6 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Search by name, email, or user ID"
                className="pl-9"
              />
            </div>
            {isAdmin && (
              <Button onClick={() => setIsAddModalOpen(true)} className="w-full lg:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {activeTab === TAB_ROLES.STUDENT ? 'Add Student' : 'Add Teacher'}
              </Button>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {activeTab === TAB_ROLES.STUDENT && (
            <BatchMembersPanel
              role={USER_ROLES.STUDENT}
              members={filteredMembers}
              onViewDetails={(member, role) => setSelectedMember({ member, role })}
              onDeleteMember={isAdmin ? handleDeleteMember : undefined}
              deletingUserId={deletingUserId}
            />
          )}

          {activeTab === TAB_ROLES.TEACHER && (
            <BatchMembersPanel
              role={USER_ROLES.TEACHER}
              members={filteredMembers}
              onViewDetails={(member, role) => setSelectedMember({ member, role })}
              onDeleteMember={isAdmin ? handleDeleteMember : undefined}
              deletingUserId={deletingUserId}
            />
          )}
        </div>
      </div>

      {isAdmin && business?.id && batch.id && (
        <AddBatchMemberModal
          isOpen={isAddModalOpen}
          role={getRoleFromTab(activeTab)}
          businessId={business.id}
          selectedBatchId={batch.id}
          batches={allBatches}
          onClose={() => setIsAddModalOpen(false)}
          onAdded={handleMemberAdded}
        />
      )}

      <BatchMemberDetailsModal
        member={selectedMember?.member ?? null}
        role={selectedMember?.role ?? USER_ROLES.STUDENT}
        onClose={() => setSelectedMember(null)}
      />

      <DeleteConfirmModal
        isOpen={Boolean(memberToDelete)}
        onClose={() => setMemberToDelete(null)}
        onConfirm={confirmDeleteMember}
        title={`Remove ${memberToDelete?.role === USER_ROLES.TEACHER ? 'Teacher' : 'Student'}`}
        message="Are you sure you want to remove this member from the batch?"
        itemName={memberToDelete?.member.user?.name || memberToDelete?.member.user?.email || 'Selected member'}
      />
    </div>
  );
}
