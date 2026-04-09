export const DEFAULT_ANNOUNCEMENT_END_DAYS = 7;

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const body = (error as { body?: { message?: string } }).body;
    if (body?.message) return body.message;
  }
  return fallback;
}

export function defaultEndDate(days = DEFAULT_ANNOUNCEMENT_END_DAYS): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function toggleSetItem<T>(current: Set<T>, item: T): Set<T> {
  const next = new Set(current);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}
