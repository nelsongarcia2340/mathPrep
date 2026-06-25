import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { questions } from '../data/questions';
import { topics } from '../data/topics';
import { useProgressStore } from '../store/progressStore';
import type { Question, Topic } from '../types';
import { isAnswerCorrect, stringifyCorrectAnswer } from '../utils/answers';
import { MathText } from '../utils/math';

type TestMode = 'mixed' | string;
type TestStatus = 'setup' | 'active' | 'results';

interface TimedAnswer {
  answer: string;
  isCorrect: boolean;
  elapsedSeconds: number;
}

const DEFAULT_TEST_SECONDS = 12 * 60;
const TEST_QUESTION_COUNT = 10;

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const getQuestionPool = (
  mode: TestMode,
  attemptedTopicIds: string[],
  fallbackTopicId: string,
): Question[] => {
  if (mode === 'mixed') {
    const mixedTopicIds =
      attemptedTopicIds.length > 0 ? attemptedTopicIds : [fallbackTopicId];
    return questions.filter((question) => mixedTopicIds.includes(question.topicId));
  }

  return questions.filter((question) => question.topicId === mode);
};

const buildQuestionSet = (pool: Question[]): Question[] =>
  pool.slice(0, Math.min(TEST_QUESTION_COUNT, pool.length));

const getTopicLabel = (topicId: string): string =>
  topics.find((topic) => topic.id === topicId)?.title ?? 'Math';

export function TimedTestPage() {
  const [searchParams] = useSearchParams();
  const { profile, topicProgress, recordPracticeAttempt } = useProgressStore();
  const [mode, setMode] = useState<TestMode>('mixed');
  const [status, setStatus] = useState<TestStatus>('setup');
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<number, TimedAnswer>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_TEST_SECONDS);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [finishReason, setFinishReason] = useState<'completed' | 'time'>('completed');

  const recommendedTopic =
    topics.find((topic) => topic.subject === profile?.course) ?? topics[0];

  const attemptedTopicIds = useMemo(
    () =>
      Object.values(topicProgress)
        .filter((progress) => progress.attempted > 0)
        .map((progress) => progress.topicId),
    [topicProgress],
  );

  const availableTopics = useMemo<Topic[]>(
    () =>
      topics.filter((topic) =>
        questions.some((question) => question.topicId === topic.id),
      ),
    [],
  );

  const testDurationSeconds = useMemo(() => {
    const requestedDuration = Number(searchParams.get('durationSeconds'));

    if (import.meta.env.DEV && Number.isFinite(requestedDuration)) {
      return Math.max(3, Math.min(DEFAULT_TEST_SECONDS, Math.round(requestedDuration)));
    }

    return DEFAULT_TEST_SECONDS;
  }, [searchParams]);

  const currentQuestion = testQuestions[currentIndex];

  const resultRows = useMemo(
    () =>
      testQuestions.map((question, index) => {
        const answer = answers[index];
        const selected = answer?.answer ?? 'Unanswered';

        return {
          question,
          index,
          selected,
          isCorrect: answer?.isCorrect ?? false,
          elapsedSeconds: answer?.elapsedSeconds ?? 0,
        };
      }),
    [answers, testQuestions],
  );

  const correctCount = resultRows.filter((row) => row.isCorrect).length;
  const totalElapsedSeconds =
    startedAt && finishedAt
      ? Math.max(0, Math.round((finishedAt - startedAt) / 1000))
      : testDurationSeconds - remainingSeconds;

  const finishTest = useCallback(
    (reason: 'completed' | 'time') => {
      setStatus((currentStatus) => {
        if (currentStatus !== 'active') {
          return currentStatus;
        }

        const now = Date.now();

        setAnswers((currentAnswers) => {
          const completedAnswers = { ...currentAnswers };

          testQuestions.forEach((question, index) => {
            if (completedAnswers[index]) {
              return;
            }

            const isCurrentQuestion = index === currentIndex;
            const finalAnswer =
              isCurrentQuestion && selectedAnswer.trim()
                ? selectedAnswer.trim()
                : 'Unanswered';
            const isCorrect =
              finalAnswer === 'Unanswered' ? false : isAnswerCorrect(question, finalAnswer);

            completedAnswers[index] = {
              answer: finalAnswer,
              isCorrect,
              elapsedSeconds:
                isCurrentQuestion && questionStartedAt
                  ? Math.max(0, Math.round((now - questionStartedAt) / 1000))
                  : 0,
            };

            recordPracticeAttempt({
              question,
              selectedAnswer: finalAnswer,
              isCorrect,
            });
          });

          return completedAnswers;
        });

        setFinishedAt(now);
        setFinishReason(reason);
        setSelectedAnswer('');
        return 'results';
      });
    },
    [
      currentIndex,
      questionStartedAt,
      recordPracticeAttempt,
      selectedAnswer,
      testQuestions,
    ],
  );

  useEffect(() => {
    if (status !== 'active') {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        const next = Math.max(0, current - 1);

        if (next === 0) {
          window.setTimeout(() => finishTest('time'), 0);
        }

        return next;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [finishTest, remainingSeconds, status]);

  if (!profile?.diagnosticCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  const selectedPool = getQuestionPool(mode, attemptedTopicIds, recommendedTopic.id);
  const selectedQuestionCount = Math.min(TEST_QUESTION_COUNT, selectedPool.length);

  const startTest = () => {
    const nextQuestions = buildQuestionSet(selectedPool);
    const now = Date.now();

    if (nextQuestions.length === 0) {
      return;
    }

    setTestQuestions(nextQuestions);
    setCurrentIndex(0);
    setSelectedAnswer('');
    setAnswers({});
    setRemainingSeconds(testDurationSeconds);
    setStartedAt(now);
    setQuestionStartedAt(now);
    setFinishedAt(null);
    setFinishReason('completed');
    setStatus('active');
  };

  const submitCurrentAnswer = () => {
    if (!currentQuestion || !selectedAnswer.trim()) {
      return;
    }

    const now = Date.now();
    const trimmedAnswer = selectedAnswer.trim();
    const isCorrect = isAnswerCorrect(currentQuestion, trimmedAnswer);
    const elapsedSeconds = questionStartedAt
      ? Math.max(0, Math.round((now - questionStartedAt) / 1000))
      : 0;

    recordPracticeAttempt({
      question: currentQuestion,
      selectedAnswer: trimmedAnswer,
      isCorrect,
    });

    setAnswers((current) => ({
      ...current,
      [currentIndex]: {
        answer: trimmedAnswer,
        isCorrect,
        elapsedSeconds,
      },
    }));

    if (currentIndex >= testQuestions.length - 1) {
      setFinishedAt(now);
      setFinishReason('completed');
      setSelectedAnswer('');
      setStatus('results');
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedAnswer('');
    setQuestionStartedAt(now);
  };

  if (status === 'setup') {
    return (
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-coral-500">
              Timed Test
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-ink">
              SAT/ACT-style section
            </h1>
            <p className="mt-2 max-w-2xl leading-7 text-slate-600">
              Pick one topic or mix questions from topics you have already tried.
              Answers lock in as soon as you submit.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </header>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-black text-ink">Choose your section</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              className={`rounded-lg border p-4 text-left transition ${
                mode === 'mixed'
                  ? 'border-lagoon-500 bg-lagoon-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
              type="button"
              onClick={() => setMode('mixed')}
            >
              <p className="font-black text-ink">Mixed practice</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Pulls from attempted topics, or your current course if none are
                attempted yet.
              </p>
            </button>
            {availableTopics.map((topic) => (
              <button
                key={topic.id}
                className={`rounded-lg border p-4 text-left transition ${
                  mode === topic.id
                    ? 'border-lagoon-500 bg-lagoon-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
                type="button"
                onClick={() => setMode(topic.id)}
              >
                <p className="font-black text-ink">{topic.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {topic.subject} ·{' '}
                  {questions.filter((question) => question.topicId === topic.id).length}{' '}
                  available
                </p>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-lg bg-slate-50 p-4">
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="font-semibold text-slate-500">Questions</dt>
                <dd className="mt-1 text-xl font-black text-ink">
                  {selectedQuestionCount}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Timer</dt>
                <dd className="mt-1 text-xl font-black text-ink">
                  {formatTime(testDurationSeconds)}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Mode</dt>
                <dd className="mt-1 text-xl font-black text-ink">
                  {mode === 'mixed' ? 'Mixed' : getTopicLabel(mode)}
                </dd>
              </div>
            </dl>
          </div>

          <Button
            className="mt-6 w-full sm:w-auto"
            disabled={selectedQuestionCount === 0}
            onClick={startTest}
          >
            Start timed test
          </Button>
        </section>
      </div>
    );
  }

  if (status === 'results') {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-bold uppercase tracking-wide text-coral-500">
          Results
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-normal text-ink">
          {finishReason === 'time' ? 'Time is up' : 'Section complete'}
        </h1>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Score</p>
            <p className="mt-2 text-3xl font-black text-ink">
              {correctCount}/{testQuestions.length}
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Percent</p>
            <p className="mt-2 text-3xl font-black text-ink">
              {testQuestions.length
                ? Math.round((correctCount / testQuestions.length) * 100)
                : 0}
              %
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Time</p>
            <p className="mt-2 text-3xl font-black text-ink">
              {formatTime(totalElapsedSeconds)}
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-black text-ink">Breakdown</h2>
            <Button variant="secondary" onClick={() => setStatus('setup')}>
              Start another test
            </Button>
          </div>
          <div className="mt-5 space-y-4">
            {resultRows.map((row) => (
              <article
                key={`${row.question.id}-${row.index}`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="font-bold leading-7 text-ink">
                    {row.index + 1}. <MathText value={row.question.prompt} />
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                      row.isCorrect
                        ? 'bg-lagoon-100 text-lagoon-600'
                        : 'bg-coral-100 text-coral-500'
                    }`}
                  >
                    {row.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                  <p>
                    Your answer:{' '}
                    <span className="font-bold">
                      <MathText value={row.selected} />
                    </span>
                  </p>
                  <p>
                    Correct answer:{' '}
                    <span className="font-bold">
                      <MathText value={stringifyCorrectAnswer(row.question)} />
                    </span>
                  </p>
                  <p>
                    Time:{' '}
                    <span className="font-bold">
                      {row.elapsedSeconds ? `${row.elapsedSeconds}s` : 'Not answered'}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-coral-500">
            Timed Test
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-ink">
            {mode === 'mixed' ? 'Mixed section' : getTopicLabel(mode)}
          </h1>
          <p className="mt-2 text-slate-600">
            Question {currentIndex + 1} of {testQuestions.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Time left
          </p>
          <p className="mt-1 text-2xl font-black text-ink">
            {formatTime(remainingSeconds)}
          </p>
        </div>
      </header>

      {currentQuestion ? (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-lagoon-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-lagoon-600">
              {currentQuestion.difficulty}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              {currentQuestion.type === 'multiple-choice' ? 'Multiple choice' : 'Numeric'}
            </span>
          </div>

          <p className="mt-6 text-xl font-bold leading-9 text-ink">
            <MathText value={currentQuestion.prompt} />
          </p>

          {currentQuestion.type === 'multiple-choice' ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {currentQuestion.choices.map((choice) => (
                <button
                  key={choice}
                  className={`min-h-14 rounded-lg border px-4 py-3 text-left text-sm font-bold transition ${
                    selectedAnswer === choice
                      ? 'border-lagoon-500 bg-lagoon-50 text-lagoon-600'
                      : 'border-slate-200 bg-white text-ink hover:bg-slate-50'
                  }`}
                  type="button"
                  onClick={() => setSelectedAnswer(choice)}
                >
                  <MathText value={choice} />
                </button>
              ))}
            </div>
          ) : (
            <input
              type="number"
              value={selectedAnswer}
              onChange={(event) => setSelectedAnswer(event.target.value)}
              className="mt-6 w-full rounded-lg border border-slate-200 px-3 py-3 text-base outline-none ring-lagoon-500 focus:ring-2"
              placeholder="Enter your answer"
            />
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button disabled={!selectedAnswer.trim()} onClick={submitCurrentAnswer}>
              {currentIndex >= testQuestions.length - 1
                ? 'Submit section'
                : 'Submit and continue'}
            </Button>
            <Button variant="ghost" onClick={() => finishTest('completed')}>
              End test now
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
