'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnnouncementsService, Announcement } from '@/lib/api';
import { useAnnouncementSocket } from '@/lib/hooks/useAnnouncementSocket';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Megaphone, Calendar, BookOpen, Users } from 'lucide-react';

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function scopeBadge(a: Announcement) {
  if (a.batchId) return { text: 'Batch', cls: 'bg-purple-100 text-purple-700', icon: Users };
  if (a.courseId) return { text: 'Course', cls: 'bg-blue-100 text-blue-700', icon: BookOpen };
  return { text: 'General', cls: 'bg-green-100 text-green-700', icon: Megaphone };
}

export function StudentAnnouncementsView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AnnouncementsService.getMyAnnouncements()
      .then((res) => setAnnouncements(res.data ?? []))
      .catch(() => toast.error('Failed to load announcements'))
      .finally(() => setLoading(false));
  }, []);

  const handleNewAnnouncement = useCallback((a: Announcement) => {
    if (!a.visibleToStudents) return;
    setAnnouncements((prev) => [a, ...prev]);
    toast.info(`New announcement: ${a.heading}`);
  }, []);
  useAnnouncementSocket(handleNewAnnouncement);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Megaphone className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-sm text-slate-500">Stay up to date with the latest updates</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No announcements</p>
          <p className="text-sm text-slate-400 mt-1">Check back later for updates from your teachers</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((a) => {
            const scope = scopeBadge(a);
            const ScopeIcon = scope.icon;
            return (
              <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-50 rounded-lg shrink-0">
                    <Megaphone className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-900">{a.heading}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${scope.cls}`}>
                        <ScopeIcon className="h-3 w-3" />{scope.text}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{a.content}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{fmt(a.startDate)} – {fmt(a.endDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
