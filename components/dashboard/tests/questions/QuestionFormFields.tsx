'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { RichTextField } from '@/components/common/RichTextField'
import { questionType, questionTypeLabel } from '@/lib/tests/testUiMappers'
import { useTeacherQuestionForm } from './useTeacherQuestionForm'
import { cn } from '@/lib/utils'

export type TeacherQuestionFormState = ReturnType<typeof useTeacherQuestionForm>

interface QuestionFormFieldsProps {
  form: TeacherQuestionFormState
  formId: string
}

const sectionClass = cn(
  'rounded-xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-5',
  'ring-1 ring-black/[0.03]',
)

const helperClass = 'text-xs leading-relaxed text-muted-foreground'

export const QuestionFormFields = ({ form, formId }: QuestionFormFieldsProps) => {
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

  const questionTypeOptions = useMemo(
    () => [0, 1, 2, 3, 4].map((v) => ({ value: v, label: questionTypeLabel(v) })),
    [],
  )

  return (
    <div className="space-y-5">
      {/* Question type */}
      <div className={sectionClass}>
        <div className="space-y-2">
          <Label id={`${formId}-qtype-label`} htmlFor={`${formId}-qtype`} className="text-foreground">
            Question type
          </Label>
          <Select
            id={`${formId}-qtype`}
            aria-labelledby={`${formId}-qtype-label`}
            value={questionTypeValue}
            onChange={(v) => setQuestionTypeValue(Number(v))}
            options={questionTypeOptions}
            placeholder="Select type…"
          />
        </div>
      </div>

      {/* Question text */}
      <div className={sectionClass}>
        <div className="space-y-3">
          <Label htmlFor={`${formId}-qtext`} className="text-foreground">
            Question
          </Label>
          <RichTextField
            value={questionText}
            onChange={setQuestionText}
            placeholder="Write the question… (use the image button in the toolbar to attach images)"
            ariaLabel={`${formId}-qtext`}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className={sectionClass}>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-explanation`} className="text-foreground">
            Explanation
          </Label>
          <RichTextField
            value={explanation}
            onChange={setExplanation}
            placeholder="Optional explanation shown to students (when enabled by test settings)."
            ariaLabel={`${formId}-explanation`}
          />
          <p className={helperClass}>
            Explains the correct answer after submission (if the test allows explanations).
          </p>
        </div>
      </div>

      {/* MCQ options */}
      {showOptions && (
        <div className={sectionClass}>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Label className="text-base font-medium text-foreground">Answer options</Label>
            <Button type="button" variant="secondary" size="sm" className="shrink-0" onClick={addOption}>
              Add option
            </Button>
          </div>
          <div className="space-y-2">
            {options.map((o, idx) => (
              <div
                key={o.id}
                className="flex gap-2 rounded-lg border border-border/60 bg-background/80 p-2 sm:items-start"
              >
                {/* Correct marker */}
                {questionTypeValue === questionType.singleChoice ? (
                  <input
                    type="radio"
                    name={`${formId}-correctOpt`}
                    className="mt-3 h-4 w-4 shrink-0 self-start sm:mt-3 accent-primary"
                    checked={correctSingleId === o.id}
                    onChange={() => setCorrectSingleId(o.id)}
                    aria-label={`Mark option ${idx + 1} as correct`}
                  />
                ) : (
                  <input
                    type="checkbox"
                    className="mt-3 h-4 w-4 shrink-0 self-start sm:mt-3 accent-primary"
                    checked={!!correctMultiIds[o.id]}
                    onChange={() => toggleMulti(o.id)}
                    aria-label={`Mark option ${idx + 1} as correct`}
                  />
                )}

                {/* Option text */}
                <div className="flex-1">
                  <RichTextField
                    value={o.text}
                    onChange={(next) => updateOptionText(o.id, next)}
                    placeholder={`Option ${idx + 1} (use image button in toolbar for images)`}
                    ariaLabel={`${formId}-option-${o.id}`}
                  />
                </div>

                {/* Remove option button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeOption(o.id)}
                  disabled={options.length <= 2}
                  aria-label="Remove option"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
          <p className={cn(helperClass, 'mt-3')}>
            {questionTypeValue === questionType.singleChoice
              ? 'Select the radio button for the one correct answer.'
              : 'Check every option that should be marked correct.'}
          </p>
        </div>
      )}

      {/* True / False */}
      {questionTypeValue === questionType.trueFalse && (
        <div className={sectionClass}>
          <Label className="text-foreground">Correct answer</Label>
          <div className="mt-3 flex flex-wrap gap-3">
            <label
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border border-border/80 bg-background px-4 py-3 text-sm font-medium transition-colors',
                correctText === 'true' &&
                  'border-primary bg-primary/10 text-foreground ring-1 ring-primary/20',
              )}
            >
              <input
                type="radio"
                name={`${formId}-tf`}
                className="accent-primary"
                checked={correctText === 'true'}
                onChange={() => setCorrectText('true')}
              />
              True
            </label>
            <label
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border border-border/80 bg-background px-4 py-3 text-sm font-medium transition-colors',
                correctText === 'false' &&
                  'border-primary bg-primary/10 text-foreground ring-1 ring-primary/20',
              )}
            >
              <input
                type="radio"
                name={`${formId}-tf`}
                className="accent-primary"
                checked={correctText === 'false'}
                onChange={() => setCorrectText('false')}
              />
              False
            </label>
          </div>
        </div>
      )}

      {/* Numerical / Fill in the blank */}
      {(questionTypeValue === questionType.numerical ||
        questionTypeValue === questionType.fillInTheBlank) && (
        <div className={sectionClass}>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-correctText`} className="text-foreground">
              Correct answer
            </Label>
            <Input
              id={`${formId}-correctText`}
              value={correctText}
              onChange={(e) => setCorrectText(e.target.value)}
              type="text"
              inputMode={questionTypeValue === questionType.numerical ? 'decimal' : undefined}
              autoComplete="off"
            />
            {questionTypeValue === questionType.fillInTheBlank && (
              <p className={helperClass}>Matching is case-insensitive on the server.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
