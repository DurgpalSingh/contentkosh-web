'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentsService, CreateContentRequest } from '@/lib/api';
import { FileUploadArea } from '../dashboard/contents/FileUploadArea';
import { CONTENT_UPLOAD_ACCEPT, CONTENT_UPLOAD_LABEL } from '@/lib/content-upload.config';
import { validateEntityName } from '@/lib/validation';
import { Input } from '../ui/input';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBatchId?: number;
  onBatchChange: (batchId?: number) => void;
  batches: Array<{
    id?: number;
    displayName?: string;
    codeName?: string;
    courseName?: string;
  }>;
  onCreated?: () => void;
}

export function AddContentModal({
  isOpen,
  onClose,
  selectedBatchId,
  onBatchChange,
  batches,
  onCreated,
}: AddContentModalProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const reset = () => {
    setTitle('');
    setStatus('ACTIVE');
    setFile(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      setError('Please select a batch');
      return;
    }
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }
    const validationError = validateEntityName(title, 'Content title', 100);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('title', title.trim());
      if (status) form.append('status', status);

      await ContentsService.postApiBatchesContents({
        batchId: selectedBatchId,
        requestBody: form as unknown as CreateContentRequest
      });
      onCreated?.();
      reset();
      onClose();
    } catch (err: unknown) {
      console.error('Create content failed:', err);
      let message = 'Failed to upload content';
      if (typeof err === 'object' && err !== null) {
        const obj = err as Record<string, unknown>;
        const body = obj['body'] as Record<string, unknown> | undefined;
        if (body && typeof body['message'] !== 'undefined') {
          message = String(body['message']);
        } else if (typeof obj['message'] !== 'undefined') {
          message = String(obj['message']);
        } else {
          message = String(err);
        }
      } else {
        message = String(err);
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Add Content</h2>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-slate-600"><X className="h-5 w-5" /></Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">Batch <span className="text-red-500">*</span></label>
            <select
              value={selectedBatchId ?? ''}
              onChange={(e) => onBatchChange(e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 w-full border rounded px-3 py-2 bg-white"
              required
            >
              <option value="" disabled>Select a batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.displayName || b.codeName || 'Unnamed Batch'}
                  {b.courseName ? ` • ${b.courseName}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Title <span className="text-red-500">*</span></label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" maxLength={100} />
            <p className="mt-1 text-xs text-gray-500">{title.length}/100 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">File ({CONTENT_UPLOAD_LABEL}) <span className="text-red-500">*</span></label>
            <FileUploadArea
              accept={CONTENT_UPLOAD_ACCEPT}
              value={file}
              onChange={setFile}
              onError={setError}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
