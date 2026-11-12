'use client';

import { useEffect, useRef } from 'react';
import {
  CONTENT_FILE_VIEWER_DEFAULT_DEVICE_PIXEL_RATIO,
  CONTENT_FILE_VIEWER_PDF,
} from '@/lib/contentFileViewer.config';

export type PdfCanvasPreviewProps = {
  blob: Blob;
  title: string;
  onReady: () => void;
  onError: () => void;
};

/** Renders every page of a PDF blob onto canvases (pdf.js). Shared by content and subjective test viewers. */
export function PdfCanvasPreview({ blob, title, onReady, onError }: PdfCanvasPreviewProps) {
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
