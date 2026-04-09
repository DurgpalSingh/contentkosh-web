'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnnouncementsService, Announcement, BatchesService, ExamsService, Batch, Course, Exam } from '@/lib/api';
import { AnnouncementForm, AnnouncementFormValues } from './AnnouncementForm';
import { useAnnouncementSocket } from '@/lib/hooks/useAnnouncementSocket';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Plus, Pencil, Trash2, Megaphone, Calendar, Users, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

function scopeLabel(a: Announcement) {
  if (a.batchId) return { text: 'Batch', cls: 'bg-purple-100 text-purple-700' };
  if (a.courseId) return { text: 'Course', cls: 'bg-blue-100 text-blue-700' };
  return { text: 'Business-wide', cls: 'bg-green-100 text-green-700' };
}

function visibilityLabel(a: Announcement) {
  if (a.visibleToTeachers && a.visibleToStudents) return 'Teachers & Students';
  if (a.visibleToTeachers) return 'Teachers only';
  return 'Students only';
}

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function AdminAnnouncementsView() {
  const { business } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [batches, setBatches] = useState<{ id: number; displayName: string; courseId?: number }[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    // fetch courses & batches for form dropdowns
    (async () => {
      try {
        if (!business?.id) return;
        const examsRes = await ExamsService.getApiBusinessExams(business.id, 'courses');
        const exams: Exam[] = examsRes.data ?? [];
        const allCourses: { id: number; name: string }[] = exams.flatMap((e) =>
          ((e.courses as Course[]) ?? []).map((c) => ({ id: c.id!, name: c.name! }))
        );
        setCourses(allCourses);
        const batchRes = await BatchesService.getApiBatchesAll();
        const allBatches = (batchRes.data ?? []).map((b: Batch) => ({
          id: b.id!,
          displayName: b.displayName!,
          courseId: b.courseId,
        }));
        setBatches(allBatches);
      } catch { /* non-critical */ }
    })();
  }, [fetchAnnouncements, business?.id]);

  const handleNewAnnouncement = useCallback((a: Announcement) => {
    setAnnouncements((prev) => [a, ...prev]);
  }, []);
  useAnnouncementSocket(handleNewAnnouncement);

  const handleSubmit = async (data: AnnouncementFormValues) => {
    setIsSubmitting(true);
    try {
      if (editing?.id) {
        await AnnouncementsService.update(editing.id, {
          ...data,
          startDate: data.startDate,
          endDate: data.endDate,
        });
        toast.success('Announcement updated');
      } else {
        await AnnouncementsService.create({
          ...data,
          startDate: data.startDate,
          endDate: data.endDate,
        });
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

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await AnnouncementsService.remove(deleteId);
      toast.success('Announcement deleted');
      setDeleteId(null);
      fetchAnnouncements();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const toDateStr = (d?: string) => (d ? new Date(d).toISOString().split('T')[0] : '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Megaphone className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
            <p className="text-sm text-slate-500">Manage and broadcast announcements</p>
          </div>
        </div>
        <Button
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Plus className="h-4 w-4" /> New Announcement
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: announcements.length, icon: Megaphone, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active', value: announcements.filter(a => a.isActive).length, icon: Calendar, color: 'text-green-600 bg-green-50' },
          { label: 'Inactive', value: announcements.filter(a => !a.isActive).length, icon: Users, color: 'text-slate-600 bg-slate-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}><Icon className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No announcements yet</p>
          <p className="text-sm text-slate-400 mt-1">Create your first announcement to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Heading</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Date Range</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Scope</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Visibility</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {announcements.map((a) => {
                const scope = scopeLabel(a);
                return (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900 truncate max-w-xs">{a.heading}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{a.content}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                      {fmt(a.startDate)} – {fmt(a.endDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${scope.cls}`}>
                        {scope.text}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">{visibilityLabel(a)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {a.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => { setEditing(a); setDialogOpen(true); }}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => setDeleteId(a.id!)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
          </DialogHeader>
          <AnnouncementForm
            mode="admin"
            initialValues={editing ? {
              heading: editing.heading,
              content: editing.content,
              startDate: toDateStr(editing.startDate),
              endDate: toDateStr(editing.endDate),
              courseId: editing.courseId,
              batchId: editing.batchId,
              visibleToTeachers: editing.visibleToTeachers ?? false,
              visibleToStudents: editing.visibleToStudents ?? false,
            } : undefined}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            courses={courses}
            batches={batches}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
