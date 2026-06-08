'use client'

import { HtmlContent } from '@/components/common/HtmlContent'
import type { TeacherTestQuestion } from '@/lib/tests/teacherQuestionTypes'
import { questionType, questionTypeLabel } from '@/lib/tests/testUiMappers'
import { resolveMediaUrl } from '@/lib/resolveMediaUrl'

interface TeacherQuestionReadOnlyCardProps {
  question: TeacherTestQuestion
  index: number
}

export const TeacherQuestionReadOnlyCard = ({
  question,
  index,
}: TeacherQuestionReadOnlyCardProps) => {
  const qt = typeof question.type === 'number' ? question.type : 0
  const body = question.questionText ?? question.text ?? ''
  const options = question.options ?? []
  const correctIds = new Set(question.correctOptionIdsAnswers ?? [])
  const isMcq =
    qt === questionType.singleChoice || qt === questionType.multipleChoice

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Question {index + 1}</h3>
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {questionTypeLabel(qt)}
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {question.mediaUrl && (
          <div className="mb-4">
            <img 
              src={resolveMediaUrl(question.mediaUrl) ?? undefined} 
              alt="Question image" 
              className="max-w-full h-auto rounded-lg border border-slate-200"
            />
          </div>
        )}
        <div className="text-slate-900 min-w-0">
          <HtmlContent html={body} />
        </div>

        {isMcq && options.length > 0 ? (
          <ul className="space-y-2">
            {options.map((opt) => {
              const optionId = opt.id ?? ''
              const isCorrect = optionId ? correctIds.has(optionId) : false
              return (
                <li
                  key={optionId || opt.text}
                  className={[
                    'rounded-xl border px-3 py-2.5 text-sm',
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 bg-white text-slate-800',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {opt.mediaUrl && (
                        <img 
                          src={resolveMediaUrl(opt.mediaUrl) ?? undefined} 
                          alt="Option image" 
                          className="max-w-full h-auto rounded mb-2 border border-slate-200"
                        />
                      )}
                      <span className="leading-snug"><HtmlContent html={opt.text} /></span>
                    </div>
                    {isCorrect ? (
                      <span className="text-xs font-semibold shrink-0">Correct</span>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : null}

        {!isMcq && question.correctTextAnswer ? (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Correct answer
            </p>
            <div className="mt-1 text-emerald-900">
              <HtmlContent html={question.correctTextAnswer} />
            </div>
          </div>
        ) : null}

        {question.explanation ? (
          <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
            <p className="text-xs font-semibold text-slate-600 mb-1">Explanation</p>
            <HtmlContent html={question.explanation} className="text-slate-700 text-sm" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
