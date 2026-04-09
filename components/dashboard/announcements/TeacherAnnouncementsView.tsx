'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnnouncementsService, Announcement, BatchesService, Batch } from '@/lib/api';
import { AnnouncementForm, AnnouncementFormValues } from './AnnouncementForm';
import { useAnnouncementSocket } from '@/lib/hooks/useAnnouncementSocket';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Pencil, Megaphone, Calendar } from 'lucide-react';

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function TeacherAnnouncementsView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<{ id: number; displayName: string }[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AnnouncementsService.list();
      setAnnouncements(res.data ?? []);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    BatchesService.getApiBatchesAll().then((res) => {
      setBatches((res.data ?? []).map((b: Batch) => ({ id: b.id!, displayName: b.displayName! })));
    }).catch(() => {});
  }, [fetchAnnouncements]);

  const handleNewAnnouncement = useCallback((a: Announcement) => {
    setAnnouncements((prev) => [a, ...prev]);
  }, []);
  useAnnouncementSocket(handleNewAnnouncement);

  const handleSubmit = async (data: AnnouncementFormValues) => {
    setIsSubmitting(true);
    try {
      if (editing?.id) {
        await AnnouncementsService.update(editing.id, data);
        toast.success('Announcement updated');
      } else {
        await AnnouncementsService.create({ ...data, visibleToTeachers: false, visibleToStudents: true });
        toast.success('Announcement created');
      }
      setDialogOpen(false);
      setEditing(null);
      fetchAnnouncements();
    } catch {
      toast.error('Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toDateStr = (d?: string) => (d ? new Date(d).toISOString().split('T')[0] : '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Megaphone className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Announcements</h1>
            <p className="text-sm text-slate-500">Announcements you've created for your batches</p>
          </div>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="h-4 w-4" /> New Announcement
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No announcements yet</p>
          <p className="text-sm text-slate-400 mt-1">Create an announcement for your batch students</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{a.heading}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{a.content}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {fmt(a.startDate)} – {fmt(a.endDate)}
                  </div>
                </div>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => { setEditing(a); setDialogOpen(true); }}
                  className="shrink-0 text-slate-500 hover:text-blue-600"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
          </DialogHeader>
          <AnnouncementForm
            mode="teacher"
            initialValues={editing ? {
              heading: editing.heading,
              content: editing.content,
              startDate: toDateStr(editing.startDate),
              endDate: toDateStr(editing.endDate),
              batchId: editing.batchId,
              visibleToStudents: true,
            } : undefined}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            batches={batches}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
