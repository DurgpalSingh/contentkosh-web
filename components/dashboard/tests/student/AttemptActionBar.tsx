'use client';

import { Button } from '@/components/ui/button';

function buildPrimaryNextLabel(params: { hasAnswer: boolean; flagged: boolean; markedForReview: boolean }): string {
  if (params.hasAnswer && params.flagged) return 'Save-Flag & Next';
  if (params.hasAnswer && params.markedForReview) return 'Save & Review & Next';
  if (params.hasAnswer) return 'Save & Next';
  if (params.markedForReview) return 'Review & Next';
  return 'Next';
}

function buildPrimaryNextClass(params: { hasAnswer: boolean; flagged: boolean; markedForReview: boolean }): string {
  if (params.hasAnswer && params.flagged) return 'bg-amber-600 hover:bg-amber-700 text-white';
  if (params.hasAnswer && params.markedForReview) return 'bg-cyan-600 hover:bg-cyan-700 text-white';
  if (params.hasAnswer) return 'bg-emerald-600 hover:bg-emerald-700 text-white';
  if (params.markedForReview) return 'bg-indigo-600 hover:bg-indigo-700 text-white';
  return 'bg-slate-900 hover:bg-slate-800 text-white';
}

export function AttemptActionBar({
  canGoPrev,
  canGoNext,
  hasAnswer,
  flagged,
  onPrev,
  onNext,
  onClearAnswer,
  onToggleFlag,
  onToggleMarkForReview,
  markedForReview,
}: {
  canGoPrev: boolean;
  canGoNext: boolean;
  hasAnswer: boolean;
  flagged: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClearAnswer: () => void;
  onToggleFlag: () => void;
  onToggleMarkForReview: () => void;
  markedForReview: boolean;
}) {
  const nextLabel = buildPrimaryNextLabel({ hasAnswer, flagged, markedForReview });
  const nextClass = buildPrimaryNextClass({ hasAnswer, flagged, markedForReview });
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={!canGoPrev} onClick={onPrev}>
          Previous
        </Button>
        <Button type="button" variant="outline" onClick={onClearAnswer} disabled={!hasAnswer}>
          Clear answer
        </Button>
        <Button
          type="button"
          variant="outline"
          className={flagged ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-amber-200 text-amber-900 hover:bg-amber-50'}
          onClick={onToggleFlag}
        >
          {flagged ? 'Flag: On' : 'Flag'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={
            markedForReview
              ? 'border-violet-400 bg-violet-50 text-violet-900'
              : 'border-violet-200 text-violet-800 hover:bg-violet-50'
          }
          onClick={onToggleMarkForReview}
        >
          {markedForReview ? 'Review: On' : 'Mark for review'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <Button type="button" className={nextClass} disabled={!canGoNext} onClick={onNext}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
