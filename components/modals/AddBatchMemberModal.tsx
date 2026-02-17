'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Batch, BatchUsersService, User, UsersService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BatchMemberRole } from '../dashboard/batches/BatchMemberCard';
import { USER_ROLES } from '@/lib/constants';
import { TAB_ROLES } from '@/app/[slug]/dashboard/batches/[batchId]/page';

interface AddBatchMemberModalProps {
  isOpen: boolean;
  role: BatchMemberRole;
  businessId: number;
  selectedBatchId: number;
  batches: Batch[];
  onClose: () => void;
  onAdded: (batchId: number) => void;
}

type BusinessUserRow = {
  id?: number;
  role?: string;
  createdAt?: string;
  user: {
    id?: number;
    name?: string;
    email?: string;
    mobile?: string | null;
  };
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const body = (error as { body?: { message?: string } }).body;
    if (body?.message) return body.message;
  }
  return fallback;
}

function getBatchLabel(batch: Batch) {
  if (batch.displayName && batch.codeName) return `${batch.displayName} (${batch.codeName})`;
  return batch.displayName || batch.codeName || 'Unnamed Batch';
}

function filterBusinessUsers(users: BusinessUserRow[] | undefined, query: string): User[] {
  const lowerQuery = query.trim().toLowerCase();
  if (!users?.length || !lowerQuery) return [];

  const filtered: User[] = [];
  for (const row of users) {
    const user = row?.user;
    const name = user?.name?.toLowerCase() || '';
    const email = user?.email?.toLowerCase() || '';
    const matches = name.includes(lowerQuery) || email.includes(lowerQuery);

    if (user?.id && matches) {
      filtered.push(user as User);
    }
  }

  return filtered;
}

export function AddBatchMemberModal({
  isOpen,
  role,
  businessId,
  selectedBatchId,
  batches,
  onClose,
  onAdded,
}: AddBatchMemberModalProps) {
  const roleLabel = role === USER_ROLES.STUDENT ? TAB_ROLES.STUDENT : TAB_ROLES.TEACHER;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showUserList, setShowUserList] = useState(false);

  const resetForm = useCallback(() => {
    setSearchQuery('');
    setSelectedUser(null);
    setBatchId(String(selectedBatchId));
    setError(null);
    setAvailableUsers([]);
    setShowUserList(false);
    setSearchLoading(false);
  }, [selectedBatchId]);

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
  }, [isOpen, resetForm]);

  useEffect(() => {
    if (!isOpen) return;

    const query = searchQuery.trim();

    const timeoutId = setTimeout(() => {
      if (query.length < 3) {
        setAvailableUsers([]);
        setShowUserList(false);
        setSearchLoading(false);
        setError(null);
        return;
      }

      let isMounted = true;

      const fetchAndFilterUsers = async () => {
        try {
          setSearchLoading(true);
          setError(null);

          const userResponse = await UsersService.getApiBusinessUsers(businessId, role);
          const users = userResponse?.data as BusinessUserRow[] | undefined;
          const filtered = filterBusinessUsers(users, query);

          if (!isMounted) return;
          setAvailableUsers(filtered as User[]);
          setShowUserList(true);
        } catch (requestError) {
          if (!isMounted) return;
          console.error('Error searching users:', requestError);
          setAvailableUsers([]);
          setShowUserList(true);
          setError(getErrorMessage(requestError, `Failed to search ${roleLabel.toLowerCase()}s`));
        } finally {
          if (isMounted) setSearchLoading(false);
        }
      };

      fetchAndFilterUsers();

      return () => {
        isMounted = false;
      };
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [businessId, isOpen, role, roleLabel, searchQuery]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedUser || !batchId) {
      setError(`Please select a ${roleLabel.toLowerCase()} and batch`);
      return;
    }

    const targetBatchId = Number(batchId);
    if (!targetBatchId || !selectedUser.id) {
      setError('Invalid selection');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await BatchUsersService.postApiBatchesAddUser({
        userId: selectedUser.id,
        batchId: targetBatchId,
      });
      onAdded(targetBatchId);
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError, `Failed to add ${roleLabel.toLowerCase()} to batch`));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      <div className="relative w-full max-w-md rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Add {roleLabel} to Batch</h2>
            <p className="text-sm text-muted-foreground">
              Search and add an existing {roleLabel.toLowerCase()} to a batch.
            </p>
          </div>
          <button onClick={handleClose} type="button">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="relative">
            <Label>Search {roleLabel} *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Search by name or email...`}
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSelectedUser(null);
                }}
                disabled={loading}
                className="pl-10"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>

            {showUserList && availableUsers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(user);
                      setSearchQuery(user.name || '');
                      setShowUserList(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{user.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{user.email || '-'}</div>
                  </button>
                ))}
              </div>
            )}

            {showUserList && availableUsers.length === 0 && searchQuery.length >= 3 && !searchLoading && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 text-center text-gray-500">
                No {roleLabel.toLowerCase()}s found
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="font-medium text-blue-900">{selectedUser.name || 'Unknown'}</div>
              <div className="text-sm text-blue-700">{selectedUser.email || '-'}</div>
              <div className="text-xs text-blue-600 mt-1">Selected {roleLabel}</div>
            </div>
          )}

          <div>
            <Label>Batch *</Label>
            <select
              value={batchId}
              onChange={(event) => setBatchId(event.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {getBatchLabel(batch)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedUser}>
              {loading ? 'Adding...' : 'Add to Batch'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
