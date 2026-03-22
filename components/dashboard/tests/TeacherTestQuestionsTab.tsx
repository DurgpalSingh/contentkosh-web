'use client'

import { Button } from '@/components/ui/button'
import type { TestQuestion } from '@/lib/api'
import type { TeacherTestQuestion } from '@/lib/tests/teacherQuestionTypes'
import { questionTypeLabel } from '@/lib/tests/testUiMappers'

interface TeacherTestQuestionsTabProps {
  questions: TestQuestion[]
  onAddQuestion: () => void
  onEditQuestion: (question: TeacherTestQuestion) => void
  onDeleteQuestion: (question: TestQuestion) => void
}

const toTeacherQuestion = (q: TestQuestion): TeacherTestQuestion => {
  const ext = q as TeacherTestQuestion
  return ext
}

export const TeacherTestQuestionsTab = ({
  questions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}: TeacherTestQuestionsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={onAddQuestion}>
          Add question
        </Button>
      </div>
      {questions.length === 0 ? (
        <p className="text-sm text-gray-600">No questions yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white">
          {questions.map((q, i) => {
            const qt = typeof q.type === 'number' ? q.type : 0
            const teacherQ = q
            return (
              <li key={q.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="text-sm font-medium text-gray-500 w-8 shrink-0">{i + 1}.</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-violet-700 font-medium mb-1">{questionTypeLabel(qt)}</p>
                  <p className="text-gray-900">{q.questionText ?? q.text}</p>
                  {teacherQ.explanation ? (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      Explanation: {teacherQ.explanation}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEditQuestion(toTeacherQuestion(q))}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
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
