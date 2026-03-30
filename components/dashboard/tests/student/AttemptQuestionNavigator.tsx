'use client';

import { memo, useCallback } from 'react';
import type { TestQuestion } from '@/lib/api/models/TestQuestion';
import type { AnswerDraft } from '@/lib/tests/studentAttemptAnswers';
import { getQuestionUiClass, getQuestionUiState } from '@/lib/tests/attempt/attemptQuestionState';

type QuestionRow = {
  question: TestQuestion;
};

const NavigatorItem = memo(function NavigatorItem(props: {
  index: number;
  row: QuestionRow;
  isActive: boolean;
  answer: AnswerDraft | undefined;
  visited: boolean;
  flagged: boolean;
  markedForReview: boolean;
  onSelectIndex: (index: number) => void;
}) {
  const onSelect = useCallback(() => props.onSelectIndex(props.index), [props.index, props.onSelectIndex]);
  const state = getQuestionUiState({
    qType: props.row.question.type,
    answer: props.answer,
    visited: props.visited,
    flagged: props.flagged,
    markedForReview: props.markedForReview,
    isActive: props.isActive,
  });
  const cls = getQuestionUiClass(state);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`h-9 rounded-md border text-sm font-medium ${cls}`}
      aria-label={`Question ${props.index + 1}`}
      aria-current={props.isActive ? 'true' : undefined}
    >
      {props.index + 1}
    </button>
  );
});

export function AttemptQuestionNavigator({
  rows,
  activeIndex,
  answers,
  visited,
  flagged,
  markedForReview,
  onSelectIndex,
}: {
  rows: QuestionRow[];
  activeIndex: number;
  answers: Record<string, AnswerDraft>;
  visited: Set<string>;
  flagged: Set<string>;
  markedForReview: Set<string>;
  onSelectIndex: (index: number) => void;
}) {
  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Questions</p>
        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-6 gap-2">
          {rows.map((row, i) => (
            <NavigatorItem
              key={row.question.id}
              index={i}
              row={row}
              isActive={i === activeIndex}
              answer={answers[row.question.id]}
              visited={visited.has(row.question.id)}
              flagged={flagged.has(row.question.id)}
              markedForReview={markedForReview.has(row.question.id)}
              onSelectIndex={onSelectIndex}
            />
          ))}
        </div>

        <ul className="mt-4 text-xs text-slate-600 space-y-1">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-emerald-600" /> Answered
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-amber-200 border border-amber-400" /> Flagged
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-violet-100 border border-violet-400" /> Review (no answer)
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-cyan-100 border border-cyan-500" /> Review + answered
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-white border border-gray-300" /> Visited
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-white border border-gray-200" /> Unvisited
          </li>
        </ul>
      </div>
    </aside>
  );
}

