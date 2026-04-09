/** Must match backend `ANNOUNCEMENT_SOCKET_EVENTS` */
export const ANNOUNCEMENT_SOCKET_EVENTS = {
  NEW: 'announcement:new',
  UPDATED: 'announcement:updated',
  DELETED: 'announcement:deleted',
  UNAUTHORIZED: 'unauthorized',
} as const;
