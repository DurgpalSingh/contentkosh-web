'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Eraser, Highlighter, MessageSquare, Minus, Pen, RotateCcw, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTENT_FILE_VIEWER_PDF } from '@/lib/contentFileViewer.config';

type AnnotationTool = 'pen' | 'line' | 'comment';

type Point = { x: number; y: number };

type PdfAnnotation = {
  id: string;
  type: AnnotationTool;
  page: number;
  points: Point[];
  text?: string;
  color: string;
  strokeWidth: number;
};

type PdfAnnotationEditorProps = {
  blob: Blob;
  contentId: number;
  title: string;
  onExit: () => void;
};

const STORAGE_PREFIX = 'contentkosh:pdf-annotations:v1:';
const DEFAULT_COLOR = '#e11d48';
const DEFAULT_STROKE_WIDTH = 3;

function storageKey(contentId: number) {
  return `${STORAGE_PREFIX}${contentId}`;
}

function getPoint(event: { clientX: number; clientY: number; currentTarget: Element }): Point {
  const bounds = event.currentTarget.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
    y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
  };
}

function annotationPoints(annotation: PdfAnnotation) {
  return annotation.points.map((point) => `${point.x * 100},${point.y * 100}`).join(' ');
}

export function PdfAnnotationEditor({ blob, contentId, title, onExit }: PdfAnnotationEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [annotations, setAnnotations] = useState<PdfAnnotation[]>([]);
  const [tool, setTool] = useState<AnnotationTool>('pen');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PdfAnnotation | null>(null);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const annotationsRef = useRef<PdfAnnotation[]>([]);
  const draftRef = useRef<PdfAnnotation | null>(null);
  const toolRef = useRef<AnnotationTool>('pen');

  useEffect(() => { annotationsRef.current = annotations; }, [annotations]);
  useEffect(() => { draftRef.current = draft; }, [draft]);
  useEffect(() => { toolRef.current = tool; }, [tool]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey(contentId));
      if (saved) setAnnotations(JSON.parse(saved) as PdfAnnotation[]);
    } catch {
      setMessage('Saved annotations could not be loaded.');
    }
  }, [contentId]);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: { destroy: () => Promise<void> } | null = null;
    const container = containerRef.current;

    async function renderPdf() {
      if (!container) return;
      container.replaceChildren();
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = CONTENT_FILE_VIEWER_PDF.workerSrc;
        const task = pdfjs.getDocument({ data: await blob.arrayBuffer() });
        loadingTask = task;
        const pdf = await task.promise;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: CONTENT_FILE_VIEWER_PDF.baseScale });
          const availableWidth = Math.max(
            container.clientWidth - CONTENT_FILE_VIEWER_PDF.horizontalPaddingPx,
            CONTENT_FILE_VIEWER_PDF.minAvailableWidthPx,
          );
          const scale = Math.min(CONTENT_FILE_VIEWER_PDF.maxScale, availableWidth / baseViewport.width);
          const viewport = page.getViewport({ scale });
          const outputScale = window.devicePixelRatio || CONTENT_FILE_VIEWER_PDF.baseScale;
          const pageShell = document.createElement('div');
          pageShell.className = 'mx-auto mb-6 w-fit max-w-full';

          const pageLabel = document.createElement('div');
          pageLabel.className = 'mb-2 text-center text-xs font-medium text-slate-500';
          pageLabel.textContent = CONTENT_FILE_VIEWER_PDF.pageLabel(pageNumber, pdf.numPages);

          const surface = document.createElement('div');
          surface.className = 'relative overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200';
          surface.style.width = `${Math.floor(viewport.width)}px`;
          surface.style.height = `${Math.floor(viewport.height)}px`;

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas rendering is not supported.');
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          surface.append(canvas);

          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 100 100');
          svg.setAttribute('preserveAspectRatio', 'none');
          svg.setAttribute('class', 'absolute inset-0 h-full w-full');
          svg.setAttribute('aria-label', `Annotation layer for page ${pageNumber}`);
          svg.dataset.page = String(pageNumber);
          svg.addEventListener('pointerdown', (event) => beginDrawing(pageNumber, event as unknown as ReactPointerEvent<SVGSVGElement>));
          svg.addEventListener('pointermove', (event) => continueDrawing(event as unknown as ReactPointerEvent<SVGSVGElement>));
          svg.addEventListener('pointerup', finishDrawing);
          svg.addEventListener('pointercancel', finishDrawing);
          surface.append(svg);
          pageShell.append(pageLabel, surface);
          container.append(pageShell);
          context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
          await page.render({ canvas, canvasContext: context, viewport }).promise;
        }
        if (!cancelled) setStatus('ready');
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to render annotation editor:', error);
          setStatus('error');
        }
      }
    }

    renderPdf();
    return () => {
      cancelled = true;
      loadingTask?.destroy().catch(() => undefined);
      container?.replaceChildren();
    };
  // The PDF page DOM is intentionally constructed once per source blob.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blob]);

  useEffect(() => {
    document.querySelectorAll<SVGSVGElement>('[data-page]').forEach((svg) => {
      const page = Number(svg.dataset.page);
      svg.replaceChildren();
      const pageAnnotations = annotations.filter((annotation) => annotation.page === page);
      const visibleAnnotations = draft?.page === page ? [...pageAnnotations, draft] : pageAnnotations;
      visibleAnnotations.forEach((annotation) => {
        const element = document.createElementNS('http://www.w3.org/2000/svg', annotation.type === 'comment' ? 'g' : 'polyline');
        if (annotation.type !== 'comment') {
          element.setAttribute('points', annotationPoints(annotation));
          element.setAttribute('fill', 'none');
          element.setAttribute('stroke', annotation.color);
          element.setAttribute('stroke-width', String(annotation.strokeWidth / 10));
          element.setAttribute('stroke-linecap', 'round');
          element.setAttribute('stroke-linejoin', 'round');
        } else {
          const [point] = annotation.points;
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', String(point.x * 100));
          circle.setAttribute('cy', String(point.y * 100));
          circle.setAttribute('r', '1.5');
          circle.setAttribute('fill', annotation.color);
          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          label.setAttribute('x', String(point.x * 100 + 2));
          label.setAttribute('y', String(point.y * 100 - 2));
          label.setAttribute('font-size', '2.4');
          label.setAttribute('fill', annotation.color);
          label.textContent = annotation.text ?? '';
          element.append(circle, label);
        }
        element.dataset.annotationId = annotation.id;
        element.addEventListener('pointerdown', (event) => {
          event.stopPropagation();
          setSelectedId(annotation.id);
        });
        svg.append(element);
      });
    });
  }, [annotations, draft, status]);

  const save = () => {
    window.localStorage.setItem(storageKey(contentId), JSON.stringify(annotations));
    setDirty(false);
    setMessage('Saved locally');
    window.setTimeout(() => setMessage(''), 2200);
  };

  const updateAnnotations = (next: PdfAnnotation[]) => {
    annotationsRef.current = next;
    setAnnotations(next);
    setDirty(true);
  };

  const beginDrawing = (page: number, event: ReactPointerEvent<SVGSVGElement>) => {
    if (toolRef.current === 'comment') {
      const text = window.prompt('Enter your comment');
      if (!text?.trim()) return;
      updateAnnotations([
        ...annotationsRef.current,
        {
          id: crypto.randomUUID(),
          type: 'comment',
          page,
          points: [getPoint(event)],
          text: text.trim(),
          color: DEFAULT_COLOR,
          strokeWidth: DEFAULT_STROKE_WIDTH,
        },
      ]);
      return;
    }
    const point = getPoint(event);
    setDraft({
      id: crypto.randomUUID(),
      type: toolRef.current,
      page,
      points: [point],
      color: DEFAULT_COLOR,
      strokeWidth: DEFAULT_STROKE_WIDTH,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const continueDrawing = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!draftRef.current) return;
    const point = getPoint(event);
    setDraft((current) => {
      if (!current) return current;
      const next = {
        ...current,
        points: current.type === 'line' ? [current.points[0], point] : [...current.points, point],
      };
      draftRef.current = next;
      return next;
    });
  };

  const finishDrawing = () => {
    const currentDraft = draftRef.current;
    if (!currentDraft || (currentDraft.type === 'line' && currentDraft.points.length < 2)) return;
    updateAnnotations([...annotationsRef.current, currentDraft]);
    draftRef.current = null;
    setDraft(null);
  };

  const editSelectedComment = () => {
    const selected = annotations.find((annotation) => annotation.id === selectedId);
    if (!selected || selected.type !== 'comment') return;
    const text = window.prompt('Edit comment', selected.text);
    if (!text?.trim()) return;
    updateAnnotations(annotationsRef.current.map((annotation) =>
      annotation.id === selectedId ? { ...annotation, text: text.trim() } : annotation,
    ));
  };

  const removeSelected = () => {
    if (!selectedId) return;
    updateAnnotations(annotationsRef.current.filter((annotation) => annotation.id !== selectedId));
    setSelectedId(null);
  };

  const exit = () => {
    if (dirty && !window.confirm('You have unsaved annotations. Leave without saving?')) return;
    onExit();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mr-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Highlighter className="h-4 w-4 text-blue-600" />
          Annotating {title}
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <Button type="button" size="sm" variant={tool === 'pen' ? 'default' : 'ghost'} onClick={() => setTool('pen')} title="Pen">
            <Pen className="mr-1.5 h-4 w-4" /> Pen
          </Button>
          <Button type="button" size="sm" variant={tool === 'line' ? 'default' : 'ghost'} onClick={() => setTool('line')} title="Line">
            <Minus className="mr-1.5 h-4 w-4" /> Line
          </Button>
          <Button type="button" size="sm" variant={tool === 'comment' ? 'default' : 'ghost'} onClick={() => setTool('comment')} title="Comment">
            <MessageSquare className="mr-1.5 h-4 w-4" /> Comment
          </Button>
        </div>
        <Button type="button" size="sm" variant="outline" disabled={!selectedId} onClick={removeSelected} title="Delete selected annotation">
          <Eraser className="mr-1.5 h-4 w-4" /> Delete
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={!selectedId} onClick={editSelectedComment} title="Edit selected comment">
          <RotateCcw className="mr-1.5 h-4 w-4" /> Edit comment
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500">{message || (dirty ? 'Unsaved changes' : 'All changes saved')}</span>
          <Button type="button" size="sm" onClick={save} disabled={!dirty} className="bg-blue-600 text-white hover:bg-blue-700">
            <Save className="mr-1.5 h-4 w-4" /> Save
          </Button>
          <Button type="button" size="icon" variant="ghost" onClick={exit} aria-label="Close annotation editor">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-3 py-5 sm:px-5">
        {status === 'loading' && <div className="py-10 text-center text-sm text-slate-500">Preparing annotation workspace...</div>}
        {status === 'error' && <div className="py-10 text-center text-sm text-red-700">Could not prepare this PDF for annotation.</div>}
        <div ref={containerRef} />
      </div>
    </div>
  );
}