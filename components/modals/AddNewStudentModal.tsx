'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { Batch, UsersService, BatchUsersService, User } from '@/lib/api';

interface AddNewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: () => void;
  batches: Array<Batch>;
}

export function AddNewStudentModal({
  isOpen,
  onClose,
  onStudentAdded,
  batches,
}: AddNewStudentModalProps) {
  const { business } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showUserList, setShowUserList] = useState(false);

  const resetForm = () => {
    setSearchQuery('');
    setSelectedUser(null);
    setBatchId('');
    setError(null);
    setAvailableUsers([]);
    setShowUserList(false);
  };

  const searchUsers = async (query: string) => {
    if (!business?.id || query.length < 2) {
      setAvailableUsers([]);
      setShowUserList(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await UsersService.getApiBusinessUsers(business.id, 'STUDENT');
      const users = response.data ?? [];
      
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(query.toLowerCase()) ||
        user.email?.toLowerCase().includes(query.toLowerCase())
      );
      
      setAvailableUsers(filtered);
      setShowUserList(true);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, business?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || !batchId) {
      setError('Please select a student and batch');
      return;
    }

    if (!business?.id) {
      setError('Business not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Add user to selected batch
      await BatchUsersService.postApiBatchesAddUser({
        requestBody: {
          userId: selectedUser.id!,
          batchId: parseInt(batchId),
        },
      });

      resetForm();
      onStudentAdded();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'body' in err 
        ? (err.body as { message?: string })?.message 
        : 'Failed to add student to batch';
      setError(errorMessage || 'Failed to add student to batch');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Add Student to Batch</h2>
            <p className="text-sm text-muted-foreground">
              Search and add an existing student to a batch.
            </p>
          </div>
          <button onClick={handleClose}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="relative">
            <Label>Search Student *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedUser(null);
                }}
                disabled={loading}
                className="pl-10"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {/* User Selection List */}
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
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </button>
                ))}
              </div>
            )}

            {showUserList && availableUsers.length === 0 && searchQuery.length >= 2 && !searchLoading && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 text-center text-gray-500">
                No students found
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="font-medium text-blue-900">{selectedUser.name}</div>
              <div className="text-sm text-blue-700">{selectedUser.email}</div>
              <div className="text-xs text-blue-600 mt-1">Selected Student</div>
            </div>
          )}

          <div>
            <Label>Batch *</Label>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              disabled={loading}
              className="
                w-full rounded-md border border-input bg-background px-3 py-2 text-black
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              <option value="">Select batch</option>
              {batches.length > 0 && batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.codeName}
                </option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
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