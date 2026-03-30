'use client';

import type { AnswerDraft } from '@/lib/tests/studentAttemptAnswers';
import { isQuestionAnswered } from '@/lib/tests/studentAttemptAnswers';

export type QuestionUiState =
  | 'active'
  | 'answered'
  | 'markedForReviewUnanswered'
  | 'markedForReviewAnswered'
  | 'flagged'
  | 'visited'
  | 'unvisited';

export function getQuestionUiState(params: {
  qType: number;
  answer: AnswerDraft | undefined;
  visited: boolean;
  flagged: boolean;
  markedForReview: boolean;
  isActive: boolean;
}): QuestionUiState {
  if (params.isActive) return 'active';
  if (params.flagged) return 'flagged';
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
      return 'bg-white text-gray-900 border-violet-300 ring-2 ring-violet-500 ring-offset-1';
    case 'answered':
      return 'bg-emerald-600 text-white border-emerald-600';
    case 'flagged':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'markedForReviewUnanswered':
      return 'bg-violet-100 text-violet-900 border-violet-400';
    case 'markedForReviewAnswered':
      return 'bg-cyan-100 text-cyan-950 border-cyan-500';
    case 'visited':
      return 'bg-white text-gray-700 border-gray-300';
    case 'unvisited':
    default:
      return 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50';
  }
}

