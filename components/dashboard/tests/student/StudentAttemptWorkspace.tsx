'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
import { formatDurationMinutes } from '@/lib/tests/testUiMappers';
import { AttemptHeader } from '@/components/dashboard/tests/student/AttemptHeader';
import { AttemptQuestionNavigator } from '@/components/dashboard/tests/student/AttemptQuestionNavigator';
import { AttemptActionBar } from '@/components/dashboard/tests/student/AttemptActionBar';
import { StudentQuestionBlock } from '@/components/dashboard/tests/student/StudentQuestionBlock';

export type StudentAttemptKind = 'practice' | 'exam';

type AttemptDetails = PracticeTestAttemptDetails | ExamTestAttemptDetails;

type AttemptWithTimer = AttemptDetails['attempt'] & { timeRemainingSeconds?: number };

export function StudentAttemptWorkspace({
  kind,
  attemptId,
}: {
  kind: StudentAttemptKind;
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
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>({});
  const [flagged, setFlagged] = useState<Set<string>>(() => new Set());
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

  const load = useCallback(async () => {
    if (typeof businessId !== 'number') return;
    setLoading(true);
    setError(null);
    didAutoSubmit.current = false;
    examCountdownStarted.current = false;
    try {
      const res =
        kind === 'practice'
          ? await PracticeTestsService.getApiBusinessPracticeTestsAttempts(businessId, attemptId)
          : await ExamTestsService.getApiBusinessExamTestsAttempts(businessId, attemptId);
      const data = res.data;
      if (!data) {
        setError('Could not load attempt');
        return;
      }
      // console.log('Loaded attempt details', data);
      setDetails(data);
      const inProgress = data.attempt.status === AttemptStatus._0;

      const serverAnswers = initAnswersFromAttemptQuestions(data.questions);
      if (!inProgress) {
        // Avoid any draft interference for already-finished attempts.
        try {
          window.localStorage.removeItem(draftStorageKey);
          window.localStorage.removeItem(uiStorageKey);
        } catch {
          // ignore storage failures
        }
        setAnswers(serverAnswers);
      } else {
        let localDraft: Record<string, AnswerDraft> | null = null;
        try {
          const raw = window.localStorage.getItem(draftStorageKey);
          if (raw) {
            const parsed = JSON.parse(raw) as unknown;
            if (parsed && typeof parsed === 'object') {
              localDraft = parsed as Record<string, AnswerDraft>;
            }
          }
        } catch {
          // ignore storage failures
        }

        // Local draft overrides server answers for the same question IDs.
        setAnswers({ ...serverAnswers, ...(localDraft ?? {}) });

        try {
          const rawUi = window.localStorage.getItem(uiStorageKey);
          if (rawUi) {
            const parsed = JSON.parse(rawUi) as unknown;
            if (parsed && typeof parsed === 'object') {
              const obj = parsed as {
                flagged?: string[];
                markedForReview?: string[];
                visited?: string[];
              };
              setFlagged(new Set(obj.flagged ?? []));
              setMarkedForReview(new Set(obj.markedForReview ?? []));
              setVisited(new Set(obj.visited ?? []));
            }
          }
        } catch {
          // ignore storage failures
        }
      }
      const att = data.attempt as AttemptWithTimer;
      if (kind === 'exam' && typeof att.timeRemainingSeconds === 'number') {
        setTimerSec(Math.max(0, att.timeRemainingSeconds));
      } else {
        setTimerSec(null);
      }
    } catch (e: unknown) {
      const msg = getApiErrorDetailMessage(e, 'Failed to load attempt');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [businessId, kind, attemptId, draftStorageKey]);

  useEffect(() => {
    if (isInitialized && isAuthenticated && typeof businessId === 'number') {
      void load();
    }
  }, [isInitialized, isAuthenticated, businessId, load]);

  useEffect(() => {
    if (!details || !slug) return;
    if (details.attempt.status === AttemptStatus._0) return;
    const practiceId = details.attempt.practiceTestId;
    const examId = details.attempt.examTestId;
    if (kind === 'practice' && practiceId) {
      router.replace(studentPracticeResultPath(slug, practiceId, attemptId));
    } else if (kind === 'exam' && examId) {
      router.replace(studentExamResultPath(slug, examId, attemptId));
    }
  }, [details, slug, kind, attemptId, router]);

  useEffect(() => {
    if (!details || kind !== 'exam' || examCountdownStarted.current) return;
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
      if (kind === 'practice') {
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
        kind === 'practice' ? details.attempt.practiceTestId : details.attempt.examTestId;
      if (!tid) {
        toast.error('Missing test id');
        return;
      }
      try {
        // Clear draft right before navigating to results.
        window.localStorage.removeItem(draftStorageKey);
      } catch {
        // ignore storage failures
      }
      if (kind === 'practice') {
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
  }, [businessId, details, answers, kind, attemptId, slug, router, draftStorageKey]);

  const finalizeSubmitRef = useRef(finalizeSubmit);
  finalizeSubmitRef.current = finalizeSubmit;

  useEffect(() => {
    if (
      kind !== 'exam' ||
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

  // Persist answers draft while the attempt is in progress.
  useEffect(() => {
    if (!details) return;
    if (details.attempt.status !== AttemptStatus._0) return;
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(answers));
      } catch {
        // ignore storage failures
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [details, answers, draftStorageKey]);

  // Persist navigator/ui state while in progress.
  useEffect(() => {
    if (!details) return;
    if (details.attempt.status !== AttemptStatus._0) return;
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          uiStorageKey,
          JSON.stringify({
            flagged: [...flagged],
            markedForReview: [...markedForReview],
            visited: [...visited],
          }),
        );
      } catch {
        // ignore storage failures
      }
    }, 200);
    return () => window.clearTimeout(id);
  }, [details, flagged, markedForReview, visited, uiStorageKey]);

  const rows = details?.questions ?? [];
  const activeRow = rows[activeIndex];
  const testName = details?.test.name ?? 'Test';
  const isExam = kind === 'exam';

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

  const toggleActiveFlag = useCallback(() => {
    if (!activeQuestionId) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(activeQuestionId)) next.delete(activeQuestionId);
      else next.add(activeQuestionId);
      return next;
    });
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

  // Mark visited when navigating (in-progress only).
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

  if (!details || !activeRow) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-600 text-sm">
        No questions in this attempt.
      </div>
    );
  }

  const activeAnswer = activeQuestionId ? answers[activeQuestionId] : undefined;
  const activeHasAnswer = isQuestionAnswered(activeRow.question.type, activeAnswer);
  const activeIsFlagged = !!activeQuestionId && flagged.has(activeQuestionId);
  const activeIsMarkedForReview = !!activeQuestionId && markedForReview.has(activeQuestionId);

  return (
    <div className="space-y-4">
      <AttemptHeader
        backHref={studentTestBasePath(slug)}
        kindLabel={isExam ? 'Exam' : 'Practice'}
        testName={testName}
        subtitle={isExam && 'durationMinutes' in details.test ? `Duration ${formatDurationMinutes(details.test.durationMinutes)}` : undefined}
        rightSlot={
          isExam && timerSec !== null ? (
            <div
              className={`text-sm font-mono font-semibold px-3 py-1 rounded-lg border ${
                timerSec < 300 ? 'border-red-200 bg-red-50 text-red-900' : 'border-gray-200 bg-white'
              }`}
              aria-live="polite"
            >
              Time left: {formatClock(timerSec)}
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Answered{' '}
              <span className="font-semibold text-gray-900">
                {rows.length - unanswered}/{rows.length}
              </span>
            </div>
          )
        }
        onSubmit={() => setSubmitOpen(true)}
        submitDisabled={submitting}
      />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="space-y-3">
            <StudentQuestionBlock
              displayIndex={activeIndex + 1}
              question={activeRow.question}
              value={activeAnswer}
              flagged={activeIsFlagged}
              onChange={setAnswerForActive}
              onClearAnswer={clearActiveAnswer}
              onToggleFlag={toggleActiveFlag}
            />
          </div>

          <AttemptActionBar
            canGoPrev={activeIndex > 0}
            canGoNext={activeIndex < rows.length - 1}
            hasAnswer={activeHasAnswer}
            flagged={activeIsFlagged}
            onPrev={goPrev}
            onNext={goNext}
            onClearAnswer={clearActiveAnswer}
            onToggleFlag={toggleActiveFlag}
            markedForReview={activeIsMarkedForReview}
            onToggleMarkForReview={toggleActiveMarkForReview}
          />
        </div>

        <AttemptQuestionNavigator
          rows={rows}
          activeIndex={activeIndex}
          answers={answers}
          visited={visited}
          flagged={flagged}
          markedForReview={markedForReview}
          onSelectIndex={onSelectIndex}
        />
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
