'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ExamTest, PracticeTest } from '@/lib/api'
import { TEST_KIND, TEST_KIND_LABEL, type TestKind } from '@/lib/tests/testConstants'
import {
  formatDurationMinutes,
  testStatus,
  testStatusLabel,
} from '@/lib/tests/testUiMappers'
import { ArrowLeft } from 'lucide-react'

interface TeacherTestDetailHeaderProps {
  kind: TestKind
  listHref: string
  title: string
  test: PracticeTest | ExamTest
  questionCount: number
  isDraft: boolean
  onPublish: () => void
}

export const TeacherTestDetailHeader = ({
  kind,
  listHref,
  title,
  test,
  questionCount,
  isDraft,
  onPublish,
}: TeacherTestDetailHeaderProps) => {
  const batchName = (test as { batchName?: string }).batchName
  const subjectName = (test as { subjectName?: string }).subjectName

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Link
          href={listHref}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          All tests
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              kind === TEST_KIND.PRACTICE ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
            }`}
          >
            {TEST_KIND_LABEL[kind]}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isDraft ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-800'
            }`}
          >
            {testStatusLabel(typeof test.status === 'number' ? test.status : testStatus.draft)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {[
            batchName,
            subjectName,
            kind === TEST_KIND.EXAM && 'durationMinutes' in test
              ? `Duration ${formatDurationMinutes(test.durationMinutes)}`
              : '',
            `Questions ${questionCount}`,
          ]
            .filter((s) => s !== '')
            .join(' · ')}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {isDraft && (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={onPublish} type="button">
            Publish test
          </Button>
        )}
      </div>
    </div>
  )
}
