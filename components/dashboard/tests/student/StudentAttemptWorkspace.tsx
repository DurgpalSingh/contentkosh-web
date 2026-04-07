'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  ExamTestsService,
  PracticeTestsService,
  type PracticeTestAttemptDetails,
  type ExamTestAttemptDetails,
} from '@/lib/api';
import { AttemptStatus } from '@/lib/api/models/AttemptStatus';
import { toast } from 'sonner';
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage';
import {
  studentExamResultPath,
  studentPracticeResultPath,
  studentTestBasePath,
} from '@/lib/tests/studentTestCatalog';
import {
  initAnswersFromAttemptQuestions,
  buildSubmitPayload,
  countUnanswered,
  type AnswerDraft,
  isQuestionAnswered,
} from '@/lib/tests/studentAttemptAnswers';
import { StudentSubmitTestModal } from '@/components/dashboard/tests/student/StudentSubmitTestModal';
import { formatDurationMinutes, type TestListSubjectFields } from '@/lib/tests/testUiMappers';
import { AttemptHeader } from '@/components/dashboard/tests/student/AttemptHeader';
import { AttemptQuestionNavigator } from '@/components/dashboard/tests/student/AttemptQuestionNavigator';
import { AttemptActionBar } from '@/components/dashboard/tests/student/AttemptActionBar';
import { StudentQuestionBlock } from '@/components/dashboard/tests/student/StudentQuestionBlock';
import { TEST_KIND, type TestKind } from '@/lib/tests/testConstants';

export type StudentAttemptKind = TestKind;

function readJsonFromLocalStorage(key: string): unknown | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function removeLocalStorageKeys(keys: string[]): void {
  try {
    for (const key of keys) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore storage failures
  }
}

function writeJsonToLocalStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
}

type AttemptDetails = PracticeTestAttemptDetails | ExamTestAttemptDetails;

type AttemptWithTimer = AttemptDetails['attempt'] & { timeRemainingSeconds?: number };

type AttemptTestMeta = TestListSubjectFields & {
  batchName?: string;
  name?: string;
};

export function StudentAttemptWorkspace({
  kind,
  attemptId,
  details: detailsProp,
}: {
  kind: TestKind;
  attemptId: string;
  details: AttemptDetails;
}) {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { business, isAuthenticated } = useAuthStore();
  const businessId = business?.id;

  const details = detailsProp;
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(() => new Set());
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timerSec, setTimerSec] = useState<number | null>(null);
  const draftStorageKey = useMemo(
    () => `studentAttemptDraft:${kind}:${attemptId}`,
    [kind, attemptId],
  );
  const uiStorageKey = useMemo(() => `studentAttemptUi:${kind}:${attemptId}`, [kind, attemptId]);
  const didAutoSubmit = useRef(false);
  const submitLock = useRef(false);
  const examCountdownStarted = useRef(false);

  useEffect(() => {
    didAutoSubmit.current = false;
    examCountdownStarted.current = false;
    const data = detailsProp;
    const inProgress = data.attempt.status === AttemptStatus._0;

    const serverAnswers = initAnswersFromAttemptQuestions(data.questions);
    if (!inProgress) {
      removeLocalStorageKeys([draftStorageKey, uiStorageKey]);
      setAnswers(serverAnswers);
      setMarkedForReview(new Set());
      setVisited(new Set());
    } else {
      let localDraft: Record<string, AnswerDraft> | null = null;
      const parsedDraft = readJsonFromLocalStorage(draftStorageKey);
      if (parsedDraft && typeof parsedDraft === 'object') {
        localDraft = parsedDraft as Record<string, AnswerDraft>;
      }

      setAnswers({ ...serverAnswers, ...(localDraft ?? {}) });

      const parsedUi = readJsonFromLocalStorage(uiStorageKey);
      if (parsedUi && typeof parsedUi === 'object') {
        const obj = parsedUi as {
          markedForReview?: string[];
          visited?: string[];
        };
        setMarkedForReview(new Set(obj.markedForReview ?? []));
        setVisited(new Set(obj.visited ?? []));
      }
    }

    const att = data.attempt as AttemptWithTimer;
    if (kind === TEST_KIND.EXAM && typeof att.timeRemainingSeconds === 'number') {
      setTimerSec(Math.max(0, att.timeRemainingSeconds));
    } else {
      setTimerSec(null);
    }
  }, [detailsProp, kind, attemptId, draftStorageKey, uiStorageKey]);

  useEffect(() => {
    if (!details || !slug) return;
    if (details.attempt.status === AttemptStatus._0) return;
    const practiceId = details.attempt.practiceTestId;
    const examId = details.attempt.examTestId;
    if (kind === TEST_KIND.PRACTICE && practiceId) {
      router.replace(studentPracticeResultPath(slug, practiceId, attemptId));
    } else if (kind === TEST_KIND.EXAM && examId) {
      router.replace(studentExamResultPath(slug, examId, attemptId));
    }
  }, [details, slug, kind, attemptId, router]);

  useEffect(() => {
    if (!details || kind !== TEST_KIND.EXAM || examCountdownStarted.current) return;
    if (details.attempt.status !== AttemptStatus._0) return;
    const att = details.attempt as AttemptWithTimer;
    if (typeof att.timeRemainingSeconds !== 'number') return;
    examCountdownStarted.current = true;
    const id = window.setInterval(() => {
      setTimerSec((s) => {
        if (s === null || s <= 0) return 0;
        return s - 1;
      });
    }, 1000);
    return () => {
      window.clearInterval(id);
      examCountdownStarted.current = false;
    };
  }, [kind, details]);

  const finalizeSubmit = useCallback(async () => {
    if (typeof businessId !== 'number' || !details) return;
    if (submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    try {
      const payload = buildSubmitPayload(details.questions, answers);
      if (kind === TEST_KIND.PRACTICE) {
        await PracticeTestsService.postApiBusinessPracticeTestsAttemptsSubmit(businessId, attemptId, {
          answers: payload,
        });
      } else {
        await ExamTestsService.postApiBusinessExamTestsAttemptsSubmit(businessId, attemptId, {
          answers: payload,
        });
      }
      toast.success('Test submitted');
      const tid =
        kind === TEST_KIND.PRACTICE ? details.attempt.practiceTestId : details.attempt.examTestId;
      if (!tid) {
        toast.error('Missing test id');
        return;
      }
      removeLocalStorageKeys([draftStorageKey, uiStorageKey]);
      if (kind === TEST_KIND.PRACTICE) {
        router.push(studentPracticeResultPath(slug, tid, attemptId));
      } else {
        router.push(studentExamResultPath(slug, tid, attemptId));
      }
    } catch (e: unknown) {
      const msg = getApiErrorDetailMessage(e, 'Failed to submit');
      toast.error(msg);
    } finally {
      submitLock.current = false;
      setSubmitting(false);
      setSubmitOpen(false);
    }
  }, [businessId, details, answers, kind, attemptId, slug, router, draftStorageKey, uiStorageKey]);

  const finalizeSubmitRef = useRef(finalizeSubmit);
  finalizeSubmitRef.current = finalizeSubmit;

  useEffect(() => {
    if (
      kind !== TEST_KIND.EXAM ||
      timerSec !== 0 ||
      submitting ||
      didAutoSubmit.current ||
      !details ||
      details.attempt.status !== AttemptStatus._0
    )
      return;
    didAutoSubmit.current = true;
    void finalizeSubmitRef.current();
  }, [kind, timerSec, submitting, details]);

  const unanswered = useMemo(() => {
    if (!details) return 0;
    return countUnanswered(details.questions, answers);
  }, [details, answers]);

  useEffect(() => {
    if (!details) return;
    if (details.attempt.status !== AttemptStatus._0) return;
    const id = window.setTimeout(() => {
      writeJsonToLocalStorage(draftStorageKey, answers);
    }, 300);
    return () => window.clearTimeout(id);
  }, [details, answers, draftStorageKey]);

  useEffect(() => {
    if (!details) return;
    if (details.attempt.status !== AttemptStatus._0) return;
    const id = window.setTimeout(() => {
      writeJsonToLocalStorage(uiStorageKey, {
        markedForReview: [...markedForReview],
        visited: [...visited],
      });
    }, 200);
    return () => window.clearTimeout(id);
  }, [details, markedForReview, visited, uiStorageKey]);

  const rows = useMemo(() => details?.questions ?? [], [details?.questions]);
  const activeRow = rows[activeIndex];
  const testName = details?.test.name ?? 'Test';
  const isExam = kind === TEST_KIND.EXAM;

  const testMeta = details?.test as AttemptTestMeta | undefined;
  const metaLine = useMemo(() => {
    if (!details) return undefined;
    const parts: string[] = [];
    if (testMeta?.batchName) parts.push(testMeta.batchName);
    if (testMeta?.subjectName) parts.push(testMeta.subjectName);
    if (isExam && 'durationMinutes' in details.test) {
      parts.push(`Duration ${formatDurationMinutes(details.test.durationMinutes)}`);
    }
    return parts.length > 0 ? parts.join(' · ') : undefined;
  }, [details, testMeta, isExam]);

  const activeQuestionId = activeRow?.question.id;

  const setAnswerForActive = useCallback(
    (next: AnswerDraft) => {
      if (!activeQuestionId) return;
      setAnswers((prev) => ({ ...prev, [activeQuestionId]: next }));
    },
    [activeQuestionId],
  );

  const clearActiveAnswer = useCallback(() => {
    if (!activeQuestionId) return;
    setAnswers((prev) => ({ ...prev, [activeQuestionId]: {} }));
  }, [activeQuestionId]);

  const toggleActiveMarkForReview = useCallback(() => {
    if (!activeQuestionId) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(activeQuestionId)) next.delete(activeQuestionId);
      else next.add(activeQuestionId);
      return next;
    });
  }, [activeQuestionId]);

  const goPrev = useCallback(() => setActiveIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => setActiveIndex((i) => Math.min(rows.length - 1, i + 1)), [rows.length]);
  const onSelectIndex = useCallback((i: number) => setActiveIndex(i), []);

  useEffect(() => {
    if (!details) return;
    if (details.attempt.status !== AttemptStatus._0) return;
    const qid = rows[activeIndex]?.question.id;
    if (!qid) return;
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(qid);
      return next;
    });
  }, [details, rows, activeIndex]);

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated || typeof businessId !== 'number') return null;

  if (!details || !activeRow) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-600 text-sm">
        No questions in this attempt.
      </div>
    );
  }

  const activeAnswer = activeQuestionId ? answers[activeQuestionId] : undefined;
  const activeHasAnswer = isQuestionAnswered(activeRow.question.type, activeAnswer);
  const activeIsMarkedForReview = !!activeQuestionId && markedForReview.has(activeQuestionId);
  const answeredCount = rows.length - unanswered;

  const timerSlot =
    isExam && timerSec !== null ? (
      <div
        className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-mono font-semibold tabular-nums ${
          timerSec < 300
            ? 'border-red-200 bg-red-50 text-red-900'
            : 'border-slate-200 bg-white text-slate-800 shadow-sm'
        }`}
        aria-live="polite"
      >
        {formatClock(timerSec)} left
      </div>
    ) : null;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full min-w-0 gap-6 lg:gap-8">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm">
        <AttemptHeader
          backHref={studentTestBasePath(slug)}
          kindLabel={isExam ? 'Exam' : 'Practice'}
          testName={testName}
          metaLine={metaLine}
          timerSlot={timerSlot}
          answeredCount={answeredCount}
          totalQuestions={rows.length}
          onSubmit={() => setSubmitOpen(true)}
          submitDisabled={submitting}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 lg:gap-8 items-start lg:pb-4 min-h-0">
        <div className="flex flex-col gap-5 min-w-0 order-2 lg:order-1 min-h-0 overflow-hidden">
          <StudentQuestionBlock
            displayIndex={activeIndex + 1}
            totalQuestions={rows.length}
            question={activeRow.question}
            value={activeAnswer}
            onChange={setAnswerForActive}
          />

          <AttemptActionBar
            canGoPrev={activeIndex > 0}
            canGoNext={activeIndex < rows.length - 1}
            hasAnswer={activeHasAnswer}
            onPrev={goPrev}
            onNext={goNext}
            onClearAnswer={clearActiveAnswer}
            onToggleMarkForReview={toggleActiveMarkForReview}
            markedForReview={activeIsMarkedForReview}
          />
        </div>

        <div className="order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start min-h-0">
          <AttemptQuestionNavigator
            rows={rows}
            activeIndex={activeIndex}
            answers={answers}
            visited={visited}
            markedForReview={markedForReview}
            onSelectIndex={onSelectIndex}
          />
        </div>
      </div>

      <StudentSubmitTestModal
        isOpen={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onConfirm={finalizeSubmit}
        unansweredCount={unanswered}
        loading={submitting}
      />
    </div>
  );
}
