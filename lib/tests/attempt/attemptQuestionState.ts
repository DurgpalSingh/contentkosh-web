'use client';

import type { AnswerDraft } from '@/lib/tests/studentAttemptAnswers';
import { isQuestionAnswered } from '@/lib/tests/studentAttemptAnswers';

export type QuestionUiState =
  | 'active'
  | 'answered'
  | 'markedForReviewUnanswered'
  | 'markedForReviewAnswered'
  | 'visited'
  | 'unvisited';

export function getQuestionUiState(params: {
  qType: number;
  answer: AnswerDraft | undefined;
  visited: boolean;
  markedForReview: boolean;
  isActive: boolean;
}): QuestionUiState {
  if (params.isActive) return 'active';
  if (params.markedForReview) {
    if (isQuestionAnswered(params.qType, params.answer)) {
      return 'markedForReviewAnswered';
    }
    return 'markedForReviewUnanswered';
  }
  if (isQuestionAnswered(params.qType, params.answer)) return 'answered';
  if (params.visited) return 'visited';
  return 'unvisited';
}

export function getQuestionUiClass(state: QuestionUiState): string {
  switch (state) {
    case 'active':
      return 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm shadow-blue-500/15';
    case 'answered':
      return 'border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-600';
    case 'markedForReviewUnanswered':
      return 'border-violet-400 bg-violet-50 text-violet-900 hover:bg-violet-100/80';
    case 'markedForReviewAnswered':
      return 'border-cyan-500 bg-cyan-50 text-cyan-950 hover:bg-cyan-100/80';
    case 'visited':
      return 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50';
    case 'unvisited':
    default:
      return 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50';
  }
}
