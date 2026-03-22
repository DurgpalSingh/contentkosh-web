'use client';

import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentSubmitTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  unansweredCount: number;
  loading: boolean;
}

export function StudentSubmitTestModal({
  isOpen,
  onClose,
  onConfirm,
  unansweredCount,
  loading,
}: StudentSubmitTestModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-test-title"
        aria-describedby="submit-test-desc"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-700" aria-hidden />
            </div>
            <h2 id="submit-test-title" className="text-xl font-semibold text-gray-900">
              Submit test?
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">
          <p id="submit-test-desc" className="text-gray-600">
            {unansweredCount > 0 ? (
              <>
                You have left{' '}
                <span className="font-semibold text-gray-900">{unansweredCount}</span> question
                {unansweredCount === 1 ? '' : 's'} unanswered. You can go back to complete them, or
                submit now.
              </>
            ) : (
              <>You have answered all questions. Submit your test when you are ready.</>
            )}
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => void onConfirm()}
              disabled={loading}
            >
              {loading ? 'Submitting…' : 'Submit'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
