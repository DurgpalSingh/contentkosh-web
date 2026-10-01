'use client'

import { useCallback, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  SubjectiveTestsService,
  type SubjectiveTest,
  type UpdateSubjectiveTestRequest,
} from '@/lib/api'
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal'
import {
  SubjectiveTestFormFields,
  type SubjectiveFieldValues,
} from '@/components/dashboard/tests/subjective/SubjectiveTestFormFields'
import { validateTestForm, type TestFormErrors } from '@/lib/tests/testFormValidation'
import { validateSubjectiveFields, type SubjectiveFieldErrors } from '@/lib/tests/subjectiveTestFormValidation'
import { TEST_KIND } from '@/lib/tests/testConstants'
import { formatDateTime, formatDurationMinutes, testStatus } from '@/lib/tests/testUiMappers'
import { toISODateTime } from '@/lib/utils'
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage'

type Draft = {
  name: string
  description: string
  startAt: string
  deadlineAt: string
  durationMinutes: number
} & SubjectiveFieldValues

const buildDraft = (t: SubjectiveTest): Draft => ({
  name: t.name,
  description: t.description ?? '',
  startAt: toISODateTime(t.startAt, { format: 'datetimeLocal' }) ?? '',
  deadlineAt: toISODateTime(t.deadlineAt, { format: 'datetimeLocal' }) ?? '',
  durationMinutes: t.durationMinutes,
  paperType: t.paperType,
  totalMarks: t.totalMarks,
  instructions: t.instructions ?? '',
})

/** Draft-only editing (published tests are locked), question paper replacement, and delete. */
export function SubjectiveSettingsTab({
  businessId,
  test,
  onSaved,
  onDeleted,
}: {
  businessId: number
  test: SubjectiveTest
  onSaved: () => void
  onDeleted: () => void
}) {
  const isDraft = test.status === testStatus.draft
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => buildDraft(test))
  const [questionPaper, setQuestionPaper] = useState<File | null>(null)
  const [formErrors, setFormErrors] = useState<TestFormErrors>({})
  const [subjectiveErrors, setSubjectiveErrors] = useState<SubjectiveFieldErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const startEdit = () => {
    setDraft(buildDraft(test))
    setQuestionPaper(null)
    setFormErrors({})
    setSubjectiveErrors({})
    setSaveError(null)
    setIsEditing(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateTestForm({
      name: draft.name,
      description: draft.description,
      kind: TEST_KIND.SUBJECTIVE,
      startAt: draft.startAt,
      deadlineAt: draft.deadlineAt,
      durationMinutes: draft.durationMinutes,
      validateTextRules: true,
      allowHindiName: true,
    })
    const nextSubjectiveErrors = validateSubjectiveFields({ ...draft, hasQuestionPaper: true })
    setFormErrors(errors)
    setSubjectiveErrors(nextSubjectiveErrors)
    if (Object.keys(errors).length > 0 || Object.keys(nextSubjectiveErrors).length > 0) return

    const data: UpdateSubjectiveTestRequest = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      startAt: new Date(draft.startAt).toISOString(),
      deadlineAt: new Date(draft.deadlineAt).toISOString(),
      durationMinutes: draft.durationMinutes,
      paperType: draft.paperType.trim(),
      totalMarks: draft.totalMarks,
      instructions: draft.instructions.trim() || null,
    }

    setSaving(true)
    setSaveError(null)
    try {
      await SubjectiveTestsService.putApiBusinessSubjectiveTests(businessId, test.id, {
        data: JSON.stringify(data),
        ...(questionPaper ? { questionPaper } : {}),
      })
      toast.success('Test updated')
      setIsEditing(false)
      onSaved()
    } catch (err: unknown) {
      setSaveError(getApiErrorDetailMessage(err, 'Failed to update test'))
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = useCallback(async () => {
    await SubjectiveTestsService.deleteApiBusinessSubjectiveTests(businessId, test.id)
    toast.success('Test deleted')
    onDeleted()
  }, [businessId, test.id, onDeleted])

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Test settings</h2>
          {isDraft && !isEditing && (
            <Button type="button" variant="outline" size="sm" onClick={startEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        {!isEditing ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 text-sm">
            {[
              ['Paper type', test.paperType],
              ['Batch', test.batchName ?? '—'],
              ['Subject', test.subjectName ?? '—'],
              ['Total marks', String(test.totalMarks)],
              ['Duration', formatDurationMinutes(test.durationMinutes)],
              ['Question paper', test.hasQuestionPaper ? 'Uploaded' : 'Not uploaded'],
              ['Start', formatDateTime(test.startAt)],
              ['Deadline', formatDateTime(test.deadlineAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-gray-900">{value}</dd>
              </div>
            ))}
            {test.instructions && (
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Instructions</dt>
                <dd className="text-gray-900 whitespace-pre-wrap">{test.instructions}</dd>
              </div>
            )}
            {!isDraft && (
              <p className="sm:col-span-2 text-xs text-gray-500">Published tests cannot be edited.</p>
            )}
          </dl>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name">Test name <span className="text-red-400">*</span></Label>
              <Input
                id="settings-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                maxLength={50}
                disabled={saving}
              />
              {formErrors.name && <p className="text-sm text-red-600">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-description">Description (optional)</Label>
              <Textarea
                id="settings-description"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={2}
                maxLength={200}
                disabled={saving}
              />
              {formErrors.description && <p className="text-sm text-red-600">{formErrors.description}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="settings-start">Start <span className="text-red-400">*</span></Label>
                <Input
                  id="settings-start"
                  type="datetime-local"
                  value={draft.startAt}
                  onChange={(e) => setDraft({ ...draft, startAt: e.target.value })}
                  disabled={saving}
                />
                {formErrors.startAt && <p className="text-sm text-red-600">{formErrors.startAt}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-deadline">Deadline <span className="text-red-400">*</span></Label>
                <Input
                  id="settings-deadline"
                  type="datetime-local"
                  value={draft.deadlineAt}
                  onChange={(e) => setDraft({ ...draft, deadlineAt: e.target.value })}
                  disabled={saving}
                />
                {formErrors.deadlineAt && <p className="text-sm text-red-600">{formErrors.deadlineAt}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-duration">Duration (minutes) <span className="text-red-400">*</span></Label>
                <Input
                  id="settings-duration"
                  type="number"
                  min={1}
                  value={draft.durationMinutes}
                  onChange={(e) => setDraft({ ...draft, durationMinutes: Number(e.target.value) })}
                  disabled={saving}
                />
                {formErrors.durationMinutes && <p className="text-sm text-red-600">{formErrors.durationMinutes}</p>}
              </div>
            </div>

            <SubjectiveTestFormFields
              values={draft}
              onChange={(next) => setDraft({ ...draft, ...next })}
              questionPaper={questionPaper}
              onQuestionPaperChange={setQuestionPaper}
              hasExistingPaper={test.hasQuestionPaper}
              errors={subjectiveErrors}
              disabled={saving}
            />

            {saveError && (
              <p className="text-sm text-red-600" role="alert">
                {saveError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        )}
      </div>

      {isDraft && (
        <div className="rounded-xl border border-red-200/60 bg-gradient-to-br from-red-50/50 to-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-red-800">Delete test</h3>
              <p className="text-sm text-gray-600">Removes this draft and its question paper.</p>
            </div>
            <Button type="button" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete test
            </Button>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete test"
        message="This will permanently delete this draft test and its question paper."
        itemName={test.name}
      />
    </div>
  )
}
