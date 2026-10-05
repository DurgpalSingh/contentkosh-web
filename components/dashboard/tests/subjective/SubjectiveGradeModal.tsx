'use client'

import { useCallback, useEffect, useState } from 'react'
import { Eye, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  SubjectiveTestFilesService,
  SubjectiveTestsService,
  type GradeSubjectiveSubmissionRequest,
  type SubjectiveStaffSubmission,
  type SubjectiveTest,
} from '@/lib/api'
import { FileUploadArea } from '@/components/dashboard/contents/FileUploadArea'
import { PdfFileViewerModal } from '@/components/common/PdfFileViewerModal'
import { SUBJECTIVE_TEST_UPLOAD } from '@/lib/tests/subjectiveTest.config'
import { validateGradeMarks } from '@/lib/tests/subjectiveTestFormValidation'
import { formatDateTime } from '@/lib/tests/testUiMappers'
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage'

type OpenFile = 'answer' | 'checked' | null

/** Review a student's answer sheet and save marks, remarks and the checked copy. */
export function SubjectiveGradeModal({
  isOpen,
  onClose,
  businessId,
  test,
  submissionId,
  studentName,
  onSaved,
}: {
  isOpen: boolean
  onClose: () => void
  businessId: number
  test: SubjectiveTest
  submissionId: string
  studentName: string
  onSaved: () => void
}) {
  const [submission, setSubmission] = useState<SubjectiveStaffSubmission | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [marks, setMarks] = useState<number>(Number.NaN)
  const [remarks, setRemarks] = useState('')
  const [checkedFile, setCheckedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [openFile, setOpenFile] = useState<OpenFile>(null)

  useEffect(() => {
    if (!isOpen) return
    SubjectiveTestsService.getApiBusinessSubjectiveTestsSubmissions2(businessId, test.id, submissionId)
      .then((res) => {
        const data = res.data ?? null
        setSubmission(data)
        if (data?.marksAwarded != null) setMarks(data.marksAwarded)
        if (data?.remarks) setRemarks(data.remarks)
      })
      .catch((e: unknown) => setLoadError(getApiErrorDetailMessage(e, 'Failed to load submission')))
  }, [isOpen, businessId, test.id, submissionId])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving && !openFile) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, saving, openFile])

  const fetchAnswerSheet = useCallback(
    () => SubjectiveTestFilesService.getStaffAnswerSheet(businessId, test.id, submissionId),
    [businessId, test.id, submissionId],
  )
  const fetchCheckedSheet = useCallback(
    () => SubjectiveTestFilesService.getStaffCheckedAnswerSheet(businessId, test.id, submissionId),
    [businessId, test.id, submissionId],
  )

  const hasCheckedCopy = Boolean(submission?.hasCheckedAnswerSheet)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const marksError = validateGradeMarks(marks, test.totalMarks)
    if (marksError) return setFormError(marksError)
    if (!checkedFile && !hasCheckedCopy) return setFormError('Upload the checked answer sheet')

    setFormError(null)
    setSaving(true)
    try {
      const data: GradeSubjectiveSubmissionRequest = { marksAwarded: marks, remarks: remarks.trim() || null }
      await SubjectiveTestsService.putApiBusinessSubjectiveTestsSubmissionsGrade(businessId, test.id, submissionId, {
        data: JSON.stringify(data),
        ...(checkedFile ? { checkedAnswerSheet: checkedFile } : {}),
      })
      toast.success('Grade saved')
      onSaved()
    } catch (err: unknown) {
      setFormError(getApiErrorDetailMessage(err, 'Failed to save grade'))
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="grade-title"
      >
        <div className="flex items-center justify-between border-b px-5 py-4 bg-blue-600 rounded-tl-xl rounded-tr-xl text-white">
          <div className="min-w-0">
            <h2 id="grade-title" className="text-lg font-semibold truncate">
              Grade {studentName}
            </h2>
            {submission?.submittedAt && (
              <p className="text-xs text-blue-100">Submitted {formatDateTime(submission.submittedAt)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-100 hover:bg-blue-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!submission && !loadError ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" aria-hidden />
          </div>
        ) : loadError ? (
          <p className="p-5 text-sm text-red-600">{loadError}</p>
        ) : (
          <form onSubmit={handleSave} className="p-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setOpenFile('answer')}>
                <Eye className="h-4 w-4 mr-2" />
                Student answer sheet
              </Button>
              {hasCheckedCopy && (
                <Button type="button" variant="outline" onClick={() => setOpenFile('checked')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Current checked copy
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="marksAwarded">
                Marks awarded (out of {test.totalMarks}) <span className="text-red-400">*</span>
              </Label>
              <Input
                id="marksAwarded"
                type="number"
                min={0}
                max={test.totalMarks}
                step="any"
                value={Number.isNaN(marks) ? '' : marks}
                onChange={(e) => setMarks(e.target.valueAsNumber)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (optional)</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                maxLength={5000}
                placeholder="Feedback for the student"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Checked answer sheet (PDF, max {SUBJECTIVE_TEST_UPLOAD.maxPdfSizeMb} MB)
                {!hasCheckedCopy && <span className="text-red-400"> *</span>}
              </Label>
              {hasCheckedCopy && !checkedFile && (
                <p className="text-xs text-gray-500">Leave empty to keep the current checked copy.</p>
              )}
              <FileUploadArea
                accept={SUBJECTIVE_TEST_UPLOAD.accept}
                acceptedLabel={SUBJECTIVE_TEST_UPLOAD.acceptedLabel}
                maxSizeMb={SUBJECTIVE_TEST_UPLOAD.maxPdfSizeMb}
                value={checkedFile}
                onChange={setCheckedFile}
                onError={setFileError}
                disabled={saving}
                isUploading={saving && Boolean(checkedFile)}
              />
              {fileError && <p className="text-sm text-red-600">{fileError}</p>}
            </div>

            {formError && (
              <p className="text-sm text-red-600" role="alert">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600" disabled={saving}>
                {saving ? 'Saving…' : 'Save grade'}
              </Button>
            </div>
          </form>
        )}
      </div>

      <PdfFileViewerModal
        key={openFile ?? 'closed'}
        isOpen={openFile !== null}
        onClose={() => setOpenFile(null)}
        title={`${studentName} — ${openFile === 'checked' ? 'checked copy' : 'answer sheet'}`}
        downloadName={`${test.name} - ${studentName} - ${openFile === 'checked' ? 'checked copy' : 'answer sheet'}.pdf`}
        fetchBlob={openFile === 'checked' ? fetchCheckedSheet : fetchAnswerSheet}
      />
    </div>
  )
}
