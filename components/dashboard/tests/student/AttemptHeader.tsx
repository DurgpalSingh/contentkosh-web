'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AttemptHeader({
  backHref,
  kindLabel,
  testName,
  subtitle,
  rightSlot,
  onSubmit,
  submitDisabled,
}: {
  backHref: string;
  kindLabel: string;
  testName: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  onSubmit: () => void;
  submitDisabled: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={backHref} className="inline-flex items-center text-sm text-violet-700 hover:text-violet-900">
          <ChevronLeft className="h-4 w-4 mr-1" aria-hidden />
          My Tests
        </Link>

        <div className="flex items-center gap-2">{rightSlot}</div>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded-full mb-2 bg-slate-100 text-slate-700">
            {kindLabel}
          </span>
          <h1 className="text-xl font-bold text-gray-900">{testName}</h1>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>

        <Button
          type="button"
          className="bg-violet-600 hover:bg-violet-700 text-white"
          onClick={onSubmit}
          disabled={submitDisabled}
        >
          Submit test
        </Button>
      </div>
    </div>
  );
}

