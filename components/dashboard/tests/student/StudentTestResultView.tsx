'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  ExamTestsService,
  PracticeTestsService,
  type PracticeTestAttemptDetails,
  type ExamTestAttemptDetails,
} from '@/lib/api';
import { AttemptStatus } from '@/lib/api/models/AttemptStatus';
import { ResultVisibilityExam } from '@/lib/api/models/ResultVisibilityExam';
import type { StudentAttemptQuestion } from '@/lib/api/models/StudentAttemptQuestion';
import { toast } from 'sonner';
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage';
import {
  studentExamAttemptPath,
  studentPracticeAttemptPath,
  studentTestBasePath,
} from '@/lib/tests/studentTestCatalog';
import { questionTypeLabel, questionType } from '@/lib/tests/testUiMappers';

type AttemptDetails = PracticeTestAttemptDetails | ExamTestAttemptDetails;

export function StudentTestResultView({
  kind,
  attemptId,
}: {
  kind: 'practice' | 'exam';
  attemptId: string;
}) {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { business, isAuthenticated, isInitialized } = useAuthStore();
  const businessId = business?.id;

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<AttemptDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (typeof businessId !== 'number') return;
    setLoading(true);
    setError(null);
    try {
      const res =
        kind === 'practice'
          ? await PracticeTestsService.getApiBusinessPracticeTestsAttempts(businessId, attemptId)
          : await ExamTestsService.getApiBusinessExamTestsAttempts(businessId, attemptId);
      const data = res.data;
      if (!data) {
        setError('Could not load results');
        return;
      }
      setDetails(data);
    } catch (e: unknown) {
      const msg = getApiErrorDetailMessage(e, 'Failed to load results');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [businessId, kind, attemptId]);

  useEffect(() => {
    if (isInitialized && isAuthenticated && typeof businessId === 'number') {
      void load();
    }
  }, [isInitialized, isAuthenticated, businessId, load]);

  useEffect(() => {
    if (!details || !slug) return;
    if (details.attempt.status !== AttemptStatus._0) return;
    if (kind === 'practice' && details.attempt.practiceTestId) {
      router.replace(studentPracticeAttemptPath(slug, attemptId));
    } else if (kind === 'exam' && details.attempt.examTestId) {
      router.replace(studentExamAttemptPath(slug, attemptId));
    }
  }, [details, slug, kind, attemptId, router]);

  if (!isInitialized || (loading && !details)) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || typeof businessId !== 'number') return null;

  if (error && !details) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
        <Button variant="outline" asChild>
          <Link href={studentTestBasePath(slug)}>Back to My Tests</Link>
        </Button>
      </div>
    );
  }

  if (!details) return null;

  const { attempt, test, questions } = details;
  const isExam = kind === 'exam';
  const hiddenByPolicy =
    isExam &&
    'resultVisibility' in test &&
    test.resultVisibility === ResultVisibilityExam._1 &&
    attempt.status !== AttemptStatus._0;

  const scoreLine =
    attempt.score != null && attempt.totalScore != null ? (
      <p className="text-2xl font-bold text-gray-900 mt-2">
        Score: {attempt.score} / {attempt.totalScore}
        {attempt.percentage != null && (
          <span className="text-lg font-semibold text-violet-700 ml-2">
            ({attempt.percentage.toFixed(1)}%)
          </span>
        )}
      </p>
    ) : hiddenByPolicy ? (
      <p className="text-gray-700 mt-2">Your score will be available when results are released.</p>
    ) : null;

  return (
    <div className="space-y-6">
      <Link
        href={studentTestBasePath(slug)}
        className="inline-flex items-center text-sm text-violet-700 hover:text-violet-900"
      >
        <ChevronLeft className="h-4 w-4 mr-1" aria-hidden />
        My Tests
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
        <span
          className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${
            isExam ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
          }`}
        >
          {isExam ? 'Exam' : 'Practice'}
        </span>
        <h1 className="text-2xl font-bold text-gray-900">{test.name}</h1>
        {test.batchName && <p className="text-sm text-gray-500 mt-1">{test.batchName}</p>}
        {scoreLine}
        {attempt.submittedAt && (
          <p className="text-sm text-gray-500 mt-2">
            Submitted {new Date(attempt.submittedAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Question breakdown</h2>
        {questions.map((row, i) => (
          <ResultQuestionCard key={row.question.id} index={i + 1} row={row} hiddenByPolicy={!!hiddenByPolicy} />
        ))}
      </div>
    </div>
  );
}

function ResultQuestionCard({
  index,
  row,
  hiddenByPolicy,
}: {
  index: number;
  row: StudentAttemptQuestion;
  hiddenByPolicy: boolean;
}) {
  const q = row.question;
  const body = q.questionText || q.text || '';
  const sa = row.studentAnswer;
  const ca = row.correctAnswer;
  const explanation = q.explanation;
  const showStudent =
    !hiddenByPolicy && sa && (sa.selectedOptionIds?.length || sa.textAnswer != null || sa.isCorrect != null);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">Question {index}</h3>
        <span className="text-xs text-gray-500">{questionTypeLabel(q.type)}</span>
      </div>
      <p className="mt-2 text-gray-800 whitespace-pre-wrap">{body}</p>

      {hiddenByPolicy && (
        <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
          Detailed results for this exam are hidden until they are released.
        </p>
      )}

      {!hiddenByPolicy && (
        <>
          {showStudent && (
            <div className="mt-3 text-sm">
              <p className="font-medium text-gray-700">Your answer</p>
              <AnswerSummary qType={q.type} row={row} />
              {sa?.obtainedMarks != null && (
                <p className="text-gray-600 mt-1">Marks: {sa.obtainedMarks}</p>
              )}
              {sa?.isCorrect != null && (
                <p className={sa.isCorrect ? 'text-emerald-700 mt-1' : 'text-red-700 mt-1'}>
                  {sa.isCorrect ? 'Correct' : 'Incorrect'}
                </p>
              )}
            </div>
          )}

          {!hiddenByPolicy && explanation && (
            <div className="mt-3">
              <p className="font-medium text-gray-700">Explanation</p>
              <p className="text-gray-600 mt-1 whitespace-pre-wrap">{explanation}</p>
            </div>
          )}

          {ca && (ca.correctOptionIds?.length || ca.correctTextAnswer) && (
            <div className="mt-3 text-sm border-t border-gray-100 pt-3">
              <p className="font-medium text-gray-700">Correct answer</p>
              {ca.correctTextAnswer != null && ca.correctTextAnswer !== '' && (
                <p className="text-gray-800 mt-1">{ca.correctTextAnswer}</p>
              )}
              {ca.correctOptionIds && ca.correctOptionIds.length > 0 && q.options && (
                <ul className="mt-1 list-disc pl-5 text-gray-800">
                  {q.options
                    .filter((o) => o.id && ca.correctOptionIds?.includes(o.id))
                    .map((o) => (
                      <li key={o.id}>{o.text}</li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AnswerSummary({ qType, row }: { qType: number; row: StudentAttemptQuestion }) {
  const sa = row.studentAnswer;
  if (!sa) return <p className="text-gray-500 mt-1">No answer</p>;

  if (qType === questionType.numerical || qType === questionType.fillInTheBlank || qType === questionType.trueFalse) {
    return <p className="text-gray-900 mt-1">{sa.textAnswer ?? '—'}</p>;
  }

  const ids = sa.selectedOptionIds ?? [];
  const opts = row.question.options ?? [];
  const texts = opts.filter((o) => o.id && ids.includes(o.id)).map((o) => o.text);
  if (texts.length === 0) return <p className="text-gray-500 mt-1">No selection</p>;
  return (
    <ul className="mt-1 list-disc pl-5 text-gray-900">
      {texts.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}
