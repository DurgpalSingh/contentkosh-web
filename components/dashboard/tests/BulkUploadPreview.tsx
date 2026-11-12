'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { HtmlContent } from '@/components/common/HtmlContent'
import type { BulkUploadParsedQuestion, BulkUploadInvalidBlock } from '@/lib/api'

interface BulkUploadPreviewProps {
  validQuestions: BulkUploadParsedQuestion[]
  invalidQuestions: BulkUploadInvalidBlock[]
}

const TYPE_COLORS: Record<string, string> = {
  SINGLE_CHOICE: 'bg-blue-50 text-blue-700 border-blue-200',
  MULTIPLE_CHOICE: 'bg-purple-50 text-purple-700 border-purple-200',
  TRUE_FALSE: 'bg-teal-50 text-teal-700 border-teal-200',
  NUMERICAL: 'bg-orange-50 text-orange-700 border-orange-200',
  FILL_IN_THE_BLANK: 'bg-pink-50 text-pink-700 border-pink-200',
}

/** Strip HTML tags to get plain text for the collapsed preview line */
function htmlToPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function QuestionCard({ q, index }: { q: BulkUploadParsedQuestion; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const typeColor = TYPE_COLORS[q.type] ?? 'bg-gray-50 text-gray-700 border-gray-200'
  const previewText = htmlToPlainText(q.questionText)

  return (
    <li className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center justify-center">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium border rounded px-1.5 py-0.5 ${typeColor}`}>
              {q.type.replace(/_/g, ' ')}
            </span>
          </div>
          {/* Collapsed: plain text preview */}
          <p className="text-sm text-gray-900 line-clamp-2">{previewText}</p>
        </div>
        <span className="flex-shrink-0 text-gray-400 mt-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
          {/* Question rendered as rich HTML */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Question</p>
            <div className="text-sm bg-gray-50 rounded-lg px-3 py-2">
              <HtmlContent html={q.questionText} />
            </div>
          </div>

          {q.options.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Options</p>
              <ul className="space-y-1">
                {q.options.map((opt, j) => {
                  const label = opt.charAt(0).toUpperCase()
                  const isCorrect = q.answer.toUpperCase().split(',').map(a => a.trim()).includes(label)
                  return (
                    <li
                      key={j}
                      className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
                        isCorrect ? 'bg-green-50 text-green-800 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />}
                      <span>{opt}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {q.options.length === 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Answer</p>
              <p className="text-sm text-green-700 font-medium bg-green-50 px-3 py-1.5 rounded-lg inline-block">
                {q.answer}
              </p>
            </div>
          )}

          {q.solution && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Solution</p>
              <div className="text-xs bg-gray-50 rounded-lg px-3 py-2">
                <HtmlContent html={q.solution} className="text-gray-600" />
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  )
}

function ErrorCard({ block }: { block: BulkUploadInvalidBlock }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <li className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-red-100/50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800">Question #{block.position}</p>
          <p className="text-xs text-red-600 mt-0.5">
            {block.errors[0]}{block.errors.length > 1 ? ` +${block.errors.length - 1} more` : ''}
          </p>
        </div>
        <span className="flex-shrink-0 text-red-400 mt-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-red-200 space-y-2">
          <ul className="space-y-1">
            {block.errors.map((err, j) => (
              <li key={j} className="flex items-start gap-2 text-xs text-red-700">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {err}
              </li>
            ))}
          </ul>
          {block.rawText && (
            <details className="mt-2">
              <summary className="text-xs text-amber-700 cursor-pointer select-none font-medium">
                Show raw content
              </summary>
              <pre className="mt-1.5 text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-2.5 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                {block.rawText}
              </pre>
            </details>
          )}
        </div>
      )}
    </li>
  )
}

export const BulkUploadPreview = ({ validQuestions, invalidQuestions }: BulkUploadPreviewProps) => {
  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-2">
        {validQuestions.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            {validQuestions.length} ready to save
          </div>
        )}
        {invalidQuestions.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-800 text-sm font-medium">
            <XCircle className="w-4 h-4" />
            {invalidQuestions.length} with errors
          </div>
        )}
      </div>

      {/* Valid questions */}
      {validQuestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Valid Questions ({validQuestions.length})
          </p>
          <ul className="space-y-2">
            {validQuestions.map((q, i) => (
              <QuestionCard key={i} q={q} index={i} />
            ))}
          </ul>
        </div>
      )}

      {/* Invalid questions */}
      {invalidQuestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Questions with Errors ({invalidQuestions.length})
          </p>
          <ul className="space-y-2">
            {invalidQuestions.map((block, i) => (
              <ErrorCard key={i} block={block} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
