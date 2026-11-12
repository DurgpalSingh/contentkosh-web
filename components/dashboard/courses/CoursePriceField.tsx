'use client';

import { IndianRupee } from 'lucide-react';
import { normalizeCoursePriceInput } from '@/lib/courses/coursePricing';

interface CoursePriceFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CoursePriceField({ value, onChange, disabled }: CoursePriceFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor="course-price" className="block text-sm font-medium text-gray-700">
        Price
      </label>
      <div className="relative">
        <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          id="course-price"
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(normalizeCoursePriceInput(e.target.value))}
          placeholder="0 for free"
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
          disabled={disabled}
        />
      </div>
      <p className="text-xs text-gray-500">Enter 0 for a free course.</p>
    </div>
  );
}
