'use client';

import type { TestQuestion } from '@/lib/api/models/TestQuestion';
import type { TestOption } from '@/lib/api/models/TestOption';
import { Label } from '@/components/ui/label';
import { questionType, questionTypeLabel } from '@/lib/tests/testUiMappers';
import type { AnswerDraft } from '@/lib/tests/studentAttemptAnswers';
import { HtmlContent } from '@/components/common/HtmlContent';

interface StudentQuestionBlockProps {
  displayIndex: number;
  totalQuestions: number;
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
    <ul className="space-y-3 mt-6">
      {options.map((opt) => {
        const oid = opt.id ?? '';
        if (!oid) return null;
        const checked = selected.has(oid);
        return (
          <li key={oid}>
            <label
              className={[
                'flex items-start gap-3.5 cursor-pointer rounded-xl border px-4 py-4 transition-all duration-150',
                checked
                  ? 'border-blue-400 bg-blue-50/70 shadow-sm shadow-blue-500/10 ring-1 ring-blue-500/15'
                  : 'border-slate-200/95 bg-white hover:border-slate-300 hover:bg-slate-50/80',
              ].join(' ')}
            >
              <input
                type={isMulti ? 'checkbox' : 'radio'}
                name={isMulti ? `${radioGroupName}-${oid}` : radioGroupName}
                checked={checked}
                onChange={() => onSelect(oid, isMulti)}
                className="mt-1 h-4 w-4 shrink-0 border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-[15px] leading-snug text-slate-800 pt-0.5">{opt.text}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function StudentQuestionBlock({
  displayIndex,
  totalQuestions,
  question,
  value,
  onChange,
}: StudentQuestionBlockProps) {
  const body = question.questionText || question.text || '';
  const qType = question.type;
  const options = question.options ?? [];
  const typeLabel = questionTypeLabel(qType);

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
      className="rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_16px_-6px_rgba(15,23,42,0.1)] overflow-hidden"
      aria-labelledby={`q-heading-${question.id}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white px-5 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <h2 id={`q-heading-${question.id}`} className="text-sm font-medium text-slate-500">
            Question {displayIndex} of {totalQuestions}
          </h2>
          <span className="inline-flex rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm">
            {typeLabel}
          </span>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="text-base leading-relaxed text-slate-900 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5">
          <HtmlContent html={body} />
        </div>

        {qType === questionType.trueFalse && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-slate-700">Your answer</p>
            <ul className="mt-4 space-y-3">
              {(['true', 'false'] as const).map((tf) => {
                const checked = trueFalseTextAnswer === tf;
                const label = tf === 'true' ? 'True' : 'False';
                return (
                  <li key={tf}>
                    <label
                      className={[
                        'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-all',
                        checked
                          ? 'border-blue-400 bg-blue-50/70 ring-1 ring-blue-500/15'
                          : 'border-slate-200 bg-white hover:bg-slate-50',
                      ].join(' ')}
                      aria-label={label}
                    >
                      <input
                        type="radio"
                        name={`tf-${question.id}`}
                        checked={checked}
                        onChange={() => onChange({ textAnswer: tf })}
                        className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-800">{label}</span>
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
          <div className="mt-8">
            <Label htmlFor={`num-${question.id}`} className="text-sm font-semibold text-slate-700">
              Your answer
            </Label>
            <input
              id={`num-${question.id}`}
              type="number"
              step="any"
              className="mt-2 w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
              value={value?.textAnswer ?? ''}
              onChange={(e) => onChange({ textAnswer: e.target.value })}
            />
          </div>
        )}

        {qType === questionType.fillInTheBlank && (
          <div className="mt-8">
            <Label htmlFor={`fill-${question.id}`} className="text-sm font-semibold text-slate-700">
              Your answer
            </Label>
            <input
              id={`fill-${question.id}`}
              type="text"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
              value={value?.textAnswer ?? ''}
              onChange={(e) => onChange({ textAnswer: e.target.value })}
            />
          </div>
        )}
      </div>
    </section>
  );
}
