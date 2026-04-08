'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle,
  Award,
  CalendarClock,
  Clock,
  Eye,
  FileText,
  Hash,
  Settings2,
  Shuffle,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal'
import {
  ExamTest,
  ExamTestsService,
  BatchesService,
  PracticeTest,
  PracticeTestsService,
  ResultVisibilityExam,
  TestLanguage,
  UpdateExamTestDTO,
  UpdatePracticeTestDTO,
} from '@/lib/api'
import type { Subject } from '@/lib/api'
import { TEST_KIND, type TestKind } from '@/lib/tests/testConstants'
import { TEST_LANGUAGE_LABEL, TEST_LANGUAGE_OPTIONS } from '@/lib/tests/testLanguage'
import { resultVisibilityExamLabel } from '@/lib/tests/testUiMappers'
import { validateTestForm, type TestFormErrors } from '@/lib/tests/testFormValidation'
import { toast } from 'sonner'

interface TeacherTestSettingsTabProps {
  kind: TestKind
  businessId: number
  testId: string
  test: PracticeTest | ExamTest
  subjects: Subject[]
  onSettingsSaved: () => void
  onTestDeleted: () => void
}

const toDatetimeLocalValue = (iso: string | undefined): string => {
  if (!iso) return ''
  const d = new Date(iso)
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 16)
}

type PracticeWithSubject = PracticeTest & { subjectId?: number | null }
type ExamWithSubject = ExamTest & { subjectId?: number | null }
type UpdatePracticeWithSubject = UpdatePracticeTestDTO & { subjectId?: number | null }
type UpdateExamWithSubject = UpdateExamTestDTO & { subjectId?: number | null }

const buildPracticeDraft = (t: PracticeTest): UpdatePracticeWithSubject => ({
  name: t.name,
  description: t.description,
  defaultMarksPerQuestion: t.defaultMarksPerQuestion,
  showExplanations: t.showExplanations,
  shuffleQuestions: t.shuffleQuestions,
  shuffleOptions: t.shuffleOptions,
  language: t.language,
  ...(typeof (t as PracticeWithSubject).subjectId === 'number'
    ? { subjectId: (t as PracticeWithSubject).subjectId }
    : {}),
})

const buildExamDraft = (t: ExamTest): UpdateExamWithSubject => ({
  name: t.name,
  description: t.description,
  startAt: toDatetimeLocalValue(t.startAt),
  deadlineAt: toDatetimeLocalValue(t.deadlineAt),
  durationMinutes: t.durationMinutes,
  defaultMarksPerQuestion: t.defaultMarksPerQuestion,
  negativeMarksPerQuestion: t.negativeMarksPerQuestion,
  resultVisibility: t.resultVisibility,
  shuffleQuestions: t.shuffleQuestions,
  shuffleOptions: t.shuffleOptions,
  language: t.language,
  ...(typeof (t as ExamWithSubject).subjectId === 'number'
    ? { subjectId: (t as ExamWithSubject).subjectId }
    : {}),
})

const inputClass =
  'border-gray-200 bg-white focus-visible:ring-blue-500 focus-visible:border-blue-300'

const selectClass =
  'w-full border border-gray-200 rounded-md h-10 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400'

export const TeacherTestSettingsTab = ({
  kind,
  businessId,
  testId,
  test,
  subjects: subjectsAll,
  onSettingsSaved,
  onTestDeleted,
}: TeacherTestSettingsTabProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draftPractice, setDraftPractice] = useState<UpdatePracticeWithSubject>({})
  const [draftExam, setDraftExam] = useState<UpdateExamWithSubject>({})
  const [formErrors, setFormErrors] = useState<TestFormErrors>({})
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [subjectsForBatch, setSubjectsForBatch] = useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)

  const handleStartEdit = () => {
    if (kind === TEST_KIND.PRACTICE) {
      setDraftPractice(buildPracticeDraft(test as PracticeTest))
    } else {
      setDraftExam(buildExamDraft(test as ExamTest))
    }
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setFormErrors({})
    setIsEditing(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    const draft = kind === TEST_KIND.PRACTICE ? draftPractice : draftExam
    const errors = validateTestForm({
      name: draft.name ?? '',
      description: draft.description ?? undefined,
      kind,
      startAt: kind === TEST_KIND.EXAM ? (draftExam.startAt ?? undefined) : undefined,
      deadlineAt: kind === TEST_KIND.EXAM ? (draftExam.deadlineAt ?? undefined) : undefined,
      durationMinutes: kind === TEST_KIND.EXAM ? (draftExam.durationMinutes ?? undefined) : undefined,
      defaultMarksPerQuestion: draft.defaultMarksPerQuestion ?? undefined,
      requireBatch: false,
      subjectId: draft.subjectId ?? undefined,
      validateTextRules: true,
    })

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setSaving(true)
    try {
      if (kind === TEST_KIND.PRACTICE) {
        await PracticeTestsService.putApiBusinessPracticeTests(businessId, testId, draftPractice)
      } else {
        const body = {
          ...draftExam,
          startAt: draftExam.startAt ? new Date(draftExam.startAt).toISOString() : undefined,
          deadlineAt: draftExam.deadlineAt
            ? new Date(draftExam.deadlineAt).toISOString()
            : undefined,
        } as UpdateExamTestDTO
        await ExamTestsService.putApiBusinessExamTests(businessId, testId, body)
      }
      toast.success('Settings saved')
      setIsEditing(false)
      onSettingsSaved()
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = useCallback(async () => {
    if (kind === TEST_KIND.PRACTICE) {
      await PracticeTestsService.deleteApiBusinessPracticeTests(businessId, testId)
    } else {
      await ExamTestsService.deleteApiBusinessExamTests(businessId, testId)
    }
    toast.success('Test deleted')
    onTestDeleted()
  }, [businessId, kind, onTestDeleted, testId])

  useEffect(() => {
    if (!isEditing) return
    const rawBatchId = (test as { batchId?: string | number }).batchId
    const batchId = typeof rawBatchId === 'string' ? Number(rawBatchId) : rawBatchId
    if (!batchId) return
    if (Number.isNaN(batchId)) return

    let cancelled = false
    setSubjectsLoading(true)
    setSubjectsForBatch([])

    type BatchWithCourseExam = {
      courseId?: number
      examId?: number
      course?: { id?: number; examId?: number }
    }

    void BatchesService.getApiBatches(batchId)
      .then((res) => {
        if (cancelled) return
        const batch = res.data as BatchWithCourseExam
        const courseId = batch.courseId ?? batch.course?.id
        const list =
          typeof courseId === 'number'
            ? subjectsAll.filter((s) => s.courseId === courseId)
            : subjectsAll

        setSubjectsForBatch(list)

        const currentSubjectId =
          (test as PracticeWithSubject | ExamWithSubject).subjectId ?? undefined
        const nextSubjectId =
          typeof currentSubjectId === 'number' && list.some((s) => s.id === currentSubjectId)
            ? currentSubjectId
            : list[0]?.id

        if (typeof nextSubjectId === 'number' && nextSubjectId > 0) {
          if (kind === TEST_KIND.PRACTICE) {
            setDraftPractice((prev) => ({ ...prev, subjectId: nextSubjectId }))
          } else {
            setDraftExam((prev) => ({ ...prev, subjectId: nextSubjectId }))
          }
        }
      })
      .catch(() => {
        if (cancelled) return
        setSubjectsForBatch([])
        setSubjectsLoading(false)
        toast.error('Failed to load subjects')
      })
      .finally(() => {
        if (cancelled) return
        setSubjectsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isEditing, kind, test, subjectsAll])

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50/90 via-white to-slate-50/40 px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Settings2 className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Test settings</h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  {isEditing
                    ? 'Update how this test behaves for your batch.'
                    : 'Overview of names, scoring, and behavior. Use Edit to make changes.'}
                </p>
              </div>
            </div>
            {!isEditing ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleStartEdit}
                className="border-blue-200 text-blue-800 hover:bg-blue-50"
              >
                Edit settings
              </Button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="teacher-test-settings-form"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-6">
          {!isEditing ? (
            <ReadOnlySettings kind={kind} test={test} />
          ) : (
            <form
              id="teacher-test-settings-form"
              onSubmit={(e) => void handleSave(e)}
              className="space-y-8"
            >
              {kind === TEST_KIND.PRACTICE ? (
                <PracticeSettingsFields
                  draft={draftPractice}
                  setDraft={setDraftPractice}
                  inputClass={inputClass}
                  selectClass={selectClass}
                  errors={formErrors}
                  subjects={subjectsForBatch}
                  subjectsLoading={subjectsLoading}
                />
              ) : (
                <ExamSettingsFields
                  draft={draftExam}
                  setDraft={setDraftExam}
                  inputClass={inputClass}
                  selectClass={selectClass}
                  errors={formErrors}
                  subjects={subjectsForBatch}
                  subjectsLoading={subjectsLoading}
                />
              )}
            </form>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-red-200/60 bg-gradient-to-br from-red-50/50 to-white p-6 shadow-sm">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-red-900">Danger zone</h4>
            <p className="mt-1 text-sm text-red-800/80">
              Deleting this test permanently removes it from the batch. Students will no longer see it.
              This cannot be undone.
            </p>
            <Button
              type="button"
              variant="destructive"
              className="mt-4"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" aria-hidden />
              Delete test
            </Button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete test"
        message="This cannot be undone."
        itemName={test.name}
      />
    </div>
  )
}

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  title: string
  description?: string
}) => (
  <div className="mb-4">
    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-700">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      {title}
    </h4>
    {description ? <p className="mt-1 text-xs text-gray-500 pl-9">{description}</p> : null}
  </div>
)

const ReadOnlyValueCard = ({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={`rounded-lg border border-gray-100 bg-slate-50/50 px-4 py-3 ${className}`}
  >
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
    <div className="mt-1 text-sm text-gray-900">{children}</div>
  </div>
)

const BoolPill = ({ value }: { value: boolean }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
      value ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
    }`}
  >
    {value ? 'Yes' : 'No'}
  </span>
)

const ReadOnlySettings = ({
  kind,
  test,
}: {
  kind: TestKind
  test: PracticeTest | ExamTest
}) => {
  const batchName = (test as { batchName?: string }).batchName
  const subjectName = (test as { subjectName?: string }).subjectName

  if (kind === TEST_KIND.PRACTICE) {
    const t = test as PracticeTest
    return (
      <div className="space-y-8">
        <section>
          <SectionHeader icon={FileText} title="General" description="Basic identity and description." />
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadOnlyValueCard label="Test name" className="sm:col-span-2">
              <span className="font-medium">{t.name}</span>
            </ReadOnlyValueCard>
            <ReadOnlyValueCard label="Description" className="sm:col-span-2">
              <span className="whitespace-pre-wrap text-gray-700">{t.description ?? '—'}</span>
            </ReadOnlyValueCard>
            <ReadOnlyValueCard label="Batch">
              <span className="text-gray-800">{batchName ?? '—'}</span>
            </ReadOnlyValueCard>
            <ReadOnlyValueCard label="Subject">
              <span className="text-gray-800">{subjectName ?? '—'}</span>
            </ReadOnlyValueCard>
            <ReadOnlyValueCard label="Language">
              {TEST_LANGUAGE_LABEL[t.language as TestLanguage] ?? '—'}
            </ReadOnlyValueCard>
          </div>
        </section>

        <section>
          <SectionHeader icon={Award} title="Scoring" />
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadOnlyValueCard label="Default marks per question">
              {t.defaultMarksPerQuestion ?? '—'}
            </ReadOnlyValueCard>
          </div>
        </section>

        <section>
          <SectionHeader
            icon={Shuffle}
            title="Display & randomization"
            description="How questions and options appear to students."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <ReadOnlyValueCard label="Show explanations">
              <BoolPill value={!!t.showExplanations} />
            </ReadOnlyValueCard>
            <ReadOnlyValueCard label="Shuffle questions">
              <BoolPill value={!!t.shuffleQuestions} />
            </ReadOnlyValueCard>
            <ReadOnlyValueCard label="Shuffle options">
              <BoolPill value={!!t.shuffleOptions} />
            </ReadOnlyValueCard>
          </div>
        </section>
      </div>
    )
  }

  const t = test as ExamTest
  return (
    <div className="space-y-8">
      <section>
        <SectionHeader icon={FileText} title="General" />
        <div className="grid gap-3 sm:grid-cols-2">
          <ReadOnlyValueCard label="Test name" className="sm:col-span-2">
            <span className="font-medium">{t.name}</span>
          </ReadOnlyValueCard>
          <ReadOnlyValueCard label="Description" className="sm:col-span-2">
            <span className="whitespace-pre-wrap text-gray-700">{t.description ?? '—'}</span>
          </ReadOnlyValueCard>
          <ReadOnlyValueCard label="Batch">
            <span className="text-gray-800">{batchName ?? '—'}</span>
          </ReadOnlyValueCard>
          <ReadOnlyValueCard label="Subject">
            <span className="text-gray-800">{subjectName ?? '—'}</span>
          </ReadOnlyValueCard>
          <ReadOnlyValueCard label="Language">
            {TEST_LANGUAGE_LABEL[t.language as TestLanguage] ?? '—'}
          </ReadOnlyValueCard>
        </div>
      </section>

      <section>
        <SectionHeader icon={CalendarClock} title="Schedule & timing" />
        <div className="grid gap-3 sm:grid-cols-2">
          <ReadOnlyValueCard label="Test starts">
            {t.startAt ? new Date(t.startAt).toLocaleString() : '—'}
          </ReadOnlyValueCard>
          <ReadOnlyValueCard label="Deadline">
            {t.deadlineAt ? new Date(t.deadlineAt).toLocaleString() : '—'}
          </ReadOnlyValueCard>
          <ReadOnlyValueCard label="Duration">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-400" aria-hidden />
              {t.durationMinutes != null ? `${t.durationMinutes} min` : '—'}
            </span>
          </ReadOnlyValueCard>
        </div>
      </section>

      <section>
        <SectionHeader icon={Hash} title="Marks" />
        <div className="grid gap-3 sm:grid-cols-2">
          <ReadOnlyValueCard label="Default marks per question">
            {t.defaultMarksPerQuestion ?? '—'}
          </ReadOnlyValueCard>
          <ReadOnlyValueCard label="Negative marks per question">
            {t.negativeMarksPerQuestion ?? '—'}
          </ReadOnlyValueCard>
        </div>
      </section>

      <section>
        <SectionHeader icon={Eye} title="Results" />
        <div className="grid gap-3 sm:grid-cols-2">
          <ReadOnlyValueCard label="Result visibility" className="sm:col-span-2">
            {resultVisibilityExamLabel(t.resultVisibility ?? 0)}
          </ReadOnlyValueCard>
        </div>
      </section>

      <section>
        <SectionHeader icon={Shuffle} title="Randomization" />
        <div className="grid gap-3 sm:grid-cols-2">
          <ReadOnlyValueCard label="Shuffle questions">
            <BoolPill value={!!t.shuffleQuestions} />
          </ReadOnlyValueCard>
          <ReadOnlyValueCard label="Shuffle options">
            <BoolPill value={!!t.shuffleOptions} />
          </ReadOnlyValueCard>
        </div>
      </section>
    </div>
  )
}

const Field = ({
  label,
  children,
  hint,
  error,
  className = '',
}: {
  label: string
  children: React.ReactNode
  hint?: string
  error?: string
  className?: string
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-sm font-medium text-gray-700">{label}</Label>
    {children}
    {error ? <p className="text-xs text-red-600">{error}</p> : hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
  </div>
)

const CheckboxRow = ({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  title: string
  description?: string
}) => (
  <label className="flex cursor-pointer gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/30 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500/40">
    <input
      type="checkbox"
      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span>
      <span className="block text-sm font-medium text-gray-900">{title}</span>
      {description ? <span className="mt-0.5 block text-xs text-gray-500">{description}</span> : null}
    </span>
  </label>
)

const PracticeSettingsFields = ({
  draft,
  setDraft,
  inputClass,
  selectClass,
  errors,
  subjects,
  subjectsLoading,
}: {
  draft: UpdatePracticeWithSubject
  setDraft: React.Dispatch<React.SetStateAction<UpdatePracticeWithSubject>>
  inputClass: string
  selectClass: string
  errors: TestFormErrors
  subjects: Array<{ id: number; name?: string }>
  subjectsLoading: boolean
}) => (
  <div className="space-y-8">
    <section>
      <SectionHeader icon={FileText} title="General" />
      <div className="space-y-4">
        <Field label="Subject" error={errors.subjectId}>
          <Select
            id="practice-subject"
            value={draft.subjectId ?? ''}
            onChange={(value) =>
              setDraft((s) => ({
                ...s,
                subjectId: value === '' ? undefined : Number(value),
              }))
            }
            options={[
              { value: '', label: 'Select subject' },
              ...subjects.map((s) => ({
                value: s.id,
                label: s.name ?? `Subject ${s.id}`,
              })),
            ]}
            disabled={subjectsLoading || subjects.length === 0}
            triggerClassName={selectClass}
          />
        </Field>
        <Field label="Test name" error={errors.name}>
          <Input
            className={inputClass}
            value={draft.name ?? ''}
            onChange={(e) => setDraft((s) => ({ ...s, name: e.target.value }))}
            maxLength={50}
            required
          />
          <p className="text-xs text-gray-500">{draft.name?.length}/50 characters</p>
        </Field>
        <Field label="Description" error={errors.description}>
          <Textarea
            className={inputClass}
            value={draft.description ?? ''}
            onChange={(e) => setDraft((s) => ({ ...s, description: e.target.value }))}
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500">{draft.description?.length ?? 0}/200 characters</p>
        </Field>
        <Field label="Test language">
          <Select
            id="practice-language"
            value={draft.language ?? TestLanguage.EN}
            onChange={(value) =>
              setDraft((s) => ({ ...s, language: value as TestLanguage }))
            }
            options={TEST_LANGUAGE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            triggerClassName={selectClass}
          />
        </Field>
      </div>
    </section>

    <section>
      <SectionHeader icon={Award} title="Scoring" />
      <Field label="Default marks per question" error={errors.defaultMarksPerQuestion}>
        <Input
          className={inputClass}
          type="number"
          min={0}
          step={0.5}
          value={draft.defaultMarksPerQuestion ?? ''}
          onChange={(e) =>
            setDraft((s) => ({ ...s, defaultMarksPerQuestion: Number(e.target.value) }))
          }
        />
      </Field>
    </section>

    <section>
      <SectionHeader icon={Shuffle} title="Display & randomization" />
      <div className="space-y-3">
        <CheckboxRow
          checked={!!draft.showExplanations}
          onChange={(v) => setDraft((s) => ({ ...s, showExplanations: v }))}
          title="Show explanations after attempt"
          description="When enabled, students can see explanations after practice attempts (if allowed on the test)."
        />
        <CheckboxRow
          checked={!!draft.shuffleQuestions}
          onChange={(v) => setDraft((s) => ({ ...s, shuffleQuestions: v }))}
          title="Shuffle question order"
          description="Each student may see questions in a different order."
        />
        <CheckboxRow
          checked={!!draft.shuffleOptions}
          onChange={(v) => setDraft((s) => ({ ...s, shuffleOptions: v }))}
          title="Shuffle answer options"
          description="Randomizes the order of choices for multiple-choice questions."
        />
      </div>
    </section>
  </div>
)

const ExamSettingsFields = ({
  draft,
  setDraft,
  inputClass,
  selectClass,
  errors,
  subjects,
  subjectsLoading,
}: {
  draft: UpdateExamWithSubject
  setDraft: React.Dispatch<React.SetStateAction<UpdateExamWithSubject>>
  inputClass: string
  selectClass: string
  errors: TestFormErrors
  subjects: Array<{ id: number; name?: string }>
  subjectsLoading: boolean
}) => (
  <div className="space-y-8">
    <section>
      <SectionHeader icon={FileText} title="General" />
      <div className="space-y-4">
        <Field label="Subject" error={errors.subjectId}>
          <Select
            id="exam-subject"
            value={draft.subjectId ?? ''}
            onChange={(value) =>
              setDraft((s) => ({
                ...s,
                subjectId: value === '' ? undefined : Number(value),
              }))
            }
            options={[
              { value: '', label: 'Select subject' },
              ...subjects.map((s) => ({
                value: s.id,
                label: s.name ?? `Subject ${s.id}`,
              })),
            ]}
            disabled={subjectsLoading || subjects.length === 0}
            triggerClassName={selectClass}
          />
        </Field>
        <Field label="Test name" error={errors.name}>
          <Input
            className={inputClass}
            value={draft.name ?? ''}
            onChange={(e) => setDraft((s) => ({ ...s, name: e.target.value }))}
            maxLength={50}
            required
          />
          <p className="text-xs text-gray-500">{draft.name?.length}/50 characters</p>
        </Field>
        <Field label="Description" error={errors.description}>
          <Textarea
            className={inputClass}
            value={draft.description ?? ''}
            onChange={(e) => setDraft((s) => ({ ...s, description: e.target.value }))}
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500">{draft.description?.length ?? 0}/200 characters</p>
        </Field>
        <Field label="Test language">
          <Select
            id="exam-language"
            value={draft.language ?? TestLanguage.EN}
            onChange={(value) =>
              setDraft((s) => ({ ...s, language: value as TestLanguage }))
            }
            options={TEST_LANGUAGE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            triggerClassName={selectClass}
          />
        </Field>
      </div>
    </section>

    <section>
      <SectionHeader icon={CalendarClock} title="Schedule & timing" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start">
          <Input
            className={inputClass}
            type="datetime-local"
            value={toDatetimeLocalValue(draft.startAt)}
            onChange={(e) => setDraft((s) => ({ ...s, startAt: e.target.value }))}
          />
        </Field>
        <Field label="Deadline" error={errors.deadlineAt}>
          <Input
            className={inputClass}
            type="datetime-local"
            value={toDatetimeLocalValue(draft.deadlineAt)}
            onChange={(e) => setDraft((s) => ({ ...s, deadlineAt: e.target.value }))}
          />
        </Field>
        <Field label="Duration (minutes)" className="sm:col-span-2" error={errors.durationMinutes}>
          <Input
            className={inputClass}
            type="number"
            min={1}
            value={draft.durationMinutes ?? ''}
            onChange={(e) => setDraft((s) => ({ ...s, durationMinutes: Number(e.target.value) }))}
          />
        </Field>
      </div>
    </section>

    <section>
      <SectionHeader icon={Hash} title="Marks" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Default marks per question" error={errors.defaultMarksPerQuestion}>
          <Input
            className={inputClass}
            type="number"
            min={0}
            step={0.5}
            value={draft.defaultMarksPerQuestion ?? ''}
            onChange={(e) =>
              setDraft((s) => ({ ...s, defaultMarksPerQuestion: Number(e.target.value) }))
            }
          />
        </Field>
        <Field label="Negative marks per question">
          <Input
            className={inputClass}
            type="number"
            min={0}
            step={0.5}
            value={draft.negativeMarksPerQuestion ?? ''}
            onChange={(e) =>
              setDraft((s) => ({ ...s, negativeMarksPerQuestion: Number(e.target.value) }))
            }
          />
        </Field>
      </div>
    </section>

    <section>
      <SectionHeader icon={Eye} title="Results" />
      <Field label="Result visibility">
        <Select
          id="result-visibility"
          value={draft.resultVisibility ?? ResultVisibilityExam._0}
          onChange={(value) =>
            setDraft((s) => ({
              ...s,
              resultVisibility: Number(value) as UpdateExamTestDTO['resultVisibility'],
            }))
          }
          options={[
            { value: ResultVisibilityExam._0, label: resultVisibilityExamLabel(0) },
            { value: ResultVisibilityExam._1, label: resultVisibilityExamLabel(1) },
          ]}
          triggerClassName={selectClass}
        />
      </Field>
    </section>

    <section>
      <SectionHeader icon={Shuffle} title="Randomization" />
      <div className="space-y-3">
        <CheckboxRow
          checked={!!draft.shuffleQuestions}
          onChange={(v) => setDraft((s) => ({ ...s, shuffleQuestions: v }))}
          title="Shuffle question order"
          description="Each student may see questions in a different order."
        />
        <CheckboxRow
          checked={!!draft.shuffleOptions}
          onChange={(v) => setDraft((s) => ({ ...s, shuffleOptions: v }))}
          title="Shuffle answer options"
          description="Randomizes the order of choices for multiple-choice questions."
        />
      </div>
    </section>
  </div>
)
