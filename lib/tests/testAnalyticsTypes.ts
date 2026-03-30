/** Matches GET .../analytics JSON `data` (nested summary + attempts). */
export type TestAnalyticsSummary = {
  totalAttempts: number
  averageScore: number
  averagePercentage: number
  passRate: number
  highestScore: number
  lowestScore: number
}

export type TestAnalyticsAttemptRow = {
  attemptId: string
  userId: string
  studentName: string
  studentEmail: string
  status: number
  startedAt: string
  submittedAt?: string
  score: number
  totalScore: number
  percentage: number
  timeTakenMinutes: number | null
}

export type TestQuestionStatRow = {
  questionId: string
  correctCount: number
  totalAttempts: number
  accuracy: number
}

export type TestAnalyticsApiResponse = {
  summary: TestAnalyticsSummary
  attempts: TestAnalyticsAttemptRow[]
  questionStats: TestQuestionStatRow[]
}

export const isTestAnalyticsApiResponse = (value: unknown): value is TestAnalyticsApiResponse => {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (!v.summary || typeof v.summary !== 'object') return false
  if (!Array.isArray(v.attempts)) return false
  if (!Array.isArray(v.questionStats)) return false
  return true
}
