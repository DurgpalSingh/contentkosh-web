import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a date-only string (YYYY-MM-DD) to an ISO-8601 datetime string at UTC midnight.
 * Returns undefined if input is falsy.
 */
export function toISODateTime(
  date?: string | Date,
  options?: { format?: 'iso' | 'datetimeLocal' },
): string | undefined {
  if (!date) return undefined;
  const format = options?.format ?? 'iso';

  const asDate = (() => {
    if (date instanceof Date) return date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Date(`${date}T00:00:00.000Z`);
    }
    return new Date(date);
  })();

  if (Number.isNaN(asDate.getTime())) return undefined;

  if (format === 'datetimeLocal') {
    const offsetMs = asDate.getTimezoneOffset() * 60_000;
    return new Date(asDate.getTime() - offsetMs).toISOString().slice(0, 16);
  }

  return asDate.toISOString();
}

