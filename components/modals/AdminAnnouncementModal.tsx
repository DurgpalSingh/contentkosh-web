'use client';

import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  AnnouncementsService,
  BatchesService,
  ExamsService,
} from '@/lib/api';
import type { Announcement, AnnouncementScope, Course } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fromDatetimeLocalInputValue, toDatetimeLocalInputValue } from '@/components/announcements/announcementDateUtils';
import { getErrorMessage, defaultEndDate, toggleSetItem } from '@/components/announcements/announcementHelpers';
import { toast } from 'sonner';

type CourseRow = { id: number; name: string };
type BatchRow = { id: number; label: string };

export interface AdminAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  onSuccess: () => void;
  initial?: Announcement | null;
}

export function AdminAnnouncementModal({
  isOpen,
  onClose,
  businessId,
  onSuccess,
  initial,
}: AdminAnnouncementModalProps) {
  const [heading, setHeading] = useState('');
  const [content, setContent] = useState('');
  const [startLocal, setStartLocal] = useState('');
  const [endLocal, setEndLocal] = useState('');
  const [scope, setScope] = useState<AnnouncementScope>('BATCH');
  const [visibleToAdmins, setVisibleToAdmins] = useState(false);
  const [visibleToTeachers, setVisibleToTeachers] = useState(false);
  const [visibleToStudents, setVisibleToStudents] = useState(true);
  const [targetAllCourses, setTargetAllCourses] = useState(false);
  const [targetAllBatches, setTargetAllBatches] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<number>>(new Set());
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<number>>(new Set());
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initial?.id);
  const title = isEdit ? 'Edit announcement' : 'Create announcement';

  const resetForCreate = useCallback(() => {
    const now = new Date().toISOString();
    setHeading('');
    setContent('');
    setStartLocal(toDatetimeLocalInputValue(now));
    setEndLocal(toDatetimeLocalInputValue(defaultEndDate()));
    setScope('BATCH');
    setVisibleToAdmins(true);
    setVisibleToTeachers(true);
    setVisibleToStudents(true);
    setTargetAllCourses(false);
    setTargetAllBatches(false);
    setSelectedCourseIds(new Set());
    setSelectedBatchIds(new Set());
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (initial?.id) {
      setHeading(initial.heading ?? '');
      setContent(initial.content ?? '');
      setStartLocal(toDatetimeLocalInputValue(initial.startDate));
      setEndLocal(toDatetimeLocalInputValue(initial.endDate));
      setScope((initial.scope as AnnouncementScope) ?? 'BATCH');
      setVisibleToAdmins(initial.visibleToAdmins ?? false);
      setVisibleToTeachers(initial.visibleToTeachers ?? false);
      setVisibleToStudents(initial.visibleToStudents ?? false);
      setTargetAllCourses(initial.targetAllCourses ?? false);
      setTargetAllBatches(initial.targetAllBatches ?? false);
      const cIds = new Set<number>();
      const bIds = new Set<number>();
      for (const t of initial.targets ?? []) {
        if (t.courseId != null) cIds.add(t.courseId);
        if (t.batchId != null) bIds.add(t.batchId);
      }
      setSelectedCourseIds(cIds);
      setSelectedBatchIds(bIds);
    } else {
      resetForCreate();
    }
  }, [isOpen, initial, resetForCreate]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      setMetaLoading(true);
      try {
        const examsRes = await ExamsService.getApiBusinessExams(businessId, 'courses');
        const fetchedExams = examsRes.data ?? [];
        const courseMap = new Map<number, Course>();
        for (const exam of fetchedExams) {
          const examCourses = (exam.courses as Course[]) || [];
          for (const course of examCourses) {
            if (course?.id != null && course.name) {
              courseMap.set(course.id, course);
            }
          }
        }

        const courseRows: CourseRow[] = Array.from(courseMap.values())
          .sort((a, b) => {
            const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tB - tA;
          })
          .map((course) => ({ id: course.id!, name: course.name! }));
        const batchRes = await BatchesService.getApiBatchesAll('course');
        const rawBatches = (batchRes as { data?: Array<{ id?: number; displayName?: string; codeName?: string }> })
          .data;
        const batchRows: BatchRow[] = [];
        for (const b of rawBatches ?? []) {
          if (b.id != null) {
            const label =
              b.displayName && b.codeName
                ? `${b.displayName} (${b.codeName})`
                : b.displayName || b.codeName || `Batch #${b.id}`;
            batchRows.push({ id: b.id, label });
          }
        }
        if (!cancelled) {
          setCourses(courseRows);
          setBatches(batchRows);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) toast.error(getErrorMessage(e, 'Failed to load courses or batches'));
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, businessId]);

  const toggleCourse = (id: number) => {
    setSelectedCourseIds((prev) => toggleSetItem(prev, id));
  };

  const toggleBatch = (id: number) => {
    setSelectedBatchIds((prev) => toggleSetItem(prev, id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!heading.trim() || !content.trim()) {
      toast.error('Heading and content are required');
      return;
    }
    if (!startLocal || !endLocal) {
      toast.error('Start and end dates are required');
      return;
    }
    const startIso = fromDatetimeLocalInputValue(startLocal);
    const endIso = fromDatetimeLocalInputValue(endLocal);
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      toast.error('End time must be after start time');
      return;
    }
    if (!visibleToAdmins && !visibleToTeachers && !visibleToStudents) {
      toast.error('Select at least one audience');
      return;
    }
    if (scope === 'COURSE' && !targetAllCourses && selectedCourseIds.size === 0) {
      toast.error('Select at least one course, or choose all courses');
      return;
    }
    if (scope === 'BATCH' && !targetAllBatches && selectedBatchIds.size === 0) {
      toast.error('Select at least one batch, or choose all batches');
      return;
    }

    setSaving(true);
    try {
      const base = {
        heading: heading.trim(),
        content: content.trim(),
        startDate: startIso,
        endDate: endIso,
        isActive: true,
        visibleToAdmins,
        visibleToTeachers,
        visibleToStudents,
        scope,
        targetAllCourses: scope === 'COURSE' ? targetAllCourses : false,
        targetAllBatches: scope === 'BATCH' ? targetAllBatches : false,
        courseIds:
          scope === 'COURSE' && !targetAllCourses ? Array.from(selectedCourseIds) : undefined,
        batchIds: scope === 'BATCH' && !targetAllBatches ? Array.from(selectedBatchIds) : undefined,
      };

      if (initial?.id) {
        await AnnouncementsService.updateAnnouncement(initial.id, base);
        toast.success('Announcement updated');
      } else {
        await AnnouncementsService.createAnnouncement(base);
        toast.success('Announcement created');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save announcement'));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="text-sm text-white/80">
              Choose who can see it and which {scope === 'COURSE' ? 'courses' : 'batches'} it targets.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-white/80" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <Label htmlFor="ann-heading">Heading</Label>
            <Input
              id="ann-heading"
              value={heading}
              onChange={(ev) => setHeading(ev.target.value)}
              className="mt-1"
              required
              placeholder="Eg. Midterm schedule update"
            />
            <p className="mt-1 text-xs text-slate-500">{heading.trim().length}/120</p>
          </div>
          <div>
            <Label htmlFor="ann-content">Content</Label>
            <Textarea
              id="ann-content"
              value={content}
              onChange={(ev) => setContent(ev.target.value)}
              className="mt-1 min-h-[100px]"
              required
              placeholder="Write the announcement details here…"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="ann-start">Starts</Label>
              <Input
                id="ann-start"
                type="datetime-local"
                value={startLocal}
                onChange={(ev) => setStartLocal(ev.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="ann-end">Ends</Label>
              <Input
                id="ann-end"
                type="datetime-local"
                value={endLocal}
                onChange={(ev) => setEndLocal(ev.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label>Scope</Label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === 'COURSE'}
                  onChange={() => setScope('COURSE')}
                />
                By course
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === 'BATCH'}
                  onChange={() => setScope('BATCH')}
                />
                By batch
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-800">Audience</p>
            <p className="mt-1 text-xs text-slate-500">Select at least one group.</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={visibleToAdmins}
                  onChange={(ev) => setVisibleToAdmins(ev.target.checked)}
                />
                Admins
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={visibleToTeachers}
                  onChange={(ev) => setVisibleToTeachers(ev.target.checked)}
                />
                Teachers
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={visibleToStudents}
                  onChange={(ev) => setVisibleToStudents(ev.target.checked)}
                />
                Students
              </label>
            </div>
          </div>

          {scope === 'COURSE' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={targetAllCourses}
                  onChange={(ev) => setTargetAllCourses(ev.target.checked)}
                />
                All courses in this institute
              </label>
              {!targetAllCourses && (
                <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 p-2 space-y-1">
                  {metaLoading ? (
                    <p className="text-sm text-slate-500">Loading courses…</p>
                  ) : courses.length === 0 ? (
                    <p className="text-sm text-slate-500">No courses found.</p>
                  ) : (
                    courses.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={selectedCourseIds.has(c.id)}
                          onChange={() => toggleCourse(c.id)}
                        />
                        {c.name}
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {scope === 'BATCH' && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={targetAllBatches}
                  onChange={(ev) => setTargetAllBatches(ev.target.checked)}
                />
                All batches in this institute
              </label>
              {!targetAllBatches && (
                <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 p-2 space-y-1">
                  {metaLoading ? (
                    <p className="text-sm text-slate-500">Loading batches…</p>
                  ) : batches.length === 0 ? (
                    <p className="text-sm text-slate-500">No batches found.</p>
                  ) : (
                    batches.map((b) => (
                      <label key={b.id} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={selectedBatchIds.has(b.id)}
                          onChange={() => toggleBatch(b.id)}
                        />
                        {b.label}
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || metaLoading}>
              {saving ? 'Saving…' : initial?.id ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
