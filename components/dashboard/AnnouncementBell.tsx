'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  selectUnreadAnnouncementCount,
  useAnnouncementNotificationStore,
} from '@/store/useAnnouncementNotificationStore';
import { cn } from '@/lib/utils';

export interface AnnouncementBellProps {
  businessSlug: string;
}

export function AnnouncementBell({ businessSlug }: AnnouncementBellProps) {
  const items = useAnnouncementNotificationStore((s) => s.items);
  const markAllRead = useAnnouncementNotificationStore((s) => s.markAllRead);
  const unread = selectUnreadAnnouncementCount(items);
  const announcementHref = `/${businessSlug}/dashboard/announcement`;

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) markAllRead();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500 relative"
          aria-label={unread > 0 ? `Announcements, ${unread} unread` : 'Announcements'}
        >
          <Bell className="h-6 w-6" />
          {unread > 0 ? (
            <span
              className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white"
              aria-hidden
            >
              {unread > 99 ? '99+' : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-slate-100 px-3 py-2">
          <p className="text-sm font-semibold text-slate-900">Announcements</p>
          <p className="text-xs text-slate-500">Recent updates for your institute</p>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">No announcements yet</p>
          ) : (
            <ul className="py-1">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`${announcementHref}#announcement-${item.id}`}
                    className={cn(
                      'block px-3 py-2.5 text-sm transition-colors hover:bg-slate-50',
                      !item.read && 'bg-blue-50/60',
                    )}
                  >
                    <span className="line-clamp-2 font-medium text-slate-900">{item.heading}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-slate-100 px-3 py-2">
          <Link
            href={announcementHref}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Open announcements page
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
