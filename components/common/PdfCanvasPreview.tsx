'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CONTENT_FILE_VIEWER_DEFAULT_DEVICE_PIXEL_RATIO,
  CONTENT_FILE_VIEWER_PDF,
} from '@/lib/contentFileViewer.config';

export type PdfCanvasPreviewProps = {
  blob?: Blob;
  url?: string;
  title: string;
  onReady: () => void;
  onError: (error?: unknown) => void;
};

function splitSpeechText(text: string, maxLength = 1800): string[] {
  const chunks: string[] = [];
  let chunk = '';
  for (const word of text.split(/\s+/)) {
    if (!word) continue;
    const next = chunk ? `${chunk} ${word}` : word;
    if (next.length > maxLength && chunk) {
      chunks.push(chunk);
      chunk = word;
    } else {
      chunk = next;
    }
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}

/** Renders every page of a PDF blob onto canvases (pdf.js). Shared by content and subjective test viewers. */
export function PdfCanvasPreview({ blob, url, title, onReady, onError }: PdfCanvasPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const speechChunksRef = useRef<string[]>([]);
  const speechIndexRef = useRef(0);
  const [pdfText, setPdfText] = useState('');
  const [speechState, setSpeechState] = useState<'idle' | 'speaking' | 'paused'>('idle');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState(true);

  const speakNextChunk = useCallback(() => {
    if (speechIndexRef.current >= speechChunksRef.current.length) {
      setSpeechState('idle');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(speechChunksRef.current[speechIndexRef.current]);
    utterance.onend = () => {
      speechIndexRef.current += 1;
      speakNextChunk();
    };
    utterance.onerror = (event) => {
      if (speechChunksRef.current.length === 0 || event.error === 'canceled' || event.error === 'interrupted') return;
      setSpeechError('Audio playback stopped. Please try again.');
      setSpeechState('idle');
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleSpeechToggle = () => {
    if (!speechAvailable) {
      setSpeechError('Audio playback is not supported by this browser.');
      return;
    }
    if (speechState === 'speaking') {
      window.speechSynthesis.pause();
      setSpeechState('paused');
      return;
    }
    if (speechState === 'paused') {
      window.speechSynthesis.resume();
      setSpeechState('speaking');
      return;
    }
    if (!pdfText) {
      setSpeechError('No readable text was found in this PDF.');
      return;
    }
    speechChunksRef.current = splitSpeechText(pdfText);
    speechIndexRef.current = 0;
    setSpeechError(null);
    window.speechSynthesis.cancel();
    setSpeechState('speaking');
    speakNextChunk();
  };

  const handleSpeechStop = () => {
    speechChunksRef.current = [];
    speechIndexRef.current = 0;
    window.speechSynthesis.cancel();
    setSpeechState('idle');
  };

  useEffect(() => {
    setSpeechAvailable('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);
    let cancelled = false;
    let loadingTask: { destroy: () => Promise<void> } | null = null;
    const container = containerRef.current;

    const renderPdf = async () => {
      if (!container) return;

      container.replaceChildren();
      setPdfText('');
      setSpeechError(null);

      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = CONTENT_FILE_VIEWER_PDF.workerSrc;

        if (!blob && !url) throw new Error('A PDF file source is required.');
        const source = blob
          ? { data: await blob.arrayBuffer() }
          : { url, withCredentials: true };
        const task = pdfjs.getDocument(source);
        loadingTask = task;
        const pdf = await task.promise;
        const extractedPages: string[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNumber);
          try {
            const textContent = await page.getTextContent();
            extractedPages.push(
              textContent.items
                .map((item) => ('str' in item ? item.str : ''))
                .filter(Boolean)
                .join(' ')
            );
          } catch (textError) {
            console.error('Failed to extract text for PDF audio playback:', textError);
            extractedPages.push('');
          }
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
          if (pageNumber === 1 && !cancelled) onReady();
        }

        if (!cancelled) {
          const text = extractedPages.join('\n\n').trim();
          setPdfText(text);
          if (!text) setSpeechError('This PDF does not contain readable text to play as audio.');
        }
        if (!cancelled && pdf.numPages === 0) onReady();
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to render PDF preview:', err);
        onError(err);
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
      speechChunksRef.current = [];
      speechIndexRef.current = 0;
      window.speechSynthesis?.cancel();
      loadingTask?.destroy().catch(() => undefined);
      container?.replaceChildren();
    };
  }, [blob, onError, onReady, url]);

  return (
    <div className="flex h-full flex-col bg-slate-100" aria-label={CONTENT_FILE_VIEWER_PDF.previewLabel(title)}>
      <div className="sticky top-0 z-10 flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur">
        <Volume2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleSpeechToggle}
          disabled={!pdfText || !speechAvailable}
          aria-label={speechState === 'speaking' ? 'Pause PDF audio' : speechState === 'paused' ? 'Resume PDF audio' : 'Listen to PDF'}
        >
          {speechState === 'speaking' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {speechState === 'speaking' ? 'Pause' : speechState === 'paused' ? 'Resume' : 'Listen'}
        </Button>
        {speechState !== 'idle' && (
          <Button type="button" size="sm" variant="ghost" onClick={handleSpeechStop}>
            <Square className="mr-2 h-3.5 w-3.5" />
            Stop
          </Button>
        )}
        {speechError && <p role="status" className="text-xs text-amber-700">{speechError}</p>}
        {!speechAvailable && (
          <p role="status" className="text-xs text-slate-500">Audio playback is not supported by this browser.</p>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-3 py-5 sm:px-5">
        <div ref={containerRef} />
      </div>
    </div>
  );
}
