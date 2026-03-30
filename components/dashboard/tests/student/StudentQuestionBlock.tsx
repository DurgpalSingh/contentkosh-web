'use client';

import type { TestQuestion } from '@/lib/api/models/TestQuestion';
import type { TestOption } from '@/lib/api/models/TestOption';
import { Label } from '@/components/ui/label';
import { questionType } from '@/lib/tests/testUiMappers';
import type { AnswerDraft } from '@/lib/tests/studentAttemptAnswers';

interface StudentQuestionBlockProps {
  displayIndex: number;
  question: TestQuestion;
  value: AnswerDraft | undefined;
  onChange: (next: AnswerDraft) => void;
}

function OptionsList({
  questionId,
  options,
  type,
  value,
  onSelect,
}: {
  questionId: string;
  options: TestOption[];
  type: number;
  value: AnswerDraft | undefined;
  onSelect: (optionId: string, isMulti: boolean) => void;
}) {
  const selected = new Set(value?.selectedOptionIds ?? []);
  const isMulti = type === questionType.multipleChoice;
  const radioGroupName = `mcq-${questionId}`;

  return (
    <ul className="space-y-2 mt-3">
      {options.map((opt) => {
        const oid = opt.id ?? '';
        if (!oid) return null;
        const checked = selected.has(oid);
        return (
          <li key={oid}>
            <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-500">
              <input
                type={isMulti ? 'checkbox' : 'radio'}
                name={isMulti ? `${radioGroupName}-${oid}` : radioGroupName}
                checked={checked}
                onChange={() => onSelect(oid, isMulti)}
                className="mt-1"
              />
              <span className="text-sm text-gray-800">{opt.text}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function StudentQuestionBlock({
  displayIndex,
  question,
  value,
  onChange,
}: StudentQuestionBlockProps) {
  const body = question.questionText || question.text || '';
  const qType = question.type;
  const options = question.options ?? [];

  const handleOptionSelect = (optionId: string, isMulti: boolean) => {
    if (isMulti) {
      const cur = new Set(value?.selectedOptionIds ?? []);
      if (cur.has(optionId)) cur.delete(optionId);
      else cur.add(optionId);
      onChange({ selectedOptionIds: [...cur] });
    } else {
      onChange({ selectedOptionIds: [optionId] });
    }
  };

  const getTrueFalseTextAnswer = (): 'true' | 'false' | undefined => {
    const curText = value?.textAnswer;
    if (typeof curText === 'string') {
      const norm = curText.trim().toLowerCase();
      if (norm === 'true' || norm === 'false') return norm;
    }

    const selectedIds = value?.selectedOptionIds ?? [];
    if (selectedIds.length === 0) return undefined;

    const selectedOption = options.find((o) => o.id && selectedIds.includes(o.id));
    const selectedText = selectedOption?.text?.trim().toLowerCase();
    if (!selectedText) return undefined;
    if (selectedText.includes('true')) return 'true';
    if (selectedText.includes('false')) return 'false';
    return undefined;
  };

  const trueFalseTextAnswer = getTrueFalseTextAnswer();

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm"
      aria-labelledby={`q-heading-${question.id}`}
    >
      <h3 id={`q-heading-${question.id}`} className="text-base font-semibold text-gray-900">
        Question {displayIndex}
      </h3>
      <p className="mt-3 text-gray-800 whitespace-pre-wrap">{body}</p>

      {qType === questionType.trueFalse && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">Your answer</p>
          <ul className="space-y-2 mt-3">
            {(['true', 'false'] as const).map((tf) => {
              const checked = trueFalseTextAnswer === tf;
              const label = tf === 'true' ? 'True' : 'False';
              return (
                <li key={tf}>
                  <label
                    className="flex items-center gap-3 cursor-pointer rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
                    aria-label={label}
                  >
                    <input
                      type="radio"
                      name={`tf-${question.id}`}
                      checked={checked}
                      onChange={() => onChange({ textAnswer: tf })}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-800">{label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {(qType === questionType.singleChoice || qType === questionType.multipleChoice) && (
        <OptionsList
          questionId={question.id}
          options={options}
          type={qType}
          value={value}
          onSelect={handleOptionSelect}
        />
      )}

      {qType === questionType.numerical && (
        <div className="mt-4">
          <Label htmlFor={`num-${question.id}`} className="text-sm text-gray-700">
            Your answer
          </Label>
          <input
            id={`num-${question.id}`}
            type="number"
            step="any"
            className="mt-1 w-full max-w-xs border rounded-md px-3 py-2 text-sm"
            value={value?.textAnswer ?? ''}
            onChange={(e) => onChange({ textAnswer: e.target.value })}
          />
        </div>
      )}

      {qType === questionType.fillInTheBlank && (
        <div className="mt-4">
          <Label htmlFor={`fill-${question.id}`} className="text-sm text-gray-700">
            Your answer
          </Label>
          <input
            id={`fill-${question.id}`}
            type="text"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
            value={value?.textAnswer ?? ''}
            onChange={(e) => onChange({ textAnswer: e.target.value })}
          />
        </div>
      )}
    </section>
  );
}
