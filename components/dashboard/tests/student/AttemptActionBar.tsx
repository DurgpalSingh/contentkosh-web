'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function buildPrimaryNextLabel(params: { hasAnswer: boolean; markedForReview: boolean }): string {
  if (params.hasAnswer && params.markedForReview) return 'Save & Review & Next';
  if (params.hasAnswer) return 'Save & Next';
  if (params.markedForReview) return 'Review & Next';
  return 'Next';
}

function buildPrimaryNextClass(params: { hasAnswer: boolean; markedForReview: boolean }): string {
  if (params.hasAnswer && params.markedForReview) return 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/25';
  if (params.hasAnswer) return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25';
  if (params.markedForReview) return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25';
  return 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25';
}

export function AttemptActionBar({
  canGoPrev,
  canGoNext,
  hasAnswer,
  onPrev,
  onNext,
  onClearAnswer,
  onToggleMarkForReview,
  markedForReview,
}: {
  canGoPrev: boolean;
  canGoNext: boolean;
  hasAnswer: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClearAnswer: () => void;
  onToggleMarkForReview: () => void;
  markedForReview: boolean;
}) {
  const nextLabel = buildPrimaryNextLabel({ hasAnswer, markedForReview });
  const nextClass = buildPrimaryNextClass({ hasAnswer, markedForReview });
  return (
    <div className="w-full shrink-0 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 px-3 py-3.5 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] sm:px-4 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="default"
            className="h-10 border-slate-200 bg-white px-4 text-slate-800 shadow-sm hover:bg-slate-50 gap-1.5"
            disabled={!canGoPrev}
            onClick={onPrev}
          >
            <ChevronLeft className="h-4 w-4 opacity-70" aria-hidden />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="default"
            className="h-10 border-slate-200 bg-white px-4 text-slate-800 shadow-sm hover:bg-slate-50"
            onClick={onClearAnswer}
            disabled={!hasAnswer}
          >
            Clear answer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="default"
            className={`h-10 px-4 shadow-sm ${
              markedForReview
                ? 'border-violet-300 bg-violet-50 text-violet-900 hover:bg-violet-100/80'
                : 'border-violet-200/80 text-violet-900 hover:bg-violet-50'
            }`}
            onClick={onToggleMarkForReview}
          >
            {markedForReview ? 'Review: On' : 'Mark for review'}
          </Button>
        </div>

        <div className="flex justify-end sm:pl-2">
          <Button
            type="button"
            size="lg"
            className={`h-11 min-w-[9rem] gap-1.5 px-5 ${nextClass}`}
            disabled={!canGoNext}
            onClick={onNext}
          >
            {nextLabel}
            <ChevronRight className="h-4 w-4 opacity-90" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
