'use client'

import type { BulkUploadParsedQuestion, BulkUploadInvalidBlock } from '@/lib/api'

interface BulkUploadPreviewProps {
  validQuestions: BulkUploadParsedQuestion[]
  invalidQuestions: BulkUploadInvalidBlock[]
}

export const BulkUploadPreview = ({ validQuestions, invalidQuestions }: BulkUploadPreviewProps) => {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {validQuestions.length} question{validQuestions.length !== 1 ? 's' : ''} ready to save
        </span>
        {invalidQuestions.length > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            {invalidQuestions.length} question{invalidQuestions.length !== 1 ? 's' : ''} have errors
          </span>
        )}
      </div>

      {/* Valid Questions */}
      {validQuestions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-blue-700 mb-2">
            Valid Questions ({validQuestions.length})
          </h3>
          <ul className="divide-y divide-gray-200 border border-blue-200 rounded-lg bg-white">
            {validQuestions.map((q, i) => (
              <li key={i} className="p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">{i + 1}.</span>
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                    {q.type}
                  </span>
                </div>
                <p className="text-sm text-gray-900">{q.questionText}</p>
                {q.options.length > 0 && (
                  <ul className="mt-1 space-y-0.5 pl-4">
                    {q.options.map((opt, j) => (
                      <li key={j} className="text-xs text-gray-600 list-disc">
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Answer:</span> {q.answer}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Invalid Questions */}
      {invalidQuestions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-700 mb-2">
            Questions with Errors ({invalidQuestions.length})
          </h3>
          <ul className="divide-y divide-red-100 border border-red-200 rounded-lg bg-red-50">
            {invalidQuestions.map((block, i) => (
              <li key={i} className="p-4 flex flex-col gap-1">
                <p className="text-sm font-medium text-red-800">Question #{block.position}</p>
                <ul className="space-y-0.5 pl-4">
                  {block.errors.map((err, j) => (
                    <li key={j} className="text-xs text-red-700 list-disc">
                      {err}
                    </li>
                  ))}
                </ul>
                <details className="mt-1">
                  <summary className="text-xs text-amber-700 cursor-pointer select-none">
                    Show raw text
                  </summary>
                  <pre className="mt-1 text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded p-2 whitespace-pre-wrap break-words">
                    {block.rawText}
                  </pre>
                </details>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
