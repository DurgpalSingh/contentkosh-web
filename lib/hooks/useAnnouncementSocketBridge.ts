'use client';

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { ANNOUNCEMENT_SOCKET_EVENTS } from '@/lib/constants/announcement';
import { ANNOUNCEMENTS_LIST_REFRESH_EVENT } from '@/lib/constants/announcementFeed';
import { AnnouncementsService } from '@/lib/api';
import { getAnnouncementSocketBaseUrl } from '@/lib/utils';
import { useAnnouncementNotificationStore } from '@/store/useAnnouncementNotificationStore';
import '@/lib/auth';

function dispatchListRefresh(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ANNOUNCEMENTS_LIST_REFRESH_EVENT));
}

export interface AnnouncementSocketPayload {
  id?: number;
  businessId?: number;
}

/**
 * Single Socket.IO connection for the dashboard: updates the notification store and
 * broadcasts a window event so the announcements page refetches without a second socket.
 */
export function useAnnouncementSocketBridge(
  enabled: boolean,
  businessId: number | undefined,
  currentUserId: number | undefined,
): void {
  const addOrUpdate = useAnnouncementNotificationStore((s) => s.addOrUpdate);
  const remove = useAnnouncementNotificationStore((s) => s.remove);

  const dedupeRef = useRef<Map<number, number>>(new Map());
  const inFlightRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled || businessId === undefined) return undefined;

    const baseUrl = getAnnouncementSocketBaseUrl();
    const socket: Socket = io(baseUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    const isRelevantAnnouncementPayload = (payload: AnnouncementSocketPayload): boolean => {
      if (payload.id === undefined || payload.businessId === undefined) return false;
      if (payload.businessId !== businessId) return false;
      const now = Date.now();
      const last = dedupeRef.current.get(payload.id);
      if (last !== undefined && now - last < 400) return false;
      dedupeRef.current.set(payload.id, now);
      return true;
    };

    const fetchAndMaybeNotify = async (payload: AnnouncementSocketPayload, isNewEvent: boolean) => {
      if (!isRelevantAnnouncementPayload(payload) || payload.id === undefined) return;
      const id = payload.id;
      if (inFlightRef.current.has(id)) return;
      inFlightRef.current.add(id);
      try {
        const res = await AnnouncementsService.getAnnouncementById(id);
        const ann = res.data;
        const heading = ann?.heading?.trim() || `Announcement #${id}`;
        if (currentUserId !== undefined && ann?.createdBy === currentUserId && isNewEvent) {
          return;
        }
        addOrUpdate(id, heading, isNewEvent);
      } catch {
        if (isNewEvent) {
          addOrUpdate(id, `Announcement #${id}`, true);
        }
      } finally {
        inFlightRef.current.delete(id);
        dispatchListRefresh();
      }
    };

    const onNew = (payload: AnnouncementSocketPayload) => {
      void fetchAndMaybeNotify(payload, true);
    };

    const onUpdated = (payload: AnnouncementSocketPayload) => {
      void fetchAndMaybeNotify(payload, false);
    };

    const onDeleted = (payload: AnnouncementSocketPayload) => {
      if (!isRelevantAnnouncementPayload(payload) || payload.id === undefined) return;
      remove(payload.id);
      dispatchListRefresh();
    };

    socket.on(ANNOUNCEMENT_SOCKET_EVENTS.NEW, onNew);
    socket.on(ANNOUNCEMENT_SOCKET_EVENTS.UPDATED, onUpdated);
    socket.on(ANNOUNCEMENT_SOCKET_EVENTS.DELETED, onDeleted);

    return () => {
      socket.off(ANNOUNCEMENT_SOCKET_EVENTS.NEW, onNew);
      socket.off(ANNOUNCEMENT_SOCKET_EVENTS.UPDATED, onUpdated);
      socket.off(ANNOUNCEMENT_SOCKET_EVENTS.DELETED, onDeleted);
      socket.disconnect();
    };
  }, [enabled, businessId, currentUserId, addOrUpdate, remove]);
}
