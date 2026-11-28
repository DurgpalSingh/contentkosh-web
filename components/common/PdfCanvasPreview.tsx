'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eraser,
  Gauge,
  Headphones,
  Highlighter,
  Languages,
  Loader2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CONTENT_FILE_VIEWER_DEFAULT_DEVICE_PIXEL_RATIO,
  CONTENT_FILE_VIEWER_PDF,
  CONTENT_FILE_VIEWER_PDF_AUDIO_PREPARING_LABEL,
  CONTENT_FILE_VIEWER_PDF_HIGHLIGHT,
  CONTENT_FILE_VIEWER_PDF_NATURAL_VOICE_MARKERS,
  CONTENT_FILE_VIEWER_PDF_NO_VOICES_LABEL,
  CONTENT_FILE_VIEWER_PDF_SPEECH_API,
  CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL,
  CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL_COPY,
  CONTENT_FILE_VIEWER_PDF_VOICE_LANGUAGES,
  type PdfTextHighlightSnapshot,
  type ContentFileViewerPdfSelectionTool,
} from '@/lib/contentFileViewer.config';
import { PdfTextHighlightsService } from '@/lib/api/services/PdfTextHighlightsService';
import {
  applyPdfTextHighlight,
  createPdfTextHighlightSnapshot,
  getPdfTextSelectionPageNumbers,
  isPdfTextSelection,
  parsePdfTextHighlightSnapshot,
  removePdfTextHighlight,
  restorePdfTextHighlights,
} from './pdfTextHighlight';

export type PdfCanvasPreviewProps = {
  blob?: Blob;
  url?: string;
  title: string;
  enableHighlight?: boolean;
  highlightUserId?: number;
  highlightContentId?: number;
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
  onRegisterHighlightSave?: (save: (() => Promise<boolean>) | null) => void;
  onReady: () => void;
  onError: (error?: unknown) => void;
};

const SPEECH_RATES = [0.75, 1, 1.25, 1.5, 2];
const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;
const SUPPORTED_SPEECH_VOICE_LOCALES = new Set(
  CONTENT_FILE_VIEWER_PDF_VOICE_LANGUAGES.map((language) => language.code.toLowerCase())
);

function getVoiceLocaleCode(voice: SpeechSynthesisVoice): string {
  return voice.lang.toLowerCase();
}

function isSupportedSpeechVoice(voice: SpeechSynthesisVoice): boolean {
  const voiceDescription = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  return SUPPORTED_SPEECH_VOICE_LOCALES.has(getVoiceLocaleCode(voice)) &&
    CONTENT_FILE_VIEWER_PDF_NATURAL_VOICE_MARKERS.some((marker) => voiceDescription.includes(marker));
}

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
export function PdfCanvasPreview({
  blob,
  url,
  title,
  enableHighlight = false,
  highlightUserId,
  highlightContentId,
  onUnsavedChangesChange,
  onRegisterHighlightSave,
  onReady,
  onError,
}: PdfCanvasPreviewProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const speechChunksRef = useRef<string[]>([]);
  const speechChunksByPageRef = useRef<string[][]>([]);
  const speechIndexRef = useRef(0);
  const highlightSnapshotRef = useRef<PdfTextHighlightSnapshot | null>(null);
  const highlightSavePromiseRef = useRef<Promise<boolean> | null>(null);
  const hasUnsavedHighlightsRef = useRef(false);
  const pageInputDirtyRef = useRef(false);
  const pendingPageRef = useRef<number | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const selectedVoiceRef = useRef('');
  const speechRateRef = useRef(1);
  const selectionToolRef = useRef<ContentFileViewerPdfSelectionTool>(null);

  const [hasPdfText, setHasPdfText] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [zoom, setZoom] = useState(100);
  const [documentReady, setDocumentReady] = useState(false);
  const [speechPreparing, setSpeechPreparing] = useState(false);
  const [speechState, setSpeechState] = useState<'idle' | 'speaking' | 'paused'>('idle');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [speechRate, setSpeechRate] = useState(1);
  const [selectionTool, setSelectionTool] = useState<ContentFileViewerPdfSelectionTool>(null);
  const [highlightSyncError, setHighlightSyncError] = useState(false);
  const [highlightDataReady, setHighlightDataReady] = useState(!enableHighlight);
  const [hasUnsavedHighlights, setHasUnsavedHighlights] = useState(false);
  const [isSavingHighlights, setIsSavingHighlights] = useState(false);
  const legacyHighlightStorageKey = highlightUserId && highlightContentId
    ? CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.legacyStorageKey(highlightUserId, highlightContentId)
    : null;

  const updateUnsavedHighlights = useCallback((hasUnsavedChanges: boolean) => {
    hasUnsavedHighlightsRef.current = hasUnsavedChanges;
    setHasUnsavedHighlights(hasUnsavedChanges);
    onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [onUnsavedChangesChange]);

  const availableVoicesByLocale = useMemo(() => {
    const voicesByLocale = new Map<string, SpeechSynthesisVoice[]>();
    for (const language of CONTENT_FILE_VIEWER_PDF_VOICE_LANGUAGES) {
      voicesByLocale.set(language.code.toLowerCase(), []);
    }
    for (const voice of availableVoices) {
      voicesByLocale.get(getVoiceLocaleCode(voice))?.push(voice);
    }
    return voicesByLocale;
  }, [availableVoices]);

  voicesRef.current = availableVoices;
  selectedVoiceRef.current = selectedVoice;
  speechRateRef.current = speechRate;

  const speakNextChunk = useCallback(() => {
    if (speechIndexRef.current >= speechChunksRef.current.length) {
      setSpeechState('idle');
      return;
    }

    const utterance = new window[CONTENT_FILE_VIEWER_PDF_SPEECH_API.UTTERANCE_PROPERTY](
      speechChunksRef.current[speechIndexRef.current]
    );
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
    window[CONTENT_FILE_VIEWER_PDF_SPEECH_API.SYNTHESIS_PROPERTY].speak(utterance);
  }, []);

  const restartCurrentSpeechSection = useCallback((resume: boolean) => {
    if (speechChunksRef.current.length === 0) return;
    window[CONTENT_FILE_VIEWER_PDF_SPEECH_API.SYNTHESIS_PROPERTY].cancel();
    speakNextChunk();
    if (!resume) {
      window[CONTENT_FILE_VIEWER_PDF_SPEECH_API.SYNTHESIS_PROPERTY].pause();
      setSpeechState('paused');
    }
  }, [speakNextChunk]);

  const handleSpeechToggle = () => {
    if (!speechAvailable) {
      setSpeechError('Audio playback is not supported by this browser.');
      return;
    }
    if (availableVoices.length === 0) {
      setSpeechError(CONTENT_FILE_VIEWER_PDF_NO_VOICES_LABEL);
      return;
    }
    if (speechState === 'speaking') {
      window[CONTENT_FILE_VIEWER_PDF_SPEECH_API.SYNTHESIS_PROPERTY].pause();
      setSpeechState('paused');
      return;
    }
    if (speechState === 'paused') {
      window[CONTENT_FILE_VIEWER_PDF_SPEECH_API.SYNTHESIS_PROPERTY].resume();
      setSpeechState('speaking');
      return;
    }
    if (!hasPdfText) {
      setSpeechError('No readable text was found in this PDF.');
      return;
    }

    const startPage = pageInputDirtyRef.current ? submitPageInput() : currentPage;
    speechChunksRef.current = speechChunksByPageRef.current
      .slice(startPage - 1)
      .flat();
    if (speechChunksRef.current.length === 0) {
      setSpeechError('No readable text is available on this or following pages.');
      return;
    }
    speechIndexRef.current = 0;
    setSpeechError(null);
    window[CONTENT_FILE_VIEWER_PDF_SPEECH_API.SYNTHESIS_PROPERTY].cancel();
    setSpeechState('speaking');
    speakNextChunk();
  };

  const handleSpeechStop = () => {
    speechChunksRef.current = [];
    speechIndexRef.current = 0;
    window[CONTENT_FILE_VIEWER_PDF_SPEECH_API.SYNTHESIS_PROPERTY].cancel();
    setSpeechState('idle');
  };

  const goToPage = (page: number) => {
    if (!Number.isInteger(page) || page < 1 || page > pageCount) return;
    pageInputDirtyRef.current = false;
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

  const submitPageInput = (): number => {
    const page = Number(pageInput);
    if (!Number.isInteger(page) || page < 1 || page > pageCount) {
      pageInputDirtyRef.current = false;
      setPageInput(String(currentPage));
      return currentPage;
    }
    pageInputDirtyRef.current = false;
    if (page !== currentPage || pageInput !== String(page)) {
      goToPage(page);
    }
    return page;
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

  const toggleSelectionTool = (tool: Exclude<ContentFileViewerPdfSelectionTool, null>) => {
    const nextTool = selectionTool === tool ? null : tool;
    selectionToolRef.current = nextTool;
    setSelectionTool(nextTool);
    window.getSelection()?.removeAllRanges();
  };

  const saveHighlightChanges = useCallback((): Promise<boolean> => {
    if (!enableHighlight || !highlightContentId || !highlightSnapshotRef.current) {
      return Promise.resolve(false);
    }
    if (!hasUnsavedHighlightsRef.current) return Promise.resolve(true);
    if (highlightSavePromiseRef.current) return highlightSavePromiseRef.current;

    const snapshot = highlightSnapshotRef.current;
    setIsSavingHighlights(true);
    const savePromise = (async () => {
      try {
        const savedSnapshot = await PdfTextHighlightsService.savePdfTextHighlights(highlightContentId, snapshot);
        const snapshotIsCurrent = highlightSnapshotRef.current === snapshot;
        if (snapshotIsCurrent) {
          highlightSnapshotRef.current = savedSnapshot;
          updateUnsavedHighlights(false);
        }
        if (highlightUserId) {
          try {
            window.localStorage.removeItem(
              CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.legacyStorageKey(highlightUserId, highlightContentId)
            );
          } catch (storageError) {
            console.warn('Could not remove migrated local PDF highlights:', storageError);
          }
        }
        setHighlightSyncError(false);
        return snapshotIsCurrent;
      } catch (error) {
        console.error('Failed to save PDF text highlights:', error);
        setHighlightSyncError(true);
        return false;
      } finally {
        setIsSavingHighlights(false);
      }
    })();

    highlightSavePromiseRef.current = savePromise;
    void savePromise.finally(() => {
      if (highlightSavePromiseRef.current === savePromise) {
        highlightSavePromiseRef.current = null;
      }
    });
    return savePromise;
  }, [enableHighlight, highlightContentId, highlightUserId, updateUnsavedHighlights]);

  useEffect(() => {
    onRegisterHighlightSave?.(saveHighlightChanges);
    return () => onRegisterHighlightSave?.(null);
  }, [onRegisterHighlightSave, saveHighlightChanges]);

  const applySelectionTool = useCallback(() => {
    const root = containerRef.current;
    const selection = window.getSelection();
    const tool = selectionToolRef.current;
    if (!enableHighlight || !highlightContentId || !root || !tool || !isPdfTextSelection(selection, root)) return;

    const range = selection.getRangeAt(0).cloneRange();
    const affectedPages = getPdfTextSelectionPageNumbers(range, root);
    if (affectedPages.length === 0) return;
    const selectionRoot = affectedPages.length === 1
      ? root.querySelector<HTMLElement>(`[data-page-number="${affectedPages[0]}"]`) ?? root
      : root;
    if (tool === CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL.HIGHLIGHT) {
      applyPdfTextHighlight(range, selectionRoot);
    } else {
      removePdfTextHighlight(range, selectionRoot);
    }
    selection.removeAllRanges();

    const currentSnapshot = highlightSnapshotRef.current ?? {
      version: CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.VERSION,
      pages: {},
    };
    const changedPages = createPdfTextHighlightSnapshot(
      root,
      CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.VERSION,
      affectedPages
    );
    const pages = { ...currentSnapshot.pages };
    for (const pageNumber of affectedPages) {
      const key = String(pageNumber);
      const page = changedPages.pages[key];
      if (page) pages[key] = page;
      else delete pages[key];
    }
    const snapshot = { version: CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.VERSION, pages };
    highlightSnapshotRef.current = snapshot;
    updateUnsavedHighlights(true);
  }, [enableHighlight, highlightContentId, updateUnsavedHighlights]);

  useEffect(() => {
    if (!enableHighlight) return;

    const handlePointerUp = () => {
      if (selectionToolRef.current) {
        window.setTimeout(applySelectionTool, 0);
      }
    };

    document.addEventListener('pointerup', handlePointerUp);
    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [applySelectionTool, enableHighlight]);

  useEffect(() => {
    const speechApi = CONTENT_FILE_VIEWER_PDF_SPEECH_API;
    setSpeechAvailable(speechApi.SYNTHESIS_PROPERTY in window && speechApi.UTTERANCE_PROPERTY in window);
    if (!(speechApi.SYNTHESIS_PROPERTY in window)) return;

    const updateVoices = () => {
      const voices = window[speechApi.SYNTHESIS_PROPERTY].getVoices();
      const supportedVoices = voices.filter(isSupportedSpeechVoice);
      setAvailableVoices(supportedVoices);
      setSelectedVoice((current) => {
        if (supportedVoices.some((voice) => getVoiceKey(voice) === current)) return current;
        const preferred = supportedVoices.find((voice) => voice.default) ?? supportedVoices[0];
        return preferred ? getVoiceKey(preferred) : '';
      });
    };

    updateVoices();
    window[speechApi.SYNTHESIS_PROPERTY].addEventListener(speechApi.VOICES_CHANGED_EVENT, updateVoices);
    return () =>
      window[speechApi.SYNTHESIS_PROPERTY].removeEventListener(speechApi.VOICES_CHANGED_EVENT, updateVoices);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: { destroy: () => Promise<void> } | null = null;
    const container = containerRef.current;

    setHasPdfText(false);
    setSpeechPreparing(true);
    setHighlightSyncError(false);
    setHighlightDataReady(!enableHighlight || !highlightContentId);
    updateUnsavedHighlights(false);
    highlightSnapshotRef.current = null;
    speechChunksByPageRef.current = [];
    setPageCount(0);
    setCurrentPage(1);
    pageInputDirtyRef.current = false;
    setPageInput('1');
    setZoom(100);
    setDocumentReady(false);
    selectionToolRef.current = null;
    setSelectionTool(null);
    setSpeechState('idle');
    setSpeechError(null);
    speechChunksRef.current = [];
    speechIndexRef.current = 0;
    pendingPageRef.current = null;
    container?.replaceChildren();

    const renderPdf = async () => {
      if (!container) return;

      try {
        let savedHighlights: PdfTextHighlightSnapshot | null = null;
        let legacyHighlights: PdfTextHighlightSnapshot | null = null;
        if (legacyHighlightStorageKey) {
          try {
            const serializedLegacyHighlights = window.localStorage.getItem(legacyHighlightStorageKey);
            if (serializedLegacyHighlights) {
              legacyHighlights = parsePdfTextHighlightSnapshot(
                serializedLegacyHighlights,
                CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.VERSION
              );
            }
          } catch (storageError) {
            console.error('Failed to read local PDF highlights for migration:', storageError);
            setHighlightSyncError(true);
          }
        }
        if (enableHighlight && highlightContentId) {
          void PdfTextHighlightsService.getPdfTextHighlights(highlightContentId)
            .then((responseSnapshot) => {
              const serverSnapshot = parsePdfTextHighlightSnapshot(
                JSON.stringify(responseSnapshot),
                CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.VERSION
              );
              if (cancelled) return null;
              const hasServerHighlights = Object.keys(serverSnapshot.pages).length > 0;
              const snapshot = hasServerHighlights || !legacyHighlights
                ? serverSnapshot
                : legacyHighlights;
              savedHighlights = snapshot;
              highlightSnapshotRef.current = snapshot;
              setHighlightDataReady(true);
              setHighlightSyncError(false);
              updateUnsavedHighlights(!hasServerHighlights && Boolean(legacyHighlights));
              restorePdfTextHighlights(container, snapshot);
              if (hasServerHighlights && legacyHighlightStorageKey) {
                try {
                  window.localStorage.removeItem(legacyHighlightStorageKey);
                } catch (storageError) {
                  console.warn('Could not remove migrated local PDF highlights:', storageError);
                }
              }
              return snapshot;
            })
            .catch((error: unknown) => {
              if (cancelled) return null;
              console.error('Failed to load PDF text highlights:', error);
              const fallbackSnapshot = legacyHighlights ?? {
                version: CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.VERSION,
                pages: {},
              };
              savedHighlights = fallbackSnapshot;
              highlightSnapshotRef.current = fallbackSnapshot;
              setHighlightDataReady(true);
              setHighlightSyncError(true);
              updateUnsavedHighlights(Boolean(legacyHighlights));
              restorePdfTextHighlights(container, fallbackSnapshot);
            });
        }

        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = CONTENT_FILE_VIEWER_PDF.workerSrc;

        if (!blob && !url) throw new Error('A PDF file source is required.');
        const source = blob
          ? { data: await blob.arrayBuffer() }
          : { url, withCredentials: true };
        const task = pdfjs.getDocument(source);
        loadingTask = task;
        const pdf = await task.promise;
        const extractedPages: string[][] = [];
        setPageCount(pdf.numPages);

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNumber);
          let textContent: Awaited<ReturnType<typeof page.getTextContent>> | null = null;
          let pageText = '';
          try {
            textContent = await page.getTextContent();
            pageText = textContent.items
              .map((item) => ('str' in item ? item.str : ''))
              .filter(Boolean)
              .join(' ');
          } catch (textError) {
            console.error('Failed to extract text for PDF audio playback:', textError);
          }
          extractedPages.push(splitSpeechText(pageText));

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

          const pageSurface = document.createElement('div');
          pageSurface.className = 'pdf-page-surface relative';
          pageSurface.style.width = `${baseWidth}px`;
          pageSurface.style.height = `${baseHeight}px`;

          const textLayerDiv = document.createElement('div');
          textLayerDiv.className = 'pdf-text-layer textLayer';
          textLayerDiv.style.width = `${baseWidth}px`;
          textLayerDiv.style.height = `${baseHeight}px`;
          textLayerDiv.style.setProperty('--total-scale-factor', String(viewport.scale));
          textLayerDiv.style.setProperty('--scale-round-x', '1px');
          textLayerDiv.style.setProperty('--scale-round-y', '1px');

          pageSurface.append(canvas, textLayerDiv);
          pageShell.append(pageLabel, pageSurface);
          container.append(pageShell);
          if (pendingPageRef.current === pageNumber) {
            pendingPageRef.current = null;
            pageShell.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }

          context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
          const renderTasks = [page.render({ canvas, canvasContext: context, viewport }).promise];
          if (textContent) {
            const textLayer = new pdfjs.TextLayer({
              textContentSource: textContent,
              container: textLayerDiv,
              viewport,
            });
            textLayerDiv.style.width = `${baseWidth}px`;
            textLayerDiv.style.height = `${baseHeight}px`;
            renderTasks.push(textLayer.render());
          }
          await Promise.all(renderTasks);
          if (savedHighlights) {
            restorePdfTextHighlights(container, savedHighlights, [pageNumber]);
          }
          if (pageNumber === 1 && !cancelled) onReady();
        }

        if (!cancelled) {
          speechChunksByPageRef.current = extractedPages;
          const hasText = extractedPages.some((pageChunks) => pageChunks.length > 0);
          setHasPdfText(hasText);
          setSpeechPreparing(false);
          setDocumentReady(true);
          if (!hasText) setSpeechError('This PDF does not contain readable text to play as audio.');
        }
        if (!cancelled && pdf.numPages === 0) {
          setDocumentReady(true);
          onReady();
        }
      } catch (err) {
        if (cancelled) return;
        setSpeechPreparing(false);
        console.error('Failed to render PDF preview:', err);
        onError(err);
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
      speechChunksRef.current = [];
      speechChunksByPageRef.current = [];
      speechIndexRef.current = 0;
      window[CONTENT_FILE_VIEWER_PDF_SPEECH_API.SYNTHESIS_PROPERTY]?.cancel();
      loadingTask?.destroy().catch(() => undefined);
      container?.replaceChildren();
    };
  }, [
    blob,
    enableHighlight,
    highlightContentId,
    legacyHighlightStorageKey,
    onError,
    onReady,
    updateUnsavedHighlights,
    url,
  ]);

  useEffect(() => {
    containerRef.current?.querySelectorAll<HTMLCanvasElement>('canvas[data-base-width]').forEach((canvas) => {
      const baseWidth = Number(canvas.dataset.baseWidth);
      const baseHeight = Number(canvas.dataset.baseHeight);
      const scaledWidth = Math.round(baseWidth * zoom / 100);
      const scaledHeight = Math.round(baseHeight * zoom / 100);
      canvas.style.width = `${scaledWidth}px`;
      canvas.style.height = `${scaledHeight}px`;
      if (canvas.parentElement) {
        canvas.parentElement.style.width = `${scaledWidth}px`;
        canvas.parentElement.style.height = `${scaledHeight}px`;
      }
      const textLayer = canvas.parentElement?.querySelector<HTMLElement>('.pdf-text-layer');
      if (textLayer) textLayer.style.transform = `scale(${zoom / 100})`;
    });
  }, [documentReady, zoom]);

  useEffect(() => {
    if (!documentReady || !scrollContainerRef.current || !containerRef.current) return;
    const observer = new IntersectionObserver(() => {
      const viewport = scrollContainerRef.current?.getBoundingClientRect();
      const pages = containerRef.current?.querySelectorAll<HTMLElement>('[data-page-number]');
      if (!viewport || !pages) return;
      let page = 0;
      let largestVisibleArea = 0;
      for (const target of pages) {
        const bounds = target.getBoundingClientRect();
        const visibleWidth = Math.max(0, Math.min(bounds.right, viewport.right) - Math.max(bounds.left, viewport.left));
        const visibleHeight = Math.max(0, Math.min(bounds.bottom, viewport.bottom) - Math.max(bounds.top, viewport.top));
        const visibleArea = visibleWidth * visibleHeight;
        if (visibleArea > largestVisibleArea) {
          page = Number(target.getAttribute('data-page-number'));
          largestVisibleArea = visibleArea;
        }
      }
      if (page) {
        setCurrentPage(page);
        if (!pageInputDirtyRef.current) setPageInput(String(page));
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
        <div className="mx-auto flex w-full max-w-6xl flex-nowrap items-center justify-start gap-2 overflow-x-auto px-4 py-2 sm:px-5">
          <div
            role="group"
            aria-label="Page navigation"
            className="inline-flex shrink-0 items-center"
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
              onChange={(event) => {
                pageInputDirtyRef.current = true;
                setPageInput(event.target.value);
              }}
              onBlur={() => {
                if (pageInputDirtyRef.current) submitPageInput();
              }}
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

          <span className="h-6 w-px shrink-0 bg-slate-200" aria-hidden="true" />

          <div
            role="group"
            aria-label="Zoom controls"
            className="inline-flex shrink-0 items-center"
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

          <span className="h-6 w-px shrink-0 bg-slate-200" aria-hidden="true" />

          {enableHighlight && (
            <div
              role="group"
              aria-label="PDF text highlighting"
              className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 px-1.5 shadow-sm"
            >
              {!highlightDataReady && (
                <span role="status" aria-live="polite" className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  {CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.LOADING_LABEL}
                </span>
              )}
              <Button
                type="button"
                size="icon"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => toggleSelectionTool(CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL.HIGHLIGHT)}
                disabled={!documentReady || !highlightDataReady}
                variant={selectionTool === CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL.HIGHLIGHT ? 'default' : 'outline'}
                className={`h-8 w-8 rounded-lg ${
                  selectionTool === CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL.HIGHLIGHT
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'border-amber-200 bg-white text-amber-800 hover:bg-amber-100'
                }`}
                aria-label={CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL_COPY.HIGHLIGHT.ariaLabel}
                aria-pressed={selectionTool === CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL.HIGHLIGHT}
                title={CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL_COPY.HIGHLIGHT.title}
              >
                <Highlighter className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => toggleSelectionTool(CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL.ERASE)}
                disabled={!documentReady || !highlightDataReady}
                variant={selectionTool === CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL.ERASE ? 'default' : 'outline'}
                className={`h-8 w-8 rounded-lg ${
                  selectionTool === CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL.ERASE
                    ? 'bg-slate-700 text-white hover:bg-slate-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
                aria-label={CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL_COPY.ERASE.ariaLabel}
                aria-pressed={selectionTool === CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL.ERASE}
                title={CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL_COPY.ERASE.title}
              >
                <Eraser className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={hasUnsavedHighlights ? 'default' : 'ghost'}
                size="icon"
                onClick={() => void saveHighlightChanges()}
                disabled={!documentReady || !highlightDataReady || !hasUnsavedHighlights || isSavingHighlights}
                aria-label={isSavingHighlights
                  ? CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.SAVING_LABEL
                  : CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.SAVE_BUTTON_LABEL}
                title={isSavingHighlights
                  ? CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.SAVING_LABEL
                  : CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.SAVE_BUTTON_LABEL}
                className={`h-8 w-8 rounded-lg disabled:opacity-100 ${
                  hasUnsavedHighlights
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300'
                    : 'text-slate-400 hover:bg-white hover:text-slate-700 disabled:text-slate-300'
                }`}
              >
                {isSavingHighlights
                  ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  : <Save className="h-4 w-4" aria-hidden="true" />}
              </Button>
              {(hasUnsavedHighlights || isSavingHighlights) && (
                <span
                  role="status"
                  aria-live="polite"
                  className={`whitespace-nowrap px-1 text-[11px] font-medium ${
                    isSavingHighlights ? 'text-blue-700' : 'text-amber-700'
                  }`}
                >
                  {isSavingHighlights
                    ? CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.SAVING_LABEL
                    : CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.UNSAVED_LABEL}
                </span>
              )}
            </div>
          )}

          {enableHighlight && <span className="h-6 w-px shrink-0 bg-slate-200" aria-hidden="true" />}

          <div
            role="group"
            aria-label="PDF audio controls"
            className="inline-flex h-10 shrink-0 items-center gap-1"
          >
            <Headphones className="ml-1 h-4 w-4 text-blue-600" aria-hidden="true" />
            {speechPreparing && (
              <span role="status" aria-live="polite" className="inline-flex items-center gap-1 text-xs text-blue-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                {CONTENT_FILE_VIEWER_PDF_AUDIO_PREPARING_LABEL}
              </span>
            )}
            <Button
              type="button"
              size="sm"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleSpeechToggle}
              disabled={speechPreparing || !hasPdfText || !speechAvailable || availableVoices.length === 0}
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
              {CONTENT_FILE_VIEWER_PDF_VOICE_LANGUAGES.map((language) => {
                const languageVoices = availableVoicesByLocale.get(language.code.toLowerCase()) ?? [];
                if (languageVoices.length === 0) return null;

                return (
                  <optgroup key={language.code} label={language.label}>
                    {languageVoices.map((voice) => (
                      <option key={getVoiceKey(voice)} value={getVoiceKey(voice)}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </optgroup>
                );
              })}
              {availableVoices.length === 0 && <option value="">{CONTENT_FILE_VIEWER_PDF_NO_VOICES_LABEL}</option>}
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

          {speechError && (
            <div
              role="status"
              aria-live="polite"
              className="flex h-9 min-w-0 max-w-[190px] shrink items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-xs font-medium text-amber-800"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
              <span className="truncate">{speechError}</span>
            </div>
          )}
          {highlightSyncError && (
            <div role="status" className="text-xs font-medium text-amber-700">
              {CONTENT_FILE_VIEWER_PDF_HIGHLIGHT.ERROR_MESSAGE}
            </div>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className={`min-h-0 flex-1 overflow-auto px-3 py-5 sm:px-5 ${
          selectionTool === CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL.HIGHLIGHT
            ? 'pdf-highlighter-active'
            : selectionTool === CONTENT_FILE_VIEWER_PDF_SELECTION_TOOL.ERASE
              ? 'pdf-eraser-active'
              : ''
        }`}
      >
        <div ref={containerRef} className="mx-auto w-fit min-w-full" />
      </div>
    </div>
  );
}
