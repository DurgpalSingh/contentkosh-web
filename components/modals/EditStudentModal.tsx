'use client';

import { useEffect, useState } from 'react';
import { X, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Batch, BatchUsersService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface StudentBatch {
  batchId: number;
  batchName: string;
  courseName?: string;
  isActive: boolean;
}

interface StudentData {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  batches: StudentBatch[];
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentData;
  allBatches: Batch[];
  onStudentUpdated: () => void;
}

export function EditStudentModal({
  isOpen,
  onClose,
  student,
  allBatches,
  onStudentUpdated,
}: EditStudentModalProps) {
  const [localBatches, setLocalBatches] = useState<StudentBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync when modal opens or student changes
  useEffect(() => {
    if (!isOpen) return;

    setLocalBatches(student.batches);
    setSelectedBatchId('');
    setError(null);
  }, [isOpen, student]);

  const enrolledBatchIds = localBatches.map((b) => b.batchId);

  const availableBatches = allBatches.filter(
    (b) => !enrolledBatchIds.includes(b.id)
  );

  const handleAddBatch = async () => {
    if (!selectedBatchId) return;

    const batchId = Number(selectedBatchId);
    const batch = allBatches.find((b) => b.id === batchId);
    if (!batch) return;

    setLoading(true);
    setError(null);

    try {
      await BatchUsersService.postApiBatchesAddUser({
        requestBody: {
          userId: student.userId,
          batchId,
        },
      });

      // 🔥 instant UI update
      setLocalBatches((prev) => [
        ...prev,
        {
          batchId: batch.id,
          batchName: batch.displayName || batch.codeName,
          courseName: batch.courseName,
          isActive: true,
        },
      ]);

      onStudentUpdated();
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to add batch');
    } finally {
      setLoading(false);
      setSelectedBatchId('');
    }
  };

  const handleRemoveBatch = async (batchId: number) => {
    setLoading(true);
    setError(null);

    try {
      await BatchUsersService.postApiBatchesRemoveUser({
        userId: student.userId,
        batchId,
      });

      setLocalBatches((prev) =>
        prev.filter((b) => b.batchId !== batchId)
      );

      onStudentUpdated();
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to remove batch');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBatchStatus = async (
    batchId: number,
    currentStatus: boolean
  ) => {
    setLoading(true);
    setError(null);

    try {
      await BatchUsersService.putApiBatchesUsers({
        batchId,
        userId: student.userId,
        requestBody: {
          isActive: !currentStatus,
        },
      });

      setLocalBatches((prev) =>
        prev.map((b) =>
          b.batchId === batchId ? { ...b, isActive: !currentStatus } : b
        )
      );

      onStudentUpdated();
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to update batch status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-xl bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Manage Student Batches</h2>
            <p className="text-sm text-muted-foreground">
              Add, remove, or toggle batch status
            </p>
          </div>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border px-3 py-2 rounded">
              {error}
            </div>
          )}

          {/* Student Info */}
          <div className="p-3 bg-gray-50 border rounded">
            <div className="font-medium">{student.name}</div>
            <div className="text-sm text-gray-600">{student.email}</div>
          </div>

          {/* Current Batches */}
          {localBatches.length > 0 && (
            <div>
              <Label className="mb-2 block">Current Batches</Label>
              <div className="space-y-2">
                {localBatches.map((batch) => (
                  <div
                    key={batch.batchId}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {batch.batchName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {batch.courseName}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleToggleBatchStatus(
                            batch.batchId,
                            batch.isActive
                          )
                        }
                        className={
                          batch.isActive
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }
                      >
                        {batch.isActive ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          handleRemoveBatch(batch.batchId)
                        }
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Batch */}
          {availableBatches.length > 0 && (
            <div>
              <Label>Add to Batch</Label>
              <div className="flex gap-2">
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="flex-1 border rounded px-3 py-2 text-sm"
                >
                  <option value="">Select batch</option>
                  {availableBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.displayName || b.codeName}
                    </option>
                  ))}
                </select>
                <Button onClick={handleAddBatch} disabled={!selectedBatchId}>
                  Add
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}