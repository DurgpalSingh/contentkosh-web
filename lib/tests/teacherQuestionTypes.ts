import type { TestQuestion } from '@/lib/api'

/** Question row from teacher list/get APIs (includes answers for editing). */
export type TeacherTestQuestion = TestQuestion & {
  explanation?: string | null
  correctTextAnswer?: string | null
  correctOptionIdsAnswers?: string[]
}
