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
  TestLanguage,
} from '@/lib/api';
import { resultVisibilityExamLabel } from '@/lib/tests/testUiMappers';
import { validateTestForm, type TestFormErrors } from '@/lib/tests/testFormValidation';
import { toast } from 'sonner';
import type { Subject } from '@/lib/api';
import { Select } from '@/components/ui/select';
import { TEST_KIND, TEST_KIND_LABEL, type TestKind } from '@/lib/tests/testConstants';
import { TEST_LANGUAGE_OPTIONS } from '@/lib/tests/testLanguage';

export type { TestKind };

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  batches: {
    id: number
    displayName?: string
    codeName?: string
    courseId?: number
    examId?: number
  }[]
  subjects: Subject[]
  onCreated: (kind: TestKind, testId: string) => void;
}

const toLocalDatetimeInputValue = (d: Date) => {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
};

function defaultExamWindow(): { startAt: string; deadlineAt: string } {
  const start = new Date();
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { startAt: toLocalDatetimeInputValue(start), deadlineAt: toLocalDatetimeInputValue(end) };
}

export function CreateTestModal({
  isOpen,
  onClose,
  businessId,
  batches,
  subjects,
  onCreated,
}: CreateTestModalProps) {
  const [kind, setKind] = useState<TestKind>(TEST_KIND.PRACTICE);
  const [batchId, setBatchId] = useState<number>();
  const [subjectId, setSubjectId] = useState<number>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [resultVisibility, setResultVisibility] = useState<number>(
    ResultVisibilityExam._0,
  );
  const [examWindow, setExamWindow] = useState(defaultExamWindow);
  const [language, setLanguage] = useState<TestLanguage>(TestLanguage.EN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<TestFormErrors>({});
  const minStartAt = toLocalDatetimeInputValue(new Date());

  useEffect(() => {
    if (!isOpen) return;
    setBatchId(0);
    setSubjectId(0);
    setExamWindow(defaultExamWindow());
    setError(null);
    setFormErrors({});
  }, [isOpen, batches]);

  const filteredSubjects = (() => {
    const selectedBatch = batches.find((b) => b.id === batchId)
    if (!selectedBatch?.courseId) return []
    return subjects.filter((s) => s.courseId === selectedBatch?.courseId)
  })()

  useEffect(() => {
    if (!isOpen) return
    const nextList = filteredSubjects
    setSubjectId((prev) => {
      if (prev && nextList.some((s) => s.id === prev)) return prev
      return nextList[0]?.id ?? 0
    })
  }, [batchId, filteredSubjects, isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;
      if (e.defaultPrevented) return;
      onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const reset = () => {
    setKind(TEST_KIND.PRACTICE);
    setName('');
    setDescription('');
    setDurationMinutes(60);
    setSubjectId(0);
    setLanguage(TestLanguage.EN);
    setResultVisibility(ResultVisibilityExam._0);
    setExamWindow(defaultExamWindow());
    setError(null);
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const defaultMarksPerQuestion = kind === TEST_KIND.EXAM ? 1 : undefined;
    const errors = validateTestForm({
      name,
      description,
      batchId: batchId || undefined,
      subjectId: subjectId || undefined,
      kind,
      startAt: kind === TEST_KIND.EXAM ? examWindow.startAt : undefined,
      deadlineAt: kind === TEST_KIND.EXAM ? examWindow.deadlineAt : undefined,
      durationMinutes: kind === TEST_KIND.EXAM ? durationMinutes : undefined,
      defaultMarksPerQuestion,
      requireBatch: true,
      requireSubject: true,
      validateTextRules: true,
      disallowPastStart: true,
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setLoading(true);
    setError(null);

    try {
      if (kind === TEST_KIND.PRACTICE) {
        const body = {
          batchId,
          subjectId,
          name: name.trim(),
          language,
          ...(description.trim() ? { description: description.trim() } : {}),
        } as unknown as CreatePracticeTestDTO;
        const res = await PracticeTestsService.postApiBusinessPracticeTests(businessId, body);
        const id = res.data?.id;
        if (!id) throw new Error('No test id returned');
        toast.success('Practice test created');
        onCreated(TEST_KIND.PRACTICE, id);
        reset();
      } else {
        const body = {
          batchId,
          subjectId,
          name: name.trim(),
          startAt: new Date(examWindow.startAt).toISOString(),
          deadlineAt: new Date(examWindow.deadlineAt).toISOString(),
          durationMinutes,
          defaultMarksPerQuestion,
          resultVisibility,
          language,
          ...(description.trim() ? { description: description.trim() } : {}),
        } as unknown as CreateExamTestDTO;
        const res = await ExamTestsService.postApiBusinessExamTests(businessId, body);
        const id = res.data?.id;
        if (!id) throw new Error('No test id returned');
        toast.success('Exam test created');
        onCreated(TEST_KIND.EXAM, id);
        reset();
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

  const closeModal = () => {
    if (loading) return;
    reset();
    onClose();
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
        <div className="flex items-center justify-between border-b px-5 py-4 bg-blue-600 rounded-tl-xl rounded-tr-xl text-white">
          <h2 id="create-test-title" className="text-lg font-semibold">
            Create test
          </h2>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg p-2 text-gray-100 hover:bg-blue-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Test type <span className="text-red-400">*</span></Label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="kind"
                  checked={kind === TEST_KIND.PRACTICE}
                  onChange={() => setKind(TEST_KIND.PRACTICE)}
                />
                <span>{TEST_KIND_LABEL[TEST_KIND.PRACTICE]}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="kind"
                  checked={kind === TEST_KIND.EXAM}
                  onChange={() => setKind(TEST_KIND.EXAM)}
                />
                <span>{TEST_KIND_LABEL[TEST_KIND.EXAM]}</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch">Batch <span className="text-red-400">*</span></Label>
            <Select
              id="batch"
              value={batchId ?? 0}
              onChange={(v) => setBatchId(Number(v))}
              options={batches.map((b) => ({
                value: b.id,
                label: b.displayName || b.codeName || `Batch ${b.id}`,
              }))}
              placeholder="Select batch"
            />
            {formErrors.batchId && (
              <p className="text-sm text-red-600 mt-1">{formErrors.batchId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject <span className="text-red-400">*</span></Label>
            <Select
              id="subject"
              value={subjectId ?? 0}
              onChange={(v) => setSubjectId(Number(v))}
              options={filteredSubjects.map((s) => ({
                value: s.id ?? 0,
                label: s.name ?? `Subject ${s.id ?? ''}`,
              }))}
              disabled={filteredSubjects.length === 0}
              placeholder="Select subject"
            />
            {formErrors.subjectId && (
              <p className="text-sm text-red-600 mt-1">{formErrors.subjectId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-language">Test language <span className="text-red-400">*</span></Label>
            <Select
              id="test-language"
              value={language}
              onChange={(v) => setLanguage(v as TestLanguage)}
              options={TEST_LANGUAGE_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              placeholder="Select language"
            />
          </div>

          <div className="space-y-1 flex flex-col gap-1">
            <Label htmlFor="name">Test Name <span className="text-red-400">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Test title"
              maxLength={50}
              className='focus-visible:ring-1 focus-visible:ring-blue-200 focus-visible:border-blue-400'

            />
            <p className="text-xs text-gray-500">{name.length}/50 characters</p>
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
              maxLength={200}
              className='focus-visible:ring-1 focus-visible:ring-blue-200 focus-visible:border-blue-400'
            />
            <p className="text-xs text-gray-500">{description.length}/200 characters</p>
            {formErrors.description && (
              <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>
            )}
          </div>

          {kind === TEST_KIND.EXAM && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startAt">Start <span className="text-red-400">*</span></Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={examWindow.startAt}
                    onChange={(e) =>
                      setExamWindow((w) => ({ ...w, startAt: e.target.value }))
                    }
                  />
                  {formErrors.startAt && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.startAt}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadlineAt">Deadline <span className="text-red-400">*</span></Label>
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
                <Label htmlFor="duration">Duration (minutes) <span className="text-red-400">*</span></Label>
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
                <Label htmlFor="visibility">Result visibility <span className="text-red-400">*</span></Label>
                <Select
                  id="visibility"
                  value={resultVisibility}
                  onChange={(v) => setResultVisibility(Number(v))}
                  options={[
                    { value: ResultVisibilityExam._0, label: resultVisibilityExamLabel(0) },
                    { value: ResultVisibilityExam._1, label: resultVisibilityExamLabel(1) },
                  ]}
                  placeholder="Select visibility"
                />
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
            <Button type="submit" variant="default" className='bg-blue-600' disabled={loading}>
              {loading ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
