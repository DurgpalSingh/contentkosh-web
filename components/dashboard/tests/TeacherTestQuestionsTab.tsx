'use client'

import { Button } from '@/components/ui/button'
import type { TestQuestion } from '@/lib/api'
import type { TeacherTestQuestion } from '@/lib/tests/teacherQuestionTypes'
import { EmptyState } from '@/components/common/EmptyState'
import { TeacherQuestionReadOnlyCard } from '@/components/dashboard/tests/TeacherQuestionReadOnlyCard'

interface TeacherTestQuestionsTabProps {
  questions: TestQuestion[]
  questionsLocked: boolean
  onAddQuestion: () => void
  onEditQuestion: (question: TeacherTestQuestion) => void
  onDeleteQuestion: (question: TestQuestion) => void
  onBulkUpload: () => void
}

const toTeacherQuestion = (q: TestQuestion): TeacherTestQuestion => {
  return q as TeacherTestQuestion
}

export const TeacherTestQuestionsTab = ({
  questions,
  questionsLocked,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onBulkUpload,
}: TeacherTestQuestionsTabProps) => {
  return (
    <div className="space-y-4">
      {questionsLocked ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Students have already started this test. Questions cannot be added, edited, or removed.
        </p>
      ) : null}

      <div className="flex justify-end">
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onBulkUpload}>
            Upload from file
          </Button>
          <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={onAddQuestion}>
            Add question
          </Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <EmptyState
          title="No questions yet"
          description="Create a set of questions for this test."
        />
      ) : (
        <ul className="space-y-4">
          {questions.map((q, i) => {
            const teacherQ = toTeacherQuestion(q)
            return (
              <li key={q.id} className="space-y-2">
                <TeacherQuestionReadOnlyCard question={teacherQ} index={i} />
                <div className="flex justify-end gap-2 px-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-800 hover:bg-blue-50"
                    disabled={questionsLocked}
                    onClick={() => onEditQuestion(teacherQ)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    disabled={questionsLocked}
                    onClick={() => onDeleteQuestion(q)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
