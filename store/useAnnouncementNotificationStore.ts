import { create } from 'zustand';

export interface AnnouncementNotificationItem {
  id: number;
  heading: string;
  receivedAt: number;
  read: boolean;
}

interface AnnouncementNotificationState {
  items: AnnouncementNotificationItem[];
  addOrUpdate: (id: number, heading: string, markUnread?: boolean) => void;
  markAllRead: () => void;
  remove: (id: number) => void;
}

const MAX_ITEMS = 50;

export const useAnnouncementNotificationStore = create<AnnouncementNotificationState>((set) => ({
  items: [],

  addOrUpdate: (id, heading, markUnread = true) => {
    set((state) => {
      const idx = state.items.findIndex((i) => i.id === id);
      if (idx >= 0) {
        const next = [...state.items];
        next[idx] = {
          ...next[idx],
          heading,
          receivedAt: Date.now(),
          read: markUnread ? false : next[idx].read,
        };
        return { items: next };
      }
      return {
        items: [
          { id, heading, receivedAt: Date.now(), read: markUnread ? false : true },
          ...state.items,
        ].slice(0, MAX_ITEMS),
      };
    });
  },

  markAllRead: () =>
    set((state) => ({
      items: state.items.map((i) => ({ ...i, read: true })),
    })),

  remove: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
}));

export function selectUnreadAnnouncementCount(items: AnnouncementNotificationItem[]): number {
  return items.filter((i) => !i.read).length;
}
