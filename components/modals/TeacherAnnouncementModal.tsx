'use client';

import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AnnouncementsService, BatchesService } from '@/lib/api';
import type { Announcement } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fromDatetimeLocalInputValue, toDatetimeLocalInputValue } from '@/components/announcements/announcementDateUtils';
import { getErrorMessage, defaultEndDate, toggleSetItem } from '@/components/announcements/announcementHelpers';
import { toast } from 'sonner';

export interface TeacherAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initial?: Announcement | null;
}

type BatchRow = { id: number; label: string };

export function TeacherAnnouncementModal({
  isOpen,
  onClose,
  onSuccess,
  initial,
}: TeacherAnnouncementModalProps) {
  const [heading, setHeading] = useState('');
  const [content, setContent] = useState('');
  const [startLocal, setStartLocal] = useState('');
  const [endLocal, setEndLocal] = useState('');
  const [visibleToAdmins, setVisibleToAdmins] = useState(false);
  const [visibleToTeachers, setVisibleToTeachers] = useState(true);
  const [visibleToStudents, setVisibleToStudents] = useState(true);
  const [targetAllBatches, setTargetAllBatches] = useState(false);
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<number>>(new Set());
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initial?.id);
  const title = isEdit ? 'Edit announcement' : 'New announcement';

  const resetForCreate = useCallback(() => {
    const now = new Date().toISOString();
    setHeading('');
    setContent('');
    setStartLocal(toDatetimeLocalInputValue(now));
    setEndLocal(toDatetimeLocalInputValue(defaultEndDate()));
    setVisibleToAdmins(false);
    setVisibleToTeachers(true);
    setVisibleToStudents(true);
    setTargetAllBatches(false);
    setSelectedBatchIds(new Set());
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (initial?.id) {
      setHeading(initial.heading ?? '');
      setContent(initial.content ?? '');
      setStartLocal(toDatetimeLocalInputValue(initial.startDate));
      setEndLocal(toDatetimeLocalInputValue(initial.endDate));
      setVisibleToAdmins(initial.visibleToAdmins ?? false);
      setVisibleToTeachers(initial.visibleToTeachers ?? true);
      setVisibleToStudents(initial.visibleToStudents ?? true);
      setTargetAllBatches(initial.targetAllBatches ?? false);
      const bIds = new Set<number>();
      for (const t of initial.targets ?? []) {
        if (t.batchId != null) bIds.add(t.batchId);
      }
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
        if (!cancelled) setBatches(batchRows);
      } catch (e) {
        console.error(e);
        if (!cancelled) toast.error(getErrorMessage(e, 'Failed to load batches'));
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

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
    if (!visibleToStudents) {
      toast.error('Announcements for students must remain visible to students');
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
    if (!targetAllBatches && selectedBatchIds.size === 0) {
      toast.error('Select at least one batch, or choose all your batches');
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
        scope: 'BATCH' as const,
        targetAllCourses: false,
        targetAllBatches,
        batchIds: !targetAllBatches ? Array.from(selectedBatchIds) : undefined,
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-blue-700">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {title}
            </h2>
            <p className="text-sm text-white/80">
              Students in selected batches will see this during the active time window.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-white/80" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <Label htmlFor="t-heading">Heading</Label>
            <Input
              id="t-heading"
              value={heading}
              onChange={(ev) => setHeading(ev.target.value)}
              className="mt-1"
              required
              placeholder="Eg. Homework submission deadline"
            />
            <p className="mt-1 text-xs text-slate-500">{heading.trim().length}/120</p>
          </div>
          <div>
            <Label htmlFor="t-content">Content</Label>
            <Textarea
              id="t-content"
              value={content}
              onChange={(ev) => setContent(ev.target.value)}
              className="mt-1 min-h-[100px]"
              required
              placeholder="Write the announcement details here…"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="t-start">Starts</Label>
              <Input
                id="t-start"
                type="datetime-local"
                value={startLocal}
                onChange={(ev) => setStartLocal(ev.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="t-end">Ends</Label>
              <Input
                id="t-end"
                type="datetime-local"
                value={endLocal}
                onChange={(ev) => setEndLocal(ev.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-800">Audience</p>
            <p className="mt-1 text-xs text-slate-500">Students must remain selected.</p>
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
                Students (required)
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={targetAllBatches}
                onChange={(ev) => setTargetAllBatches(ev.target.checked)}
              />
              All batches I belong to
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || metaLoading}>
              {saving ? 'Saving…' : initial?.id ? 'Save changes' : 'Publish'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
