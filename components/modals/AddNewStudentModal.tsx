'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { Batch } from '@/lib/api';

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

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setBatchId('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !batchId) {
      setError('Please fill all required fields');
      return;
    }

    if (!business?.id) {
      setError('Business not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // add student API call

      resetForm();
      onStudentAdded();
      onClose();
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to add student');
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
            <h2 className="text-lg font-semibold">Add New Student</h2>
            <p className="text-sm text-muted-foreground">
              Enroll a new student in a batch.
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

          <div>
            <Label>Full Name *</Label>
            <Input
              placeholder="Enter student name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              placeholder="student@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>

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
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}