'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Gauge,
  Headphones,
  Languages,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Square,
} from 'lucide-react';
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

const SPEECH_RATES = [0.75, 1, 1.25, 1.5, 2];
const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

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

function getVoiceKey(voice: SpeechSynthesisVoice): string {
  return voice.voiceURI || `${voice.name}-${voice.lang}`;
}

/** Renders every page of a PDF blob onto canvases (pdf.js). Shared by content and subjective test viewers. */
export function PdfCanvasPreview({ blob, url, title, onReady, onError }: PdfCanvasPreviewProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const speechChunksRef = useRef<string[]>([]);
  const speechIndexRef = useRef(0);
  const pendingPageRef = useRef<number | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const selectedVoiceRef = useRef('');
  const speechRateRef = useRef(1);

  const [pdfText, setPdfText] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [zoom, setZoom] = useState(100);
  const [documentReady, setDocumentReady] = useState(false);
  const [speechState, setSpeechState] = useState<'idle' | 'speaking' | 'paused'>('idle');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [speechRate, setSpeechRate] = useState(1);
  const [speechSection, setSpeechSection] = useState(0);
  const [speechSectionCount, setSpeechSectionCount] = useState(0);

  voicesRef.current = availableVoices;
  selectedVoiceRef.current = selectedVoice;
  speechRateRef.current = speechRate;

  const speakNextChunk = useCallback(() => {
    if (speechIndexRef.current >= speechChunksRef.current.length) {
      setSpeechState('idle');
      setSpeechSection(0);
      return;
    }

    setSpeechSection(speechIndexRef.current + 1);
    const utterance = new SpeechSynthesisUtterance(speechChunksRef.current[speechIndexRef.current]);
    utterance.rate = speechRateRef.current;
    utterance.voice =
      voicesRef.current.find((voice) => getVoiceKey(voice) === selectedVoiceRef.current) ??
      voicesRef.current.find((voice) => voice.default) ??
      null;
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

  const restartCurrentSpeechSection = useCallback((resume: boolean) => {
    if (speechChunksRef.current.length === 0) return;
    window.speechSynthesis.cancel();
    speakNextChunk();
    if (!resume) {
      window.speechSynthesis.pause();
      setSpeechState('paused');
    }
  }, [speakNextChunk]);

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
    setSpeechSectionCount(speechChunksRef.current.length);
    setSpeechError(null);
    window.speechSynthesis.cancel();
    setSpeechState('speaking');
    speakNextChunk();
  };

  const handleSpeechStop = () => {
    speechChunksRef.current = [];
    speechIndexRef.current = 0;
    setSpeechSection(0);
    setSpeechSectionCount(0);
    window.speechSynthesis.cancel();
    setSpeechState('idle');
  };

  const goToPage = (page: number) => {
    if (!Number.isInteger(page) || page < 1 || page > pageCount) return;
    setCurrentPage(page);
    setPageInput(String(page));
    const target = containerRef.current?.querySelector<HTMLElement>(`[data-page-number="${page}"]`);
    if (target) {
      pendingPageRef.current = null;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      pendingPageRef.current = page;
    }
  };

  const submitPageInput = () => {
    const page = Number(pageInput);
    if (!Number.isInteger(page) || page < 1 || page > pageCount) {
      setPageInput(String(currentPage));
      return;
    }
    goToPage(page);
  };

  const getFitWidthZoom = () => {
    const baseWidth = Number(
      containerRef.current?.querySelector<HTMLCanvasElement>('canvas')?.dataset.baseWidth
    );
    const availableWidth = (scrollContainerRef.current?.clientWidth ?? 0) - CONTENT_FILE_VIEWER_PDF.horizontalPaddingPx;
    if (!baseWidth || availableWidth <= 0) return 100;
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round((availableWidth / baseWidth) * 100)));
  };

  const handleVoiceChange = (voiceKey: string) => {
    selectedVoiceRef.current = voiceKey;
    setSelectedVoice(voiceKey);
    if (speechState !== 'idle') restartCurrentSpeechSection(speechState === 'speaking');
  };

  const handleSpeechRateChange = (rate: number) => {
    speechRateRef.current = rate;
    setSpeechRate(rate);
    if (speechState !== 'idle') restartCurrentSpeechSection(speechState === 'speaking');
  };

  useEffect(() => {
    setSpeechAvailable('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);
    if (!('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      setSelectedVoice((current) => {
        if (voices.some((voice) => getVoiceKey(voice) === current)) return current;
        const preferred = voices.find((voice) => voice.default) ?? voices[0];
        return preferred ? getVoiceKey(preferred) : '';
      });
    };

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: { destroy: () => Promise<void> } | null = null;
    const container = containerRef.current;

    setPdfText('');
    setPageCount(0);
    setCurrentPage(1);
    setPageInput('1');
    setZoom(100);
    setDocumentReady(false);
    setSpeechState('idle');
    setSpeechError(null);
    speechChunksRef.current = [];
    speechIndexRef.current = 0;
    pendingPageRef.current = null;
    container?.replaceChildren();

    const renderPdf = async () => {
      if (!container) return;

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
        setPageCount(pdf.numPages);

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
          pageShell.className = 'mx-auto mb-6 flex w-fit scroll-mt-3 flex-col gap-2';
          pageShell.dataset.pageNumber = String(pageNumber);

          const pageLabel = document.createElement('div');
          pageLabel.className = 'text-center text-xs font-medium text-slate-500';
          pageLabel.textContent = CONTENT_FILE_VIEWER_PDF.pageLabel(pageNumber, pdf.numPages);

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas rendering is not supported.');

          const baseWidth = Math.floor(viewport.width);
          const baseHeight = Math.floor(viewport.height);
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${baseWidth}px`;
          canvas.style.height = `${baseHeight}px`;
          canvas.dataset.baseWidth = String(baseWidth);
          canvas.dataset.baseHeight = String(baseHeight);
          canvas.className = 'rounded-lg bg-white shadow-md ring-1 ring-slate-200';

          pageShell.append(pageLabel, canvas);
          container.append(pageShell);
          if (pendingPageRef.current === pageNumber) {
            pendingPageRef.current = null;
            pageShell.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }

          context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          if (pageNumber === 1 && !cancelled) onReady();
        }

        if (!cancelled) {
          const text = extractedPages.join('\n\n').trim();
          setPdfText(text);
          setDocumentReady(true);
          if (!text) setSpeechError('This PDF does not contain readable text to play as audio.');
        }
        if (!cancelled && pdf.numPages === 0) {
          setDocumentReady(true);
          onReady();
        }
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

  useEffect(() => {
    containerRef.current?.querySelectorAll<HTMLCanvasElement>('canvas[data-base-width]').forEach((canvas) => {
      const baseWidth = Number(canvas.dataset.baseWidth);
      const baseHeight = Number(canvas.dataset.baseHeight);
      canvas.style.width = `${Math.round(baseWidth * zoom / 100)}px`;
      canvas.style.height = `${Math.round(baseHeight * zoom / 100)}px`;
    });
  }, [documentReady, zoom]);

  useEffect(() => {
    if (!documentReady || !scrollContainerRef.current || !containerRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      const mostVisible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const page = Number(mostVisible?.target.getAttribute('data-page-number'));
      if (page) {
        setCurrentPage(page);
        setPageInput(String(page));
      }
    }, {
      root: scrollContainerRef.current,
      threshold: [0.2, 0.5, 0.8],
    });

    containerRef.current.querySelectorAll('[data-page-number]').forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, [documentReady]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100" aria-label={CONTENT_FILE_VIEWER_PDF.previewLabel(title)}>
      <div className="z-10 shrink-0 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-5 lg:flex-nowrap">
          <div
            role="group"
            aria-label="Page navigation"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={pageCount === 0 || currentPage <= 1}
              aria-label="Previous page"
              title="Previous page"
              className="h-8 w-8 rounded-lg text-slate-600"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
            </Button>
            <label htmlFor="pdf-page-number" className="sr-only">Go to page</label>
            <input
              id="pdf-page-number"
              type="number"
              min={1}
              max={pageCount || undefined}
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
              onBlur={submitPageInput}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitPageInput();
                  event.currentTarget.blur();
                }
              }}
              disabled={pageCount === 0}
              className="h-8 w-12 rounded-lg border border-slate-200 bg-white text-center text-sm font-semibold tabular-nums text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              aria-label="Current page number"
            />
            <span className="whitespace-nowrap px-2 text-xs font-medium text-slate-500">
              of <span className="font-semibold text-slate-700">{pageCount || '—'}</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={pageCount === 0 || currentPage >= pageCount}
              aria-label="Next page"
              title="Next page"
              className="h-8 w-8 rounded-lg text-slate-600"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
            </Button>
          </div>

          <div
            role="group"
            aria-label="Zoom controls"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP))}
              disabled={!documentReady || zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              title="Zoom out"
              className="h-8 w-8 rounded-lg text-slate-600"
            >
              <Minus className="h-4 w-4" strokeWidth={2.25} />
            </Button>
            <span className="w-14 text-center text-xs font-semibold tabular-nums text-slate-700" aria-live="polite">
              {zoom}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP))}
              disabled={!documentReady || zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              title="Zoom in"
              className="h-8 w-8 rounded-lg text-slate-600"
            >
              <Plus className="h-4 w-4" strokeWidth={2.25} />
            </Button>
            <span className="mx-1.5 h-5 w-px bg-slate-200" aria-hidden="true" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setZoom(getFitWidthZoom())}
              disabled={!documentReady || zoom === getFitWidthZoom()}
              className="h-8 rounded-lg px-2 text-xs font-medium text-slate-600"
              title="Fit page width to viewer"
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5 text-slate-500" />
              Fit
            </Button>
          </div>

          <span className="hidden h-6 w-px shrink-0 bg-slate-200 xl:block" aria-hidden="true" />

          <div
            role="group"
            aria-label="PDF audio controls"
            className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-blue-100 bg-blue-50/80 p-1"
          >
            <Headphones className="ml-1 h-4 w-4 text-blue-600" aria-hidden="true" />
            <Button
              type="button"
              size="sm"
              onClick={handleSpeechToggle}
              disabled={!pdfText || !speechAvailable}
              className="h-8 rounded-lg bg-blue-600 px-3 text-white shadow-sm hover:bg-blue-700"
              aria-label={speechState === 'speaking' ? 'Pause PDF audio' : speechState === 'paused' ? 'Resume PDF audio' : 'Listen to PDF'}
            >
              {speechState === 'speaking' ? <Pause className="mr-1.5 h-4 w-4" /> : <Play className="mr-1.5 h-4 w-4" />}
              {speechState === 'speaking' ? 'Pause' : speechState === 'paused' ? 'Resume' : 'Listen'}
            </Button>
            {speechState !== 'idle' && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleSpeechStop}
                className="h-8 w-8 rounded-lg text-slate-600"
                aria-label="Stop audio"
                title="Stop audio"
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <label className="flex h-9 min-w-0 shrink items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <Languages className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="text-xs font-medium text-slate-500">Voice</span>
            <select
              value={selectedVoice}
              onChange={(event) => handleVoiceChange(event.target.value)}
              disabled={!speechAvailable || availableVoices.length === 0}
              className="h-full min-w-0 max-w-[145px] cursor-pointer bg-transparent pr-0.5 text-xs font-medium text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Speech voice"
            >
              {availableVoices.map((voice) => (
                <option key={getVoiceKey(voice)} value={getVoiceKey(voice)}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
              {availableVoices.length === 0 && <option value="">Browser default</option>}
            </select>
          </label>

          <label className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <Gauge className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span className="text-xs font-medium text-slate-500">Speed</span>
            <select
              value={speechRate}
              onChange={(event) => handleSpeechRateChange(Number(event.target.value))}
              disabled={!speechAvailable}
              className="h-full cursor-pointer bg-transparent pr-0.5 text-xs font-semibold text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Speech speed"
            >
              {SPEECH_RATES.map((rate) => (
                <option key={rate} value={rate}>{rate}×</option>
              ))}
            </select>
          </label>

          <div
            role="status"
            aria-live="polite"
            title={speechError ?? undefined}
            className={`flex h-9 min-w-0 max-w-[190px] shrink items-center gap-2 rounded-lg px-2.5 text-xs font-medium ${
              speechError
                ? 'border border-amber-200 bg-amber-50 text-amber-800'
                : speechState === 'speaking'
                  ? 'border border-blue-100 bg-blue-50 text-blue-700'
                  : 'border border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              speechError ? 'bg-amber-500' : speechState === 'speaking' ? 'animate-pulse bg-blue-600' : 'bg-slate-400'
            }`} aria-hidden="true" />
            <span className="truncate">
              {speechError
                ? speechError
                : speechState !== 'idle'
                  ? `${speechState === 'paused' ? 'Paused' : 'Reading'} · ${speechSection} of ${speechSectionCount}`
                  : !speechAvailable
                    ? 'Audio unavailable'
                    : pdfText
                      ? 'Ready to listen'
                      : 'Preparing audio'}
            </span>
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-auto px-3 py-5 sm:px-5">
        <div ref={containerRef} className="mx-auto w-fit min-w-full" />
      </div>
    </div>
  );
}
