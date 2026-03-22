'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CreateExamTestDTO,
  CreatePracticeTestDTO,
  ExamTestsService,
  PracticeTestsService,
  ResultVisibilityExam,
} from '@/lib/api';
import { resultVisibilityExamLabel } from '@/lib/tests/testUiMappers';
import { validateTestForm, type TestFormErrors } from '@/lib/tests/testFormValidation';
import { toast } from 'sonner';

export type TestKindForm = 'practice' | 'exam';

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  batches: { id: number; displayName?: string; codeName?: string }[];
  onCreated: (kind: TestKindForm, testId: string) => void;
}

function defaultExamWindow(): { startAt: string; deadlineAt: string } {
  const start = new Date();
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const toLocalIso = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };
  return { startAt: toLocalIso(start), deadlineAt: toLocalIso(end) };
}

export function CreateTestModal({
  isOpen,
  onClose,
  businessId,
  batches,
  onCreated,
}: CreateTestModalProps) {
  const [kind, setKind] = useState<TestKindForm>('practice');
  const [batchId, setBatchId] = useState<number>(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [resultVisibility, setResultVisibility] = useState<number>(
    ResultVisibilityExam._0,
  );
  const [examWindow, setExamWindow] = useState(defaultExamWindow);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<TestFormErrors>({});

  useEffect(() => {
    if (!isOpen) return;
    const first = batches[0]?.id;
    if (first) setBatchId(first);
    setExamWindow(defaultExamWindow());
    setError(null);
    setFormErrors({});
  }, [isOpen, batches]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const reset = () => {
    setKind('practice');
    setName('');
    setDescription('');
    setDurationMinutes(60);
    setResultVisibility(ResultVisibilityExam._0);
    setExamWindow(defaultExamWindow());
    setError(null);
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const defaultMarksPerQuestion = kind === 'exam' ? 1 : undefined;
    const errors = validateTestForm({
      name,
      batchId: batchId || undefined,
      kind,
      startAt: kind === 'exam' ? examWindow.startAt : undefined,
      deadlineAt: kind === 'exam' ? examWindow.deadlineAt : undefined,
      durationMinutes: kind === 'exam' ? durationMinutes : undefined,
      defaultMarksPerQuestion,
      requireBatch: true,
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setLoading(true);
    setError(null);

    try {
      if (kind === 'practice') {
        const body = {
          batchId,
          name: name.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
        } as unknown as CreatePracticeTestDTO;
        const res = await PracticeTestsService.postApiBusinessPracticeTests(businessId, body);
        const id = res.data?.id;
        if (!id) throw new Error('No test id returned');
        toast.success('Practice test created');
        onCreated('practice', id);
        reset();
        onClose();
      } else {
        const body = {
          batchId,
          name: name.trim(),
          startAt: new Date(examWindow.startAt).toISOString(),
          deadlineAt: new Date(examWindow.deadlineAt).toISOString(),
          durationMinutes,
          defaultMarksPerQuestion,
          resultVisibility,
          ...(description.trim() ? { description: description.trim() } : {}),
        } as unknown as CreateExamTestDTO;
        const res = await ExamTestsService.postApiBusinessExamTests(businessId, body);
        const id = res.data?.id;
        if (!id) throw new Error('No test id returned');
        toast.success('Exam test created');
        onCreated('exam', id);
        reset();
        onClose();
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'body' in err
          ? String((err as { body?: { message?: string } }).body?.message ?? 'Failed to create test')
          : 'Failed to create test';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-test-title"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 id="create-test-title" className="text-lg font-semibold text-gray-900">
            Create test
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Test type</Label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="kind"
                  checked={kind === 'practice'}
                  onChange={() => setKind('practice')}
                />
                <span>Practice</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="kind"
                  checked={kind === 'exam'}
                  onChange={() => setKind('exam')}
                />
                <span>Exam</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch">Batch</Label>
            <select
              id="batch"
              className="w-full border rounded-md h-10 px-3 text-sm"
              value={batchId || ''}
              onChange={(e) => setBatchId(Number(e.target.value))}
            >
              <option value="">Select batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.displayName || b.codeName || `Batch ${b.id}`}
                </option>
              ))}
            </select>
            {formErrors.batchId && (
              <p className="text-sm text-red-600 mt-1">{formErrors.batchId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Test title"
              required
            />
            {formErrors.name && (
              <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short description"
            />
          </div>

          {kind === 'exam' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startAt">Start</Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={examWindow.startAt}
                    onChange={(e) =>
                      setExamWindow((w) => ({ ...w, startAt: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadlineAt">Deadline</Label>
                  <Input
                    id="deadlineAt"
                    type="datetime-local"
                    value={examWindow.deadlineAt}
                    onChange={(e) =>
                      setExamWindow((w) => ({ ...w, deadlineAt: e.target.value }))
                    }
                  />
                  {formErrors.deadlineAt && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.deadlineAt}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                />
                {formErrors.durationMinutes && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.durationMinutes}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility">Result visibility</Label>
                <select
                  id="visibility"
                  className="w-full border rounded-md h-10 px-3 text-sm"
                  value={resultVisibility}
                  onChange={(e) => setResultVisibility(Number(e.target.value))}
                >
                  <option value={ResultVisibilityExam._0}>
                    {resultVisibilityExamLabel(0)}
                  </option>
                  <option value={ResultVisibilityExam._1}>
                    {resultVisibilityExamLabel(1)}
                  </option>
                </select>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
