/**
 * Socket.IO runs on the API host without the `/api` prefix.
 */
export function getAnnouncementSocketBaseUrl(): string {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  return api.replace(/\/api\/?$/, '');
}
