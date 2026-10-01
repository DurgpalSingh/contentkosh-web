'use client'

import { Button } from '@/components/ui/button'
import { SubjectiveAvailability, SubjectiveDisplayStatus, type SubjectiveAvailableTest } from '@/lib/api'
import { TEST_KIND, TEST_KIND_LABEL } from '@/lib/tests/testConstants'
import { formatDateTime, formatDurationMinutes } from '@/lib/tests/testUiMappers'
import {
  SUBJECTIVE_AVAILABILITY_BADGE,
  SUBJECTIVE_AVAILABILITY_LABEL,
  SUBJECTIVE_DISPLAY_STATUS_BADGE,
  SUBJECTIVE_DISPLAY_STATUS_LABEL,
  SUBJECTIVE_KIND_BADGE,
} from '@/lib/tests/subjectiveTestConstants'

type CardAction =
  | { type: 'start' }
  | { type: 'open'; label: string; submissionId: string }
  | { type: 'disabled'; label: string }

/** What the student can do next, from the test window and their own attempt status. */
function resolveAction(test: SubjectiveAvailableTest): CardAction {
  const { displayStatus, availability, submissionId } = test
  if (submissionId) {
    if (displayStatus === SubjectiveDisplayStatus.IN_PROGRESS) return { type: 'open', label: 'Resume', submissionId }
    if (displayStatus === SubjectiveDisplayStatus.CHECKED) return { type: 'open', label: 'View result', submissionId }
    if (displayStatus === SubjectiveDisplayStatus.SUBMITTED) return { type: 'open', label: 'View submission', submissionId }
    return { type: 'disabled', label: 'Time over' }
  }
  if (availability === SubjectiveAvailability.OPEN) return { type: 'start' }
  if (availability === SubjectiveAvailability.UPCOMING) return { type: 'disabled', label: 'Starts soon' }
  return { type: 'disabled', label: 'Deadline passed' }
}

export function SubjectiveStudentTestCard({
  test,
  onStart,
  onOpen,
}: {
  test: SubjectiveAvailableTest
  onStart: () => void
  /** Opens the attempt (in progress) or the result page (submitted/checked). */
  onOpen: (submissionId: string, inProgress: boolean) => void
}) {
  const action = resolveAction(test)
  const notStarted = test.displayStatus === SubjectiveDisplayStatus.NOT_STARTED
  const statusLabel = notStarted
    ? SUBJECTIVE_AVAILABILITY_LABEL[test.availability]
    : SUBJECTIVE_DISPLAY_STATUS_LABEL[test.displayStatus]
  const statusBadge = notStarted
    ? SUBJECTIVE_AVAILABILITY_BADGE[test.availability]
    : SUBJECTIVE_DISPLAY_STATUS_BADGE[test.displayStatus]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap justify-between gap-2">
      <div className="flex flex-col gap-3 items-start">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2">{test.name}</h3>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {[test.batchName || 'Batch', test.subjectName].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="flex items-end gap-1 shrink-0 justify-center">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SUBJECTIVE_KIND_BADGE}`}>
              {TEST_KIND_LABEL[TEST_KIND.SUBJECTIVE]}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge}`}>{statusLabel}</span>
          </div>
        </div>

        {test.description && <p className="text-sm text-gray-600 line-clamp-3">{test.description}</p>}

        <dl className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm">
          <div className="flex gap-3">
            <dt className="text-gray-400">Paper</dt>
            <dd className="font-medium text-gray-900">{test.paperType}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-gray-400">Marks</dt>
            <dd className="font-medium text-gray-900">{test.totalMarks}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-gray-400">Duration</dt>
            <dd className="font-medium text-gray-900">{formatDurationMinutes(test.durationMinutes)}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-gray-400">{notStarted && test.availability === SubjectiveAvailability.UPCOMING ? 'Starts' : 'Deadline'}</dt>
            <dd className="font-medium text-gray-900">
              {formatDateTime(
                notStarted && test.availability === SubjectiveAvailability.UPCOMING ? test.startAt : test.deadlineAt,
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-2 mt-auto pt-2">
        {action.type === 'start' && (
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 w-fit cursor-pointer" onClick={onStart}>
            Start
          </Button>
        )}
        {action.type === 'open' && (
          <Button
            variant={action.label === 'Resume' ? 'default' : 'outline'}
            className={`flex-1 w-fit cursor-pointer ${action.label === 'Resume' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            onClick={() => onOpen(action.submissionId, test.displayStatus === SubjectiveDisplayStatus.IN_PROGRESS)}
          >
            {action.label}
          </Button>
        )}
        {action.type === 'disabled' && (
          <Button disabled className="flex-1 w-fit">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
