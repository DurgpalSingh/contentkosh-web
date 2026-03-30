import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a date-only string (YYYY-MM-DD) to an ISO-8601 datetime string at UTC midnight.
 * Returns undefined if input is falsy.
 */
export function toISODateTime(date?: string | Date): string | undefined {
  if (!date) return undefined;
  if (date instanceof Date) {
    return date.toISOString();
  }
  // If string is in YYYY-MM-DD format, treat it as date-only and return UTC midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return `${date}T00:00:00.000Z`;
  }
  // Fallback: try to parse and return ISO string
  return new Date(date).toISOString();
}

