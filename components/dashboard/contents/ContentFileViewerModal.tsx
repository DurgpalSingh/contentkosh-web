'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Download, FileText, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentsService, type Content } from '@/lib/api';
import {
  CONTENT_FILE_VIEWER_BYTE_UNITS,
  CONTENT_FILE_VIEWER_DEFAULT_DEVICE_PIXEL_RATIO,
  CONTENT_FILE_VIEWER_FILE_MATCHERS,
  CONTENT_FILE_VIEWER_IMAGE,
  CONTENT_FILE_VIEWER_PDF,
  type ContentFileViewerFileKind,
  type ContentFileViewerMode,
} from '@/lib/contentFileViewer.config';

type ViewerStatus = 'idle' | 'fetching' | 'loading-preview' | 'ready' | 'error';

type ContentFileViewerModalProps = {
  content: Content | null;
  isOpen: boolean;
  onClose: () => void;
};

function getContentType(content: Content | null, blob: Blob | null): string {
  return (blob?.type || content?.type || '').toLowerCase();
}

type ContentFileKind = ContentFileViewerFileKind | 'unknown';

function getFileViewerMode(fileKind: ContentFileKind): ContentFileViewerMode {
  return CONTENT_FILE_VIEWER_FILE_MATCHERS.find((matcher) => matcher.kind === fileKind)?.viewer ?? 'download';
}

function getFileKind(content: Content | null, blob: Blob | null): ContentFileKind {
  const type = getContentType(content, blob);
  const path = (content?.filePath || content?.title || '').toLowerCase();

  return (
    CONTENT_FILE_VIEWER_FILE_MATCHERS.find((matcher) => {
      const matchesMime = matcher.mimeFragments.some((fragment) => type.includes(fragment));
      const matchesExtension = 'extensions' in matcher && matcher.extensions.some((extension) => path.endsWith(extension));
      const matchesPattern = 'extensionPattern' in matcher && matcher.extensionPattern.test(path);

      return matchesMime || matchesExtension || matchesPattern;
    })?.kind ?? 'unknown'
  );
}

function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null) return 'Unknown size';
  if (bytes === 0) return '0 B';
  const exp = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    CONTENT_FILE_VIEWER_BYTE_UNITS.length - 1
  );
  const value = bytes / Math.pow(1024, exp);
  return `${value.toFixed(exp === 0 ? 0 : 1)} ${CONTENT_FILE_VIEWER_BYTE_UNITS[exp]}`;
}

type PdfCanvasPreviewProps = {
  blob: Blob;
  title: string;
  onReady: () => void;
  onError: () => void;
};

function PdfCanvasPreview({ blob, title, onReady, onError }: PdfCanvasPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: { destroy: () => Promise<void> } | null = null;
    const container = containerRef.current;

    const renderPdf = async () => {
      if (!container) return;

      container.replaceChildren();

      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = CONTENT_FILE_VIEWER_PDF.workerSrc;

        const data = await blob.arrayBuffer();
        const task = pdfjs.getDocument({ data });
        loadingTask = task;
        const pdf = await task.promise;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: CONTENT_FILE_VIEWER_PDF.baseScale });
          const availableWidth = Math.max(
            container.clientWidth - CONTENT_FILE_VIEWER_PDF.horizontalPaddingPx,
            CONTENT_FILE_VIEWER_PDF.minAvailableWidthPx
          );
          const scale = Math.min(CONTENT_FILE_VIEWER_PDF.maxScale, availableWidth / baseViewport.width);
          const viewport = page.getViewport({ scale });
          const outputScale = window.devicePixelRatio || CONTENT_FILE_VIEWER_DEFAULT_DEVICE_PIXEL_RATIO;

          const pageShell = document.createElement('div');
          pageShell.className = 'mx-auto mb-5 flex w-fit max-w-full flex-col gap-2';

          const pageLabel = document.createElement('div');
          pageLabel.className = 'text-center text-xs font-medium text-slate-500';
          pageLabel.textContent = CONTENT_FILE_VIEWER_PDF.pageLabel(pageNumber, pdf.numPages);

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas rendering is not supported.');

          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          canvas.className = 'max-w-full rounded-lg bg-white shadow-sm ring-1 ring-slate-200';

          pageShell.append(pageLabel, canvas);
          container.append(pageShell);

          context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
          await page.render({ canvas, canvasContext: context, viewport }).promise;
        }

        if (!cancelled) onReady();
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to render PDF preview:', err);
        onError();
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
      loadingTask?.destroy().catch(() => undefined);
      container?.replaceChildren();
    };
  }, [blob, onError, onReady]);

  return (
    <div className="h-full overflow-auto bg-slate-100 px-3 py-5 sm:px-5" aria-label={CONTENT_FILE_VIEWER_PDF.previewLabel(title)}>
      <div ref={containerRef} />
    </div>
  );
}

export function ContentFileViewerModal({ content, isOpen, onClose }: ContentFileViewerModalProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<ViewerStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fileKind = useMemo(() => getFileKind(content, blob), [content, blob]);
  const fileViewerMode = useMemo(() => getFileViewerMode(fileKind), [fileKind]);
  const showLoading = status === 'fetching' || status === 'loading-preview';

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !content?.id) return;

    let cancelled = false;
    let nextUrl: string | null = null;

    setStatus('fetching');
    setError(null);
    setBlob(null);
    setFileUrl(null);

    ContentsService.getApiContentsFile({ contentId: content.id })
      .then((response) => {
        if (cancelled) return;
        const nextBlob = response as Blob;
        nextUrl = URL.createObjectURL(nextBlob);
        setBlob(nextBlob);
        setFileUrl(nextUrl);

        const kind = getFileKind(content, nextBlob);
        setStatus(getFileViewerMode(kind) === 'download' ? 'ready' : 'loading-preview');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load content file:', err);
        setError('Failed to load this file. Please try again.');
        setStatus('error');
      });

    return () => {
      cancelled = true;
      if (nextUrl) URL.revokeObjectURL(nextUrl);
    };
  }, [content, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFileUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return null;
      });
      setBlob(null);
      setStatus('idle');
      setError(null);
    }
  }, [isOpen]);

  const handleDownload = useCallback(() => {
    if (!fileUrl || !content) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = content.title || 'content-file';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [content, fileUrl]);

  const handlePdfReady = useCallback(() => {
    setStatus('ready');
  }, []);

  const handlePdfError = useCallback(() => {
    setError('Failed to prepare the PDF preview. Please download the file and try again.');
    setStatus('error');
  }, []);

  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              {fileViewerMode === 'image' ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                {content.title || 'Content file'}
              </h2>
              <p className="text-xs text-slate-500">
                {fileKind.toUpperCase()} | {formatBytes(content.fileSize)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {fileUrl && (
              <>
                <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </>
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
              <div className="text-center">
                <p className="text-sm font-semibold">{status === 'fetching' ? 'Loading file...' : 'Preparing preview...'}</p>
                <p className="text-xs text-slate-500">Please wait while the file opens here.</p>
              </div>
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

          {blob && fileViewerMode === 'pdf' && (
            <PdfCanvasPreview
              blob={blob}
              title={content.title || 'Content file'}
              onReady={handlePdfReady}
              onError={handlePdfError}
            />
          )}

          {fileUrl && fileViewerMode === 'image' && (
            <div className="flex h-full items-center justify-center overflow-auto p-4">
              <Image
                src={fileUrl}
                alt={content.title || 'Content image'}
                width={CONTENT_FILE_VIEWER_IMAGE.previewWidth}
                height={CONTENT_FILE_VIEWER_IMAGE.previewHeight}
                unoptimized
                className="max-h-full w-auto max-w-full rounded-lg bg-white object-contain shadow-sm"
                onLoad={() => setStatus('ready')}
              />
            </div>
          )}

          {fileUrl && fileViewerMode === 'download' && status === 'ready' && (
            <div className="flex h-full items-center justify-center p-6">
              <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <FileText className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">Preview is not available for this file type</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Your browser cannot reliably render this document inside the page. Download it to open it with your system document viewer.
                </p>
                <div className="mt-5 flex justify-center">
                  <Button type="button" onClick={handleDownload} className="bg-blue-600 text-white hover:bg-blue-700">
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
