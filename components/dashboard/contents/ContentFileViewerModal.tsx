'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Download, Expand, FileText, Image as ImageIcon, Loader2, Minimize2, WifiOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentFilesService, type Content } from '@/lib/api';
import { PdfCanvasPreview } from '@/components/common/PdfCanvasPreview';
import { DocxPreview } from '@/components/common/DocxPreview';
import { SettingsService } from '@/lib/api/services/SettingsService';
import { useAuthStore } from '@/store/useAuthStore';
import {
  CONTENT_FILE_VIEWER_BYTE_UNITS,
  CONTENT_FILE_VIEWER_FILE_MATCHERS,
  CONTENT_FILE_VIEWER_IMAGE,
  CONTENT_FILE_VIEWER_KIND,
  CONTENT_FILE_VIEWER_MODE,
  CONTENT_FILE_VIEWER_STATUS,
  type ContentFileViewerFileKind,
  type ContentFileViewerMode,
} from '@/lib/contentFileViewer.config';

type ViewerStatus = (typeof CONTENT_FILE_VIEWER_STATUS)[keyof typeof CONTENT_FILE_VIEWER_STATUS];

type ContentFileViewerModalProps = {
  content: Content | null;
  isOpen: boolean;
  onClose: () => void;
};

const NETWORK_UNAVAILABLE_MESSAGE = 'You appear to be offline. Check your internet connection and try again.';

function isNetworkUnavailable(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /failed to fetch|network error|network request failed|internet disconnected|offline/i.test(message);
}

function getContentType(content: Content | null): string {
  return (content?.type || '').toLowerCase();
}

type ContentFileKind = ContentFileViewerFileKind | (typeof CONTENT_FILE_VIEWER_KIND)['UNKNOWN'];

function getFileViewerMode(fileKind: ContentFileKind): ContentFileViewerMode {
  return CONTENT_FILE_VIEWER_FILE_MATCHERS.find((matcher) => matcher.kind === fileKind)?.viewer ??
    CONTENT_FILE_VIEWER_MODE.DOWNLOAD;
}

function getFileKind(content: Content | null): ContentFileKind {
  const type = getContentType(content);
  const path = (content?.filePath || content?.title || '').toLowerCase();

  return (
    CONTENT_FILE_VIEWER_FILE_MATCHERS.find((matcher) => {
      const matchesMime = matcher.mimeFragments.some((fragment) => type.includes(fragment));
      const matchesExtension = 'extensions' in matcher && matcher.extensions.some((extension) => path.endsWith(extension));
      const matchesPattern = 'extensionPattern' in matcher && matcher.extensionPattern.test(path);

      return matchesMime || matchesExtension || matchesPattern;
    })?.kind ?? CONTENT_FILE_VIEWER_KIND.UNKNOWN
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

export function ContentFileViewerModal({ content, isOpen, onClose }: ContentFileViewerModalProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<ViewerStatus>(CONTENT_FILE_VIEWER_STATUS.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [downloadSettingLoaded, setDownloadSettingLoaded] = useState(false);
  const [studentDownloadsEnabled, setStudentDownloadsEnabled] = useState(false);
  const [downloadSettingError, setDownloadSettingError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const isStudent = useAuthStore((state) => state.user?.role === 'STUDENT');
  const highlightUserId = useAuthStore((state) => state.user?.id);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileKind = useMemo(() => getFileKind(content), [content]);
  const fileViewerMode = useMemo(() => getFileViewerMode(fileKind), [fileKind]);
  const canDownload = !isStudent || (downloadSettingLoaded && studentDownloadsEnabled);
  const showLoading =
    status === CONTENT_FILE_VIEWER_STATUS.FETCHING ||
    status === CONTENT_FILE_VIEWER_STATUS.LOADING_PREVIEW;

  useEffect(() => {
    if (!isOpen) return;
    const updateConnectivity = () => setIsOffline(!navigator.onLine);
    updateConnectivity();
    window.addEventListener('online', updateConnectivity);
    window.addEventListener('offline', updateConnectivity);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('online', updateConnectivity);
      window.removeEventListener('offline', updateConnectivity);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !content?.id) return;

    const contentId = content.id;
    let cancelled = false;
    let docxRequest: ReturnType<typeof ContentFilesService.getFile> | null = null;

    setStatus(CONTENT_FILE_VIEWER_STATUS.FETCHING);
    setError(null);
    setDocxBlob(null);
    setFileUrl(null);
    setDownloadSettingLoaded(!isStudent);
    setStudentDownloadsEnabled(false);
    setDownloadSettingError(null);
    setDownloadError(null);
    setDownloading(false);

    const url = ContentFilesService.getFileUrl(contentId);
    setFileUrl(url);
    setStatus(
      fileViewerMode === CONTENT_FILE_VIEWER_MODE.DOWNLOAD
        ? CONTENT_FILE_VIEWER_STATUS.READY
        : CONTENT_FILE_VIEWER_STATUS.LOADING_PREVIEW,
    );

    if (isStudent) {
      void SettingsService.getSettingsProfile()
        .then((settings) => {
          if (cancelled) return;
          setStudentDownloadsEnabled(settings.business?.allowContentDownloads ?? true);
          setDownloadSettingLoaded(true);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          console.error('Failed to load content download settings:', err);
          setDownloadSettingError(
            isNetworkUnavailable(err)
              ? NETWORK_UNAVAILABLE_MESSAGE
              : 'We could not check the download settings right now. Please try again later.'
          );
          setDownloadSettingLoaded(true);
        });
    }

    if (fileViewerMode === CONTENT_FILE_VIEWER_MODE.DOCX) {
      docxRequest = ContentFilesService.getFile(contentId);
      docxRequest
        .then((file) => {
          if (!cancelled) setDocxBlob(file);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          console.error('Failed to load DOCX content:', err);
          setError('Failed to load this document. Please try again.');
          setStatus(CONTENT_FILE_VIEWER_STATUS.ERROR);
        });
    }

    return () => {
      cancelled = true;
      docxRequest?.cancel();
    };
  }, [content, fileViewerMode, isOpen, isStudent]);

  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
      setFileUrl(null);
      setDocxBlob(null);
      setStatus(CONTENT_FILE_VIEWER_STATUS.IDLE);
      setError(null);
    }
  }, [isOpen]);

  const handleDownload = useCallback(async () => {
    if (!fileUrl || !content?.id || !canDownload) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const file = await ContentFilesService.getFile(content.id);
      const objectUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = content.title || 'content-file';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      console.error('Failed to download content file:', err);
      setDownloadError('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, [canDownload, content, fileUrl]);

  const handlePreviewReady = useCallback(() => {
    setStatus(CONTENT_FILE_VIEWER_STATUS.READY);
  }, []);

  const handlePreviewError = useCallback((previewError?: unknown) => {
    setError(
      isNetworkUnavailable(previewError)
        ? NETWORK_UNAVAILABLE_MESSAGE
        : 'Failed to prepare the file preview. Please try again.'
    );
    setStatus(CONTENT_FILE_VIEWER_STATUS.ERROR);
  }, []);

  if (!isOpen || !content) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm ${isFullscreen ? 'p-0' : 'p-3 sm:p-6'
        }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={content.title || 'Content file'}
        className={`flex w-full flex-col overflow-hidden bg-white shadow-2xl ${isFullscreen ? 'h-screen max-w-none rounded-none' : 'h-[92vh] max-w-6xl rounded-2xl'
          }`}
      >
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              {fileViewerMode === CONTENT_FILE_VIEWER_MODE.IMAGE ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
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
            {fileUrl && fileViewerMode !== CONTENT_FILE_VIEWER_MODE.DOWNLOAD && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen((current) => !current)}
                aria-label={isFullscreen ? 'Exit full screen' : 'Open full screen'}
                title={isFullscreen ? 'Exit full screen' : 'Open full screen'}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              </Button>
            )}
            {fileUrl && canDownload && (
              <Button type="button" variant="outline" size="sm" onClick={handleDownload} disabled={downloading}>
                <Download className="mr-2 h-4 w-4" />
                {downloading ? 'Downloading...' : 'Download'}
              </Button>
            )}
            <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close file viewer">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-slate-100">
          {(downloadSettingError || downloadError) && (
            <p role="status" className="absolute left-3 right-3 top-3 z-20 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {downloadSettingError || downloadError}
            </p>
          )}
          {isOffline && !downloadSettingError && !downloadError && (
            <p role="status" className="absolute left-3 right-3 top-3 z-20 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <WifiOff className="h-4 w-4 shrink-0" />
              {NETWORK_UNAVAILABLE_MESSAGE}
            </p>
          )}
          {showLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 text-slate-700">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="text-center">
                <p className="text-sm font-semibold">
                  {status === CONTENT_FILE_VIEWER_STATUS.FETCHING ? 'Loading file...' : 'Preparing preview...'}
                </p>
                <p className="text-xs text-slate-500">Please wait while the file opens here.</p>
              </div>
            </div>
          )}

          {status === CONTENT_FILE_VIEWER_STATUS.ERROR && (
            <div className="flex h-full items-center justify-center p-6">
              <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                <p className="font-semibold text-red-800">Could not open file</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {fileUrl && fileViewerMode === CONTENT_FILE_VIEWER_MODE.PDF && (
            <PdfCanvasPreview
              url={fileUrl}
              title={content.title || 'Content file'}
              enableHighlight={isStudent}
              highlightUserId={isStudent ? highlightUserId : undefined}
              highlightContentId={isStudent ? content.id : undefined}
              onReady={handlePreviewReady}
              onError={handlePreviewError}
            />
          )}

          {docxBlob && fileViewerMode === CONTENT_FILE_VIEWER_MODE.DOCX && (
            <DocxPreview
              blob={docxBlob}
              onReady={handlePreviewReady}
              onError={handlePreviewError}
            />
          )}

          {fileUrl && fileViewerMode === CONTENT_FILE_VIEWER_MODE.IMAGE && (
            <div className="flex h-full items-center justify-center overflow-auto p-4">
              <Image
                src={fileUrl}
                alt={content.title || 'Content image'}
                width={CONTENT_FILE_VIEWER_IMAGE.previewWidth}
                height={CONTENT_FILE_VIEWER_IMAGE.previewHeight}
                unoptimized
                className="max-h-full w-auto max-w-full rounded-lg bg-white object-contain shadow-sm"
                onLoad={() => setStatus(CONTENT_FILE_VIEWER_STATUS.READY)}
              />
            </div>
          )}

          {fileUrl &&
            fileViewerMode === CONTENT_FILE_VIEWER_MODE.DOWNLOAD &&
            status === CONTENT_FILE_VIEWER_STATUS.READY && (
            <div className="flex h-full items-center justify-center p-6">
              <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <FileText className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">Preview is not available for this file type</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {canDownload
                    ? 'Your browser cannot reliably render this document inside the page. Download it to open it with your system document viewer.'
                    : 'Downloads are disabled by your administrator, and this file type cannot be previewed in the browser.'}
                </p>
                {canDownload && (
                  <div className="mt-5 flex justify-center">
                    <Button type="button" onClick={handleDownload} disabled={downloading} className="bg-blue-600 text-white hover:bg-blue-700">
                      <Download className="mr-2 h-4 w-4" />
                      {downloading ? 'Downloading...' : 'Download File'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
