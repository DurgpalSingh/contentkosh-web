'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextField } from '@/components/common/RichTextField'
import { questionType, questionTypeLabel } from '@/lib/tests/testUiMappers'
import { useTeacherQuestionForm } from './useTeacherQuestionForm'
import { TestKind } from '@/lib/tests/testTeacherApi'

export type TeacherQuestionFormState = ReturnType<typeof useTeacherQuestionForm>

interface QuestionFormFieldsProps {
  form: TeacherQuestionFormState
  formId: string
  kind: TestKind
}

export const QuestionFormFields = ({ form, formId, kind }: QuestionFormFieldsProps) => {
  const {
    questionTypeValue,
    setQuestionTypeValue,
    questionText,
    setQuestionText,
    explanation,
    setExplanation,
    options,
    correctSingleId,
    setCorrectSingleId,
    correctMultiIds,
    correctText,
    setCorrectText,
    toggleMulti,
    addOption,
    removeOption,
    updateOptionText,
  } = form

  const showOptions =
    questionTypeValue === questionType.singleChoice ||
    questionTypeValue === questionType.multipleChoice

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor={`${formId}-qtype`}>Question type</Label>
        <select
          id={`${formId}-qtype`}
          className="w-full border rounded-md h-10 px-3 text-sm"
          value={questionTypeValue}
          onChange={(e) => setQuestionTypeValue(Number(e.target.value))}
        >
          {[0, 1, 2, 3, 4].map((v) => (
            <option key={v} value={v}>
              {questionTypeLabel(v)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-qtext`}>Question</Label>
        <RichTextField
          value={questionText}
          onChange={setQuestionText}
          placeholder="Write the question…"
          ariaLabel={`${formId}-qtext`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-explanation`}>Explanation</Label>
        <RichTextField
          value={explanation}
          onChange={setExplanation}
          placeholder="Optional explanation shown to students (when enabled by test settings)."
          ariaLabel={`${formId}-explanation`}
        />
        <p className="text-xs text-gray-500">
          Explains the correct answer after submission (if the test allows explanations).
        </p>
      </div>

      {showOptions && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              Add option
            </Button>
          </div>
          {options.map((o, idx) => (
            <div key={o.id} className="flex gap-2 items-start">
              {questionTypeValue === questionType.singleChoice ? (
                <input
                  type="radio"
                  name={`${formId}-correctOpt`}
                  className="mt-2.5"
                  checked={correctSingleId === o.id}
                  onChange={() => setCorrectSingleId(o.id)}
                  aria-label={`Mark option ${idx + 1} as correct`}
                />
              ) : (
                <input
                  type="checkbox"
                  className="mt-2.5"
                  checked={!!correctMultiIds[o.id]}
                  onChange={() => toggleMulti(o.id)}
                  aria-label={`Mark option ${idx + 1} as correct`}
                />
              )}
              <Input
                value={o.text}
                onChange={(e) => updateOptionText(o.id, e.target.value)}
                placeholder={`Option ${idx + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOption(o.id)}
                disabled={options.length <= 2}
                aria-label="Remove option"
              >
                ×
              </Button>
            </div>
          ))}
          <p className="text-xs text-gray-500">
            {questionTypeValue === questionType.singleChoice
              ? 'Select the correct answer.'
              : 'Check all correct answers.'}
          </p>
        </div>
      )}

      {questionTypeValue === questionType.trueFalse && (
        <div className="space-y-2">
          <Label>Correct answer</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`${formId}-tf`}
                checked={correctText === 'true'}
                onChange={() => setCorrectText('true')}
              />
              True
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`${formId}-tf`}
                checked={correctText === 'false'}
                onChange={() => setCorrectText('false')}
              />
              False
            </label>
          </div>
        </div>
      )}

      {(questionTypeValue === questionType.numerical ||
        questionTypeValue === questionType.fillInTheBlank) && (
          <div className="space-y-2">
            <Label htmlFor={`${formId}-correctText`}>Correct answer</Label>
            <Input
              id={`${formId}-correctText`}
              value={correctText}
              onChange={(e) => setCorrectText(e.target.value)}
              type={questionTypeValue === questionType.numerical ? 'number' : 'text'}
              required
            />
            {questionTypeValue === questionType.fillInTheBlank && (
              <p className="text-xs text-gray-500">Matching is case-insensitive on the server.</p>
            )}
          </div>
        )}
    </div>
  )
}
