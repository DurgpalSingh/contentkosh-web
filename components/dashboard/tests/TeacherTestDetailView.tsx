'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TeacherTestAnalyticsTab } from '@/components/dashboard/tests/TeacherTestAnalyticsTab'
import { TeacherTestDetailHeader } from '@/components/dashboard/tests/TeacherTestDetailHeader'
import { TeacherTestQuestionsTab } from '@/components/dashboard/tests/TeacherTestQuestionsTab'
import { TeacherTestSettingsTab } from '@/components/dashboard/tests/TeacherTestSettingsTab'
import { AddQuestionModal } from '@/components/modals/AddQuestionModal'
import { BulkUploadModal } from '@/components/modals/BulkUploadModal'
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal'
import { PublishConfirmModal } from '@/components/modals/PublishConfirmModal'
import { EditQuestionModal } from '@/components/modals/EditQuestionModal'
import {
  ExamTest,
  ExamTestsService,
  PracticeTest,
  PracticeTestsService,
  PublishExamTestRequest,
  PublishPracticeTestRequest,
  type Subject,
  SubjectsService,
} from '@/lib/api'
import { downloadTestAnalyticsCsv } from '@/lib/tests/testTeacherApi'
import { TEST_KIND, type TestKind } from '@/lib/tests/testConstants'
import {
  isTestAnalyticsApiResponse,
  type TestAnalyticsApiResponse,
} from '@/lib/tests/testAnalyticsTypes'
import type { TeacherTestQuestion } from '@/lib/tests/teacherQuestionTypes'
import { testStatus } from '@/lib/tests/testUiMappers'
import { TEACHER_TEST_TAB, TEACHER_TEST_TAB_LABEL } from '@/lib/tests/testConstants'
import type { TeacherTestTabId } from '@/lib/tests/testConstants'
import { teacherTestsListPath } from '@/lib/tests/testPaths'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'



interface TeacherTestDetailViewProps {
  kind: TestKind
  testId: string
  businessId: number
  slug: string
}

export function TeacherTestDetailView({
  kind,
  testId,
  businessId,
  slug,
}: TeacherTestDetailViewProps) {
  const router = useRouter()
  const listHref = teacherTestsListPath(slug)

  const [activeTab, setActiveTab] = useState<TeacherTestTabId>(TEACHER_TEST_TAB.QUESTIONS)
  const [loading, setLoading] = useState(true)
  const [test, setTest] = useState<PracticeTest | ExamTest | null>(null)
  const [questions, setQuestions] = useState<TeacherTestQuestion[]>([])
  const [analytics, setAnalytics] = useState<TestAnalyticsApiResponse | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [addQuestionOpen, setAddQuestionOpen] = useState(false)
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)
  const [editQuestion, setEditQuestion] = useState<TeacherTestQuestion | null>(null)
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState<TeacherTestQuestion | null>(null)
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false)

  const loadTest = useCallback(async () => {
    setLoading(true)
    try {
      if (kind === TEST_KIND.PRACTICE) {
        const res = await PracticeTestsService.getApiBusinessPracticeTests1(businessId, testId)
        const data = res.data
        setTest(data ?? null)
        const questionsUnknown = (data as { questions?: unknown } | null)?.questions
        if (Array.isArray(questionsUnknown)) {
          setQuestions(questionsUnknown as TeacherTestQuestion[])
        } else {
          setQuestions([])
        }
      } else {
        const res = await ExamTestsService.getApiBusinessExamTests1(businessId, testId)
        const data = res.data
        setTest(data ?? null)
        const questionsUnknown = (data as { questions?: unknown } | null)?.questions
        if (Array.isArray(questionsUnknown)) {
          setQuestions(questionsUnknown as TeacherTestQuestion[])
        } else {
          setQuestions([])
        }
      }
    } catch {
      toast.error('Failed to load test')
    } finally {
      setLoading(false)
    }
  }, [kind, businessId, testId])

  const loadSubjects = useCallback(async () => {
    try {
      const list = await SubjectsService.getApiSubjectsUser().then((r) => r.data ?? [])
      setSubjects(list)
    } catch {
      toast.error('Failed to load subjects')
    }
  }, [])

  useEffect(() => {
    void loadSubjects()
  }, [loadSubjects])

  const loadQuestions = useCallback(async () => {
    try {
      if (kind === TEST_KIND.PRACTICE) {
        const res = await PracticeTestsService.getApiBusinessPracticeTestsQuestions(
          businessId,
          testId,
        )
        setQuestions((res.data ?? []) as TeacherTestQuestion[])
      } else {
        const res = await ExamTestsService.getApiBusinessExamTestsQuestions(businessId, testId)
        setQuestions((res.data ?? []) as TeacherTestQuestion[])
      }
    } catch {
      toast.error('Failed to load questions')
    }
  }, [kind, businessId, testId])

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    try {
      if (kind === TEST_KIND.PRACTICE) {
        const res = await PracticeTestsService.getApiBusinessPracticeTestsAnalytics(
          businessId,
          testId,
        )
        const raw = res.data
        setAnalytics(isTestAnalyticsApiResponse(raw) ? raw : null)
      } else {
        const res = await ExamTestsService.getApiBusinessExamTestsAnalytics(businessId, testId)
        const raw = res.data
        setAnalytics(isTestAnalyticsApiResponse(raw) ? raw : null)
      }
    } catch {
      toast.error('Failed to load analytics')
    } finally {
      setAnalyticsLoading(false)
    }
  }, [kind, businessId, testId])

  useEffect(() => {
    void loadTest()
  }, [loadTest])

  useEffect(() => {
    if (activeTab === TEACHER_TEST_TAB.ANALYTICS) void loadAnalytics()
  }, [activeTab, loadAnalytics])

  const runPublishTest = useCallback(async () => {
    if (kind === TEST_KIND.PRACTICE) {
      const body: PublishPracticeTestRequest = { practiceTestId: testId }
      await PracticeTestsService.postApiBusinessPracticeTestsPublish(businessId, body)
    } else {
      const body: PublishExamTestRequest = { examTestId: testId }
      await ExamTestsService.postApiBusinessExamTestsPublish(businessId, body)
    }
    toast.success('Test published')
    void loadTest()
  }, [businessId, kind, testId, loadTest])

  const handleDeleteQuestion = async (): Promise<void> => {
    if (!deleteQuestionTarget?.id) return
    try {
      if (kind === TEST_KIND.PRACTICE) {
        await PracticeTestsService.deleteApiBusinessPracticeTestsQuestions(
          businessId,
          deleteQuestionTarget.id,
        )
      } else {
        await ExamTestsService.deleteApiBusinessExamTestsQuestions(
          businessId,
          deleteQuestionTarget.id,
        )
      }
      toast.success('Question removed')
      void loadQuestions()
      void loadTest()
    } catch {
      toast.error('Failed to delete question')
    }
  }

  const handleExportCsv = async () => {
    try {
      const safeName = (test?.name ?? 'test').replace(/[^\w\-]+/g, '_')
      await downloadTestAnalyticsCsv(kind, businessId, testId, safeName)
      toast.success('Download started')
    } catch {
      toast.error('Export failed')
    }
  }

  const handleTestDeleted = () => {
    router.push(listHref)
  }

  if (loading && !test) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Test not found.{' '}
        <Link href={listHref} className="underline font-medium">
          Back to list
        </Link>
      </div>
    )
  }

  const status = typeof test.status === 'number' ? test.status : 0
  const isDraft = status === testStatus.draft
  const questionsLocked = Boolean((test as { hasAttempts?: boolean }).hasAttempts)

  return (
    <div className="space-y-6">
      <TeacherTestDetailHeader
        kind={kind}
        title={test.name}
        test={test}
        listHref={listHref}
        isDraft={isDraft}
        questionCount={questions.length}
        onPublish={() => setPublishConfirmOpen(true)}
      />

      <div className="border-b border-gray-200 flex gap-1">
        {(Object.values(TEACHER_TEST_TAB) as TeacherTestTabId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === id
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {TEACHER_TEST_TAB_LABEL[id]}
          </button>
        ))}
      </div>

      {activeTab === TEACHER_TEST_TAB.QUESTIONS && (
        <TeacherTestQuestionsTab
          questions={questions}
          questionsLocked={questionsLocked}
          onAddQuestion={() => setAddQuestionOpen(true)}
          onEditQuestion={(q) => setEditQuestion(q)}
          onDeleteQuestion={(q) => setDeleteQuestionTarget(q)}
          onBulkUpload={() => setBulkUploadOpen(true)}
        />
      )}

      {activeTab === TEACHER_TEST_TAB.ANALYTICS && (
        <TeacherTestAnalyticsTab
          analytics={analytics}
          analyticsLoading={analyticsLoading}
          onRefresh={() => void loadAnalytics()}
          onExportCsv={() => void handleExportCsv()}
        />
      )}

      {activeTab === TEACHER_TEST_TAB.SETTINGS && (
        <TeacherTestSettingsTab
          kind={kind}
          businessId={businessId}
          testId={testId}
          test={test}
          subjects={subjects}
          onSettingsSaved={() => void loadTest()}
          onTestDeleted={handleTestDeleted}
        />
      )}

      <AddQuestionModal
        isOpen={addQuestionOpen}
        onClose={() => setAddQuestionOpen(false)}
        businessId={businessId}
        kind={kind}
        testId={testId}
        onSaved={() => {
          void loadQuestions()
          void loadTest()
        }}
      />

      <BulkUploadModal
        isOpen={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        businessId={businessId}
        testId={testId}
        testType={kind === TEST_KIND.PRACTICE ? 'practice' : 'exam'}
        onSaved={() => {
          void loadQuestions()
          void loadTest()
        }}
      />

      {editQuestion ? (
        <EditQuestionModal
          key={editQuestion.id}
          isOpen
          onClose={() => setEditQuestion(null)}
          businessId={businessId}
          kind={kind}
          question={editQuestion}
          onSaved={() => {
            void loadQuestions()
            void loadTest()
          }}
        />
      ) : null}

      <DeleteConfirmModal
        isOpen={!!deleteQuestionTarget}
        onClose={() => setDeleteQuestionTarget(null)}
        onConfirm={handleDeleteQuestion}
        title="Delete question"
        message="Remove this question from the test?"
      />

      <PublishConfirmModal
        isOpen={publishConfirmOpen}
        onClose={() => setPublishConfirmOpen(false)}
        onConfirm={runPublishTest}
        title="Publish test?"
        message="Once published, students in the assigned batch can take this test according to the schedule and rules you set. You can still edit settings later where allowed."
        itemName={test.name}
      />
    </div>
  )
}
