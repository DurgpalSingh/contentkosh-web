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

function getMemberUserId(member: BatchUser): number | null {
  return member.userId ?? member.user?.id ?? null;
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
  const [batch, setBatch] = useState<Batch | null>(null);
  const [members, setMembers] = useState<BatchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
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

  const loadBatchMembers = useCallback(async (targetBatchId: number, role: 'STUDENT' | 'TEACHER') => {
    const membersRes = await BatchUsersService.getApiBatchesUsers(targetBatchId, role);
    setMembers(toBatchUsers(membersRes));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!hasValidBatchId) {
      setError('Invalid batch ID');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchBatchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const existingBatch = allBatches.find((item) => item.id === batchId) ?? null;
        if (existingBatch) {
          setBatch(existingBatch);
          return;
        }

        const allBatchesRes = await BatchesService.getApiBatchesAll('batchUsers');
        if (!isMounted) return;

        const fetchedBatches = toBatches(allBatchesRes);
        const parsedBatch = fetchedBatches.find((item) => item.id === batchId) ?? null;
        if (!parsedBatch) {
          setError('Batch not found');
          setBatch(null);
          return;
        }

        setBatch(parsedBatch);
        const uniqueById = new Map<number, Batch>();
        fetchedBatches.forEach((item) => {
          if (item.id) uniqueById.set(item.id, item);
        });
        if (parsedBatch.id) {
          uniqueById.set(parsedBatch.id, parsedBatch);
        }
        const sortedBatches = Array.from(uniqueById.values()).sort((a, b) =>
          (a.displayName || a.codeName || '').localeCompare(b.displayName || b.codeName || '')
        );
        setAllBatches(sortedBatches);
      } catch (requestError) {
        console.error('Failed to load batch details:', requestError);
        if (!isMounted) return;
        setError('Failed to load batch details. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBatchDetails();

    return () => {
      isMounted = false;
    };
  }, [allBatches, batchId, hasValidBatchId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !hasValidBatchId) return;

    let isMounted = true;

    const fetchMembersByTab = async () => {
      try {
        const role = activeTab === 'students' ? 'STUDENT' : 'TEACHER';
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
      { id: 'students', label: 'Students', icon: Users },
      { id: 'teachers', label: 'Teachers', icon: UserCog },
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
      router.push(`/${slug}/dashboard/batches`);
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
      const role = activeTab === 'students' ? 'STUDENT' : 'TEACHER';
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
      const role = activeTab === 'students' ? 'STUDENT' : 'TEACHER';
      await loadBatchMembers(batch.id, role);

      if (selectedMember?.member && getMemberUserId(selectedMember.member) === userId) {
        setSelectedMember(null);
      }
      setMemberToDelete(null);
    } catch (requestError) {
      console.error('Failed to remove member from batch:', requestError);
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
    <div className="space-y-8 pb-12">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer min-w-[200px] hover:bg-slate-100 transition-colors"
                  value={batch?.id || ''}
                  onChange={handleBatchChange}
                >
                  <option value="" disabled>Select a Batch</option>
                  {allBatches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.displayName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${batch.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}
              >
                {batch.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                {batch.codeName || '-'}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'} -{' '}
                {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
          <Button variant="ghost" onClick={goToBatchesList} className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
          </Button>
        </div>
      </div>

      <div>
        <BatchMembersTabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as 'students' | 'teachers')} />

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={memberSearch}
              onChange={(event) => setMemberSearch(event.target.value)}
              placeholder="Search by name, email, or user ID"
              className="pl-9"
            />
          </div>
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === 'students' ? 'Add Student' : 'Add Teacher'}
            </Button>
          )}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'students' && (
            <BatchMembersPanel
              role="STUDENT"
              members={filteredMembers}
              onViewDetails={(member, role) => setSelectedMember({ member, role })}
              onDeleteMember={isAdmin ? handleDeleteMember : undefined}
              deletingUserId={deletingUserId}
            />
          )}

          {activeTab === 'teachers' && (
            <BatchMembersPanel
              role="TEACHER"
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
          role={activeTab === 'students' ? 'STUDENT' : 'TEACHER'}
          businessId={business.id}
          selectedBatchId={batch.id}
          batches={allBatches}
          onClose={() => setIsAddModalOpen(false)}
          onAdded={handleMemberAdded}
        />
      )}

      <BatchMemberDetailsModal
        member={selectedMember?.member ?? null}
        role={selectedMember?.role ?? 'STUDENT'}
        onClose={() => setSelectedMember(null)}
      />

      <DeleteConfirmModal
        isOpen={Boolean(memberToDelete)}
        onClose={() => setMemberToDelete(null)}
        onConfirm={confirmDeleteMember}
        title={`Remove ${memberToDelete?.role === 'TEACHER' ? 'Teacher' : 'Student'}`}
        message="Are you sure you want to remove this member from the batch?"
        itemName={memberToDelete?.member.user?.name || memberToDelete?.member.user?.email || 'Selected member'}
      />
    </div>
  );
}
