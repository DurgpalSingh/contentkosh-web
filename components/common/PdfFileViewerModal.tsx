'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, FileText, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PdfCanvasPreview } from '@/components/common/PdfCanvasPreview';
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage';
import { saveBlob } from '@/lib/utils/saveBlob';

type ViewerStatus = 'fetching' | 'rendering' | 'ready' | 'error';

export type PdfFileViewerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** File name used when the user downloads the PDF. */
  downloadName: string;
  /** Loads the PDF; called each time the modal opens (render with a `key` per file to switch files). */
  fetchBlob: () => Promise<Blob>;
};

/** Previews a PDF loaded through an authenticated request, with a download button. */
export function PdfFileViewerModal({ isOpen, onClose, title, downloadName, fetchBlob }: PdfFileViewerModalProps) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<ViewerStatus>('fetching');
  const [error, setError] = useState<string | null>(null);
  const fetchBlobRef = useRef(fetchBlob);
  fetchBlobRef.current = fetchBlob;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setBlob(null);
    setError(null);
    setStatus('fetching');

    fetchBlobRef.current()
      .then((nextBlob) => {
        if (cancelled) return;
        setBlob(nextBlob);
        setStatus('rendering');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(getApiErrorDetailMessage(err, 'Failed to load this file. Please try again.'));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleDownload = useCallback(() => {
    if (blob) saveBlob(blob, downloadName);
  }, [blob, downloadName]);

  const handleReady = useCallback(() => setStatus('ready'), []);
  const handleRenderError = useCallback(() => {
    setError('Failed to prepare the PDF preview. Please download the file instead.');
    setStatus('error');
  }, []);

  if (!isOpen) return null;

  const showLoading = status === 'fetching' || status === 'rendering';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <div
        className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {blob && (
              <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
            <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close file viewer">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-slate-100">
          {showLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 text-slate-700">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm font-semibold">{status === 'fetching' ? 'Loading file...' : 'Preparing preview...'}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex h-full items-center justify-center p-6">
              <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                <p className="font-semibold text-red-800">Could not open file</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {blob && status !== 'error' && (
            <PdfCanvasPreview blob={blob} title={title} onReady={handleReady} onError={handleRenderError} />
          )}
        </div>
      </div>
    </div>
  );
}
