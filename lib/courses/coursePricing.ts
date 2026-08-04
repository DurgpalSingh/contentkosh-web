export function normalizeCoursePriceInput(value: string): string {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
}

export function parseCoursePrice(value: string): number {
  if (!value.trim()) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function validateCoursePrice(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return 'Price must be a whole number';
  if (Number(trimmed) < 0) return 'Price cannot be negative';
  return null;
}

export function formatCoursePrice(price?: number | string | null): string {
  const amount = Number(price ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return 'Free';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
