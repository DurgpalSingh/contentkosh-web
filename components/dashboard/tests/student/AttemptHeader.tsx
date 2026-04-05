'use client';

import Link from 'next/link';
import { ChevronLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AttemptHeader({
  backHref,
  kindLabel,
  testName,
  metaLine,
  timerSlot,
  answeredCount,
  totalQuestions,
  onSubmit,
  submitDisabled,
}: {
  backHref: string;
  kindLabel: string;
  testName: string;
  metaLine?: string;
  timerSlot?: React.ReactNode;
  answeredCount: number;
  totalQuestions: number;
  onSubmit: () => void;
  submitDisabled: boolean;
}) {
  return (
    <header className="w-full shrink-0 rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)]">
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100/90">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          My Tests
        </Link>
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between xl:gap-8">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                {testName}
              </h1>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {kindLabel}
              </span>
            </div>
            {metaLine ? <p className="text-sm text-slate-500 leading-relaxed">{metaLine}</p> : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 xl:shrink-0 xl:pt-0.5">
            {timerSlot}
            <div
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm text-slate-700"
              role="status"
            >
              <span className="tabular-nums font-semibold text-slate-900">
                {answeredCount}/{totalQuestions}
              </span>
              <span className="text-slate-500">answered</span>
            </div>
            <Button
              type="button"
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 gap-2 px-5 min-h-11"
              onClick={onSubmit}
              disabled={submitDisabled}
            >
              <Send className="h-4 w-4" aria-hidden />
              Submit
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
