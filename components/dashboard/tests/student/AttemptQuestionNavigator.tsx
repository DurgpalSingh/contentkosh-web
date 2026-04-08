'use client';

import { memo, useCallback, useMemo } from 'react';
import type { TestQuestion } from '@/lib/api/models/TestQuestion';
import type { AnswerDraft } from '@/lib/tests/studentAttemptAnswers';
import { isQuestionAnswered } from '@/lib/tests/studentAttemptAnswers';
import { getQuestionUiClass, getQuestionUiState } from '@/lib/tests/attempt/attemptQuestionState';

type QuestionRow = {
  question: TestQuestion;
};

const NavigatorItem = memo(function NavigatorItem({
  index,
  row,
  isActive,
  answer,
  visited,
  markedForReview,
  onSelectIndex,
}: {
  index: number;
  row: QuestionRow;
  isActive: boolean;
  answer: AnswerDraft | undefined;
  visited: boolean;
  markedForReview: boolean;
  onSelectIndex: (index: number) => void;
}) {
  const onSelect = useCallback(() => onSelectIndex(index), [index, onSelectIndex]);
  const state = getQuestionUiState({
    qType: row.question.type,
    answer,
    visited,
    markedForReview,
    isActive,
  });
  const cls = getQuestionUiClass(state);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${cls}`}
      aria-label={`Question ${index + 1}`}
      aria-current={isActive ? 'true' : undefined}
    >
      {index + 1}
    </button>
  );
});

export function AttemptQuestionNavigator({
  rows,
  activeIndex,
  answers,
  visited,
  markedForReview,
  onSelectIndex,
}: {
  rows: QuestionRow[];
  activeIndex: number;
  answers: Record<string, AnswerDraft>;
  visited: Set<string>;
  markedForReview: Set<string>;
  onSelectIndex: (index: number) => void;
}) {
  const stats = useMemo(() => {
    let answered = 0;
    let reviewNoAnswer = 0;
    let reviewWithAnswer = 0;
    let unanswered = 0;
    for (const row of rows) {
      const q = row.question;
      const a = answers[q.id];
      const answeredQ = isQuestionAnswered(q.type, a);
      const mr = markedForReview.has(q.id);
      if (answeredQ) {
        answered += 1;
        if (mr) reviewWithAnswer += 1;
      } else {
        unanswered += 1;
        if (mr) reviewNoAnswer += 1;
      }
    }
    return { answered, reviewNoAnswer, reviewWithAnswer, unanswered };
  }, [rows, answers, markedForReview]);

  return (
    <aside className="w-full min-h-0 max-h-[90vh] lg:max-h-[60vh]">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_16px_-6px_rgba(15,23,42,0.1)] h-full">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Questions</p>
        <div className='flex flex-col gap-2'>
          <ul className="mb-6 space-y-2.5 border-b border-slate-100 pb-5 text-xs text-slate-600">
            <li className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                <span>Answered</span>
              </span>
              <span className="tabular-nums font-medium text-slate-500">{stats.answered}</span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-violet-400 bg-violet-100" />
                <span>Review (no answer)</span>
              </span>
              <span className="tabular-nums font-medium text-slate-500">{stats.reviewNoAnswer}</span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-cyan-500 bg-cyan-100" />
                <span>Review + answered</span>
              </span>
              <span className="tabular-nums font-medium text-slate-500">{stats.reviewWithAnswer}</span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300" />
                <span>Unanswered</span>
              </span>
              <span className="tabular-nums font-medium text-slate-500">{stats.unanswered}</span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-2 overflow-auto scrollbar-hide max-h-[30vh]">
            {rows.map((row, i) => (
              <NavigatorItem
                key={row.question.id}
                index={i}
                row={row}
                isActive={i === activeIndex}
                answer={answers[row.question.id]}
                visited={visited.has(row.question.id)}
                markedForReview={markedForReview.has(row.question.id)}
                onSelectIndex={onSelectIndex}
              />
            ))}
          </div>
        </div>
        
      </div>
    </aside>
  );
}
