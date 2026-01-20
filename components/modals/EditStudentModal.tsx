'use client';

import { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Batch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StudentData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  batches: Array<Batch>;
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentData;
  allBatches: Array<Batch>;
  onStudentUpdated: () => void;
}

export function EditStudentModal({
  isOpen,
  onClose,
  student,
  allBatches,
  onStudentUpdated,
}: EditStudentModalProps) {
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [phone, setPhone] = useState(student.phone || '');
  const [isActive, setIsActive] = useState(student.isActive);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone || '');
    setIsActive(student.isActive);
    setSelectedBatchId('');
    setError(null);
  }, [isOpen, student]);

  const enrolledBatchIds = student.batches.map((b) => b.batchId);
  const availableBatches = allBatches.filter(
    (b) => !enrolledBatchIds.includes(b.id)
  );

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
        // update student API call

      onStudentUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBatch = async () => {
    if (!selectedBatchId) return;

    setLoading(true);
    setError(null);

    try {
        // add batch to student API call

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
        // remove batch from student API call

      onStudentUpdated();
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to remove batch');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Edit Student</h2>
            <p className="text-sm text-muted-foreground">
              Update student details and batch enrollment.
            </p>
          </div>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleUpdateStudent}
          className="px-6 py-5 space-y-5"
        >
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          {/* Editable Fields */}
          <div>
            <Label>Full Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={loading}
              className="h-4 w-4"
            />
            <Label htmlFor="active" className="font-normal">
              Active (can access the system)
            </Label>
          </div>

          <hr />

          {/* Current Batches */}
          {student.batches.length > 0 && (
            <div>
              <Label className="mb-2 block">Current Batches</Label>
              <div className="space-y-2">
                {student.batches.map((batch) => (
                  <div
                    key={batch.batchId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{batch.batchName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBatch(batch.batchId)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
                  className="flex-1 rounded-md border px-3 py-2 text-sm"
                  disabled={loading}
                >
                  <option value="">Select batch</option>
                  {availableBatches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.codeName}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={handleAddBatch}
                  disabled={!selectedBatchId || loading}
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}