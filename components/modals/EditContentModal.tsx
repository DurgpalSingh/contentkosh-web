'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentsService, Content, UpdateContentRequest } from '@/lib/api';
import { validateEntityName } from '@/lib/validation';
import { Input } from '../ui/input';
import { toast } from 'sonner';

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content;
  onUpdated?: () => void;
}

export function EditContentModal({ isOpen, onClose, content, onUpdated }: EditContentModalProps) {
  const [title, setTitle] = useState(content.title || '');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(content.status || 'ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(content.title || '');
    setStatus(content.status || 'ACTIVE');
  }, [content]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }
    const validationError = validateEntityName(title, 'Content title', 100);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const body: UpdateContentRequest = {
        title: title.trim(),
        status,
      };
      await ContentsService.putApiContents({ contentId: content.id!, requestBody: body });
      onUpdated?.();
      onClose();
      toast.success('Content updated successfully');
    } catch (err: unknown) {
      console.error('Update content failed:', err);
      let message = 'Failed to update content.';
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Edit Content</h2>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-slate-600"><X className="h-5 w-5" /></Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" maxLength={100} />
            <p className="mt-1 text-xs text-gray-500">{title.length}/100 characters</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
