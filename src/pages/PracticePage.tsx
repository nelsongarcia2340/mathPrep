import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { questions } from '../data/questions';
import { topics } from '../data/topics';
import { useProgressStore } from '../store/progressStore';
import type { Question } from '../types';
import { isAnswerCorrect, stringifyCorrectAnswer } from '../utils/answers';
import { MathText } from '../utils/math';

const getTopicQuestions = (topicId: string): Question[] =>
  questions.filter((question) => question.topicId === topicId);

export function PracticePage() {
  const { topicId } = useParams();
  const {
    profile,
    topicProgress,
    recordPracticeAttempt,
    mistakeJournal,
  } = useProgressStore();
  const [currentQuestionId, setCurrentQuestionId] = useState<string | undefined>();
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);

  const topic =
    topics.find((item) => item.id === topicId) ??
    topics.find((item) => item.subject === profile?.course) ??
    topics[0];
  const progress = topicProgress[topic.id];

  const topicQuestions = useMemo(() => getTopicQuestions(topic.id), [topic.id]);

  const availableQuestions = useMemo(() => {
    const matchingDifficulty = topicQuestions.filter(
      (question) => question.difficulty === progress?.currentDifficulty,
    );

    return matchingDifficulty.length > 0 ? matchingDifficulty : topicQuestions;
  }, [progress?.currentDifficulty, topicQuestions]);

  const currentQuestion =
    topicQuestions.find((question) => question.id === currentQuestionId) ??
    availableQuestions[0];

  const submittedCorrect = currentQuestion
    ? isAnswerCorrect(currentQuestion, submittedAnswer)
    : false;

  if (!profile?.diagnosticCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  const resetForQuestion = (nextQuestionId: string) => {
    setCurrentQuestionId(nextQuestionId);
    setSelectedAnswer('');
    setSubmittedAnswer('');
    setIsSubmitted(false);
    setIsSolutionOpen(false);
  };

  const submitAnswer = () => {
    if (!currentQuestion || !selectedAnswer.trim()) {
      return;
    }

    const trimmedAnswer = selectedAnswer.trim();
    const isCorrect = isAnswerCorrect(currentQuestion, trimmedAnswer);

    recordPracticeAttempt({
      question: currentQuestion,
      selectedAnswer: trimmedAnswer,
      isCorrect,
    });
    setSubmittedAnswer(trimmedAnswer);
    setIsSubmitted(true);
    setIsSolutionOpen(false);
  };

  const goToNextQuestion = () => {
    if (availableQuestions.length === 0) {
      return;
    }

    const currentIndex = availableQuestions.findIndex(
      (question) => question.id === currentQuestion?.id,
    );
    const nextIndex = (currentIndex + 1) % availableQuestions.length;
    resetForQuestion(availableQuestions[nextIndex].id);
  };

  if (!currentQuestion) {
    return (
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-coral-500">
          Practice
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-normal text-ink">
          Choose a topic
        </h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {topics.map((item) => (
            <Link
              key={item.id}
              to={`/practice/${item.id}`}
              className="rounded-lg border border-slate-200 bg-white p-4 font-bold text-ink shadow-sm transition hover:border-lagoon-100 hover:bg-lagoon-50"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-coral-500">
            Practice
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-ink">
            {topic.title}
          </h1>
          <p className="mt-2 text-slate-600">
            Current difficulty: {progress?.currentDifficulty ?? 'easy'} · Mastery:{' '}
            {progress?.mastery ?? 0}%
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          Dashboard
        </Link>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_18rem]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
              {currentQuestion.choices.map((choice) => {
                const isSelected = selectedAnswer === choice;
                const isCorrectChoice = choice === currentQuestion.correctAnswer;
                const wasSubmittedChoice = submittedAnswer === choice;
                const feedbackClass =
                  isSubmitted && isCorrectChoice
                    ? 'border-lagoon-500 bg-lagoon-50 text-lagoon-600'
                    : isSubmitted && wasSubmittedChoice && !submittedCorrect
                      ? 'border-coral-500 bg-coral-50 text-coral-500'
                      : isSelected
                        ? 'border-lagoon-500 bg-white text-ink'
                        : 'border-slate-200 bg-white text-ink';

                return (
                  <button
                    key={choice}
                    className={`min-h-14 rounded-lg border px-4 py-3 text-left text-sm font-bold transition ${feedbackClass}`}
                    disabled={isSubmitted}
                    type="button"
                    onClick={() => setSelectedAnswer(choice)}
                  >
                    <MathText value={choice} />
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              type="number"
              value={selectedAnswer}
              disabled={isSubmitted}
              onChange={(event) => setSelectedAnswer(event.target.value)}
              className="mt-6 w-full rounded-lg border border-slate-200 px-3 py-3 text-base outline-none ring-lagoon-500 focus:ring-2 disabled:bg-slate-50"
              placeholder="Enter your answer"
            />
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {!isSubmitted ? (
              <Button disabled={!selectedAnswer.trim()} onClick={submitAnswer}>
                Submit answer
              </Button>
            ) : (
              <Button onClick={goToNextQuestion}>Next question</Button>
            )}
            {isSubmitted ? (
              <Button
                variant="secondary"
                onClick={() => setIsSolutionOpen((current) => !current)}
              >
                {isSolutionOpen ? 'Hide steps' : 'Show step-by-step solution'}
              </Button>
            ) : null}
          </div>

          {isSubmitted ? (
            <div
              className={`mt-6 rounded-lg border p-4 ${
                submittedCorrect
                  ? 'border-lagoon-100 bg-lagoon-50 text-lagoon-600'
                  : 'border-coral-100 bg-coral-50 text-coral-500'
              }`}
            >
              <p className="font-black">
                {submittedCorrect ? 'Correct' : 'Not quite'}
              </p>
              <p className="mt-2 text-sm leading-6">
                <MathText
                  value={
                    submittedCorrect
                      ? currentQuestion.explanation
                      : `Correct answer: ${stringifyCorrectAnswer(currentQuestion)}. ${currentQuestion.explanation}`
                  }
                />
              </p>
            </div>
          ) : null}

          {isSubmitted && isSolutionOpen ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">
                Step-by-step solution
              </h2>
              <ol className="mt-3 space-y-3">
                {currentQuestion.solutionSteps.map((step, index) => (
                  <li key={`${step.title}-${index}`} className="rounded-lg bg-white p-3">
                    <p className="text-sm font-bold text-ink">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      <MathText value={step.detail} />
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">
              Topic progress
            </h2>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-lagoon-500"
                style={{ width: `${progress?.mastery ?? 0}%` }}
              />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">Correct</dt>
                <dd className="mt-1 text-xl font-black text-ink">
                  {progress?.correct ?? 0}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Attempted</dt>
                <dd className="mt-1 text-xl font-black text-ink">
                  {progress?.attempted ?? 0}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">
              Practice another topic
            </h2>
            <div className="mt-3 space-y-2">
              {topics.map((item) => (
                <Link
                  key={item.id}
                  to={`/practice/${item.id}`}
                  className={`block rounded-lg px-3 py-2 text-sm font-bold transition ${
                    item.id === topic.id
                      ? 'bg-lagoon-100 text-lagoon-600'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  onClick={() => {
                    if (item.id !== topic.id) {
                      resetForQuestion('');
                    }
                  }}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">
              Mistakes saved
            </h2>
            <p className="mt-2 text-3xl font-black text-ink">{mistakeJournal.length}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
