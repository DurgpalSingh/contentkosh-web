/**
 * Converts a server-relative media path (e.g. /uploads/questions/file.png)
 * into a full URL pointing at the backend.
 *
 * If the value is already an absolute URL it is returned unchanged.
 * If the value is null/undefined, null is returned.
 */
export function resolveMediaUrl(pathOrUrl: string | null | undefined): string | null {
  if (pathOrUrl == null || typeof pathOrUrl !== 'string') return null;
  const t = pathOrUrl.trim();
  if (t.length === 0) return null;
  // Already absolute
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('blob:')) return t;
  // Relative — prefix with the backend base URL
  const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/+$/, '');
  const path = t.startsWith('/') ? t : `/${t}`;
  return `${base}${path}`;
}
