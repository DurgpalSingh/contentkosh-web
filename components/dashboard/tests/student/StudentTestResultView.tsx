'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StartAttemptConfirmModal, type StartAttemptTestInfo } from '@/components/modals/StartAttemptConfirmModal';
import type { TestLanguage } from '@/lib/api/models/TestLanguage';
import type { PracticeTestAttemptDetails, ExamTestAttemptDetails } from '@/lib/api';
import { PracticeTestsService } from '@/lib/api';
import { AttemptStatus } from '@/lib/api/models/AttemptStatus';
import type { StudentAttemptQuestion } from '@/lib/api/models/StudentAttemptQuestion';
import {
  studentExamAttemptPath,
  studentPracticeAttemptPath,
  studentTestBasePath,
} from '@/lib/tests/studentTestCatalog';
import { questionTypeLabel, questionType } from '@/lib/tests/testUiMappers';
import { HtmlContent } from '@/components/common/HtmlContent';
import { TEST_KIND, TEST_KIND_LABEL, type TestKind } from '@/lib/tests/testConstants';

type AttemptDetails = PracticeTestAttemptDetails | ExamTestAttemptDetails;
type AttemptWithAnsweredCount = AttemptDetails['attempt'] & { answeredCount?: number };

export function StudentTestResultView({
  kind,
  attemptId,
  slug,
  details,
}: {
  kind: TestKind;
  attemptId: string;
  slug: string;
  details: AttemptDetails;
}) {
  const router = useRouter();
  const { business } = useAuthStore();
  const businessId = business?.id;
  const [startConfirmOpen, setStartConfirmOpen] = useState(false);

  const safeAttempt = details.attempt;
  const safeTest = details.test;
  const safeQuestions = useMemo(() => details.questions ?? [], [details.questions]);
  const attemptMeta = safeAttempt as AttemptWithAnsweredCount | undefined;

  const derived = useMemo(() => {
    const attemptStatus = safeAttempt?.status;
    const isExam = kind === TEST_KIND.EXAM;
    const resultsVisible =
      !isExam ||
      safeQuestions.some((row) => row.correctAnswer != null) ||
      safeAttempt?.score != null ||
      safeAttempt?.totalScore != null ||
      safeAttempt?.percentage != null;
    const resultsHidden =
      !!safeAttempt &&
      !!safeTest &&
      isExam &&
      attemptStatus !== AttemptStatus._0 &&
      !resultsVisible;

    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    for (const row of safeQuestions) {
      const sa = row.studentAnswer;
      const hasAnswer = !!(
        sa &&
        ((sa.selectedOptionIds && sa.selectedOptionIds.length > 0) ||
          (sa.textAnswer != null && sa.textAnswer !== ''))
      );
      if (!hasAnswer) {
        unattempted += 1;
        continue;
      }
      if (sa?.isCorrect === true) correct += 1;
      else if (sa?.isCorrect === false) incorrect += 1;
    }

    return {
      isExam,
      resultsHidden,
      attemptInProgress: attemptStatus === AttemptStatus._0,
      stats: { total: safeQuestions.length, correct, incorrect, unattempted },
    };
  }, [kind, safeAttempt, safeQuestions, safeTest]);

  const attempt = details.attempt;
  const test = details.test;
  const practiceTestId = attempt.practiceTestId;
  const practiceLanguage = (test as { language: TestLanguage }).language;

  const startPracticeAttempt = async (language: TestLanguage) => {
    if (kind !== TEST_KIND.PRACTICE) return;
    if (typeof businessId !== 'number') throw new Error('Not authorized');
    if (!practiceTestId) throw new Error('Missing practice test id');

    const res = await PracticeTestsService.postApiBusinessPracticeTestsAttempts(businessId, {
      practiceTestId,
      language,
    });
    const aid = res.data?.attemptId;
    if (!aid) throw new Error('Could not start attempt');
    router.push(studentPracticeAttemptPath(slug, aid));
  };
  const questions = safeQuestions;
  const resultsHidden = derived.resultsHidden;
  const isExam = kind === TEST_KIND.EXAM;

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
    ) : resultsHidden ? (
      <p className="text-gray-700 mt-2">Your score will be available when results are released.</p>
    ) : null;

  const attemptInProgress = derived.attemptInProgress;

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
          {TEST_KIND_LABEL[kind]}
        </span>
        <h1 className="text-2xl font-bold text-gray-900">{test.name}</h1>
        {test.batchName && <p className="text-sm text-gray-500 mt-1">{test.batchName}</p>}
        {scoreLine}
        {attempt.submittedAt && (
          <p className="text-sm text-gray-500 mt-2">
            Submitted {new Date(attempt.submittedAt).toLocaleString()}
          </p>
        )}
        {!attemptInProgress && kind === TEST_KIND.PRACTICE && practiceTestId && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => setStartConfirmOpen(true)}
            >
              Reattempt
            </Button>
          </div>
        )}
        {attemptInProgress && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex flex-wrap items-center justify-between gap-3">
            <p>Your attempt is still in progress.</p>
            <Button
              type="button"
              variant="outline"
              className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
              onClick={() => {
                if (kind === TEST_KIND.PRACTICE) router.push(studentPracticeAttemptPath(slug, attemptId));
                else router.push(studentExamAttemptPath(slug, attemptId));
              }}
            >
              Resume attempt
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {resultsHidden ? (
            <>
              <SummaryTile
                label="Attempted"
                value={Math.max(0, attemptMeta?.answeredCount ?? 0)}
                tone="success"
              />
              <SummaryTile
                label="Unattempted"
                value={Math.max(0, derived.stats.total - (attemptMeta?.answeredCount ?? 0))}
                tone="muted"
              />
            </>
          ) : (
            <>
              <SummaryTile label="Questions" value={derived.stats.total} tone="neutral" />
              <SummaryTile label="Correct" value={derived.stats.correct} tone="success" />
              <SummaryTile label="Incorrect" value={derived.stats.incorrect} tone="danger" />
              <SummaryTile label="Unattempted" value={derived.stats.unattempted} tone="muted" />
            </>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">Detailed answers</h2>
            {resultsHidden && (
              <p className="text-sm text-amber-800 mt-1">
                Detailed results for this exam are hidden until they are released.
              </p>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {questions.map((row, i) => (
              <ResultQuestionCard
                key={row.question.id}
                index={i + 1}
                row={row}
                hiddenByPolicy={!!resultsHidden}
              />
            ))}
          </div>
        </div>
      </div>
      <StartAttemptConfirmModal
        isOpen={startConfirmOpen}
        onClose={() => setStartConfirmOpen(false)}
        onConfirm={startPracticeAttempt}
        testInfo={{
          kind: TEST_KIND.PRACTICE,
          testId: practiceTestId ?? '',
          testName: test.name,
          batchName: test.batchName,
          rulesDescription: test.description,
          questionCount: test.totalQuestions ?? 0,
          marksPerQuestion: test.defaultMarksPerQuestion,
          testLanguage: practiceLanguage,
        }}
      />
    </div>
  );
}

function SummaryTile(props: {
  label: string;
  value: number;
  tone: 'neutral' | 'success' | 'danger' | 'muted';
}) {
  const cls =
    props.tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : props.tone === 'danger'
        ? 'border-red-200 bg-red-50 text-red-900'
        : props.tone === 'muted'
          ? 'border-slate-200 bg-slate-50 text-slate-900'
          : 'border-gray-200 bg-white text-gray-900';
  return (
    <div className={`rounded-xl border px-4 py-3 shadow-sm ${cls}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{props.label}</p>
      <p className="text-2xl font-bold mt-1">{props.value}</p>
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

  const selectedIds = new Set(sa?.selectedOptionIds ?? []);
  const correctIds = new Set(ca?.correctOptionIds ?? []);
  const options = q.options ?? [];

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">Question {index}</h3>
        <span className="text-xs text-gray-500">{questionTypeLabel(q.type)}</span>
      </div>
      <div className="mt-2 text-gray-800 min-w-0">
        <HtmlContent html={body} />
      </div>

      {hiddenByPolicy && (
        <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
          Detailed results for this exam are hidden until they are released.
        </p>
      )}

      {!hiddenByPolicy && (
        <>
          {(q.type === questionType.singleChoice || q.type === questionType.multipleChoice) && options.length > 0 && (
            <ul className="space-y-2 mt-4">
              {options.map((opt) => {
                const oid = opt.id ?? '';
                if (!oid) return null;
                const isCorrect = correctIds.has(oid);
                const isSelected = selectedIds.has(oid);
                const cls = isCorrect
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : isSelected
                    ? 'border-red-200 bg-red-50 text-red-900'
                    : 'border-gray-200 bg-white text-gray-800';
                const badge = isCorrect ? 'Correct' : isSelected ? 'Your choice' : undefined;
                return (
                  <li key={oid}>
                    <div className={`rounded-lg border px-3 py-2 text-sm ${cls}`}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="whitespace-pre-wrap">{opt.text}</p>
                        {badge && <span className="text-xs font-semibold">{badge}</span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

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
              <div className="text-gray-600 mt-1">
                <HtmlContent html={explanation} />
              </div>
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
