'use client';

import { useEffect } from 'react';
import { ANNOUNCEMENTS_LIST_REFRESH_EVENT } from '@/lib/constants/announcementFeed';

/**
 * Refetches announcement list data when the dashboard socket bridge dispatches
 * {@link ANNOUNCEMENTS_LIST_REFRESH_EVENT} (avoids a second Socket.IO connection on this page).
 */
export function useAnnouncementsListRefreshListener(
  onRefresh: () => void | Promise<void>,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) return undefined;

    const handler = () => {
      void onRefresh();
    };

    window.addEventListener(ANNOUNCEMENTS_LIST_REFRESH_EVENT, handler);
    return () => window.removeEventListener(ANNOUNCEMENTS_LIST_REFRESH_EVENT, handler);
  }, [enabled, onRefresh]);
}
