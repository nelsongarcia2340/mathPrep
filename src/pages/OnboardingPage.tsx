import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { diagnosticQuestions } from '../data/questions';
import { topics } from '../data/topics';
import { useProgressStore } from '../store/progressStore';
import type { Course, DiagnosticResult, GradeLevel } from '../types';
import { estimateDifficultyFromScore } from '../utils/adaptive';
import { MathText } from '../utils/math';

const gradeLevels: GradeLevel[] = ['9th', '10th', '11th', '12th'];
const courses: Course[] = [
  'Algebra I',
  'Algebra II',
  'Geometry',
  'Trig',
  'Precalc',
  'Stats',
  'AP Calc',
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const completeOnboarding = useProgressStore((state) => state.completeOnboarding);
  const [step, setStep] = useState<'welcome' | 'diagnostic' | 'results'>('welcome');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('10th');
  const [course, setCourse] = useState<Course>('Algebra II');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const answeredCount = Object.keys(answers).length;

  const diagnosticResults = useMemo<DiagnosticResult[]>(() => {
    const byTopic = topics.map((topic) => {
      const topicQuestions = diagnosticQuestions.filter(
        (question) => question.topicId === topic.id,
      );
      const correct = topicQuestions.filter((question) => {
        const answer = answers[question.id];
        return String(question.correctAnswer) === answer;
      }).length;
      const score = topicQuestions.length ? correct / topicQuestions.length : 0;

      return {
        topicId: topic.id,
        score,
        recommendedDifficulty: estimateDifficultyFromScore(score),
      };
    });

    return byTopic;
  }, [answers]);

  const finishOnboarding = () => {
    completeOnboarding({ gradeLevel, course, diagnosticResults });
    navigate('/');
  };

  if (step === 'welcome') {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <section>
            <p className="text-sm font-bold uppercase tracking-wide text-coral-500">
              Welcome to MathPrep
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight tracking-normal text-ink sm:text-5xl">
              A calmer way to get stronger at high school math.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Start with your course and a short diagnostic. MathPrep will estimate
              your starting level by topic and prepare adaptive practice from there.
            </p>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <label className="text-sm font-bold text-slate-700" htmlFor="grade">
              Grade level
            </label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {gradeLevels.map((grade) => (
                <Button
                  key={grade}
                  variant={grade === gradeLevel ? 'primary' : 'secondary'}
                  onClick={() => setGradeLevel(grade)}
                >
                  {grade}
                </Button>
              ))}
            </div>

            <label className="mt-6 block text-sm font-bold text-slate-700" htmlFor="course">
              Current course
            </label>
            <select
              id="course"
              value={course}
              onChange={(event) => setCourse(event.target.value as Course)}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none ring-lagoon-500 focus:ring-2"
            >
              {courses.map((courseOption) => (
                <option key={courseOption} value={courseOption}>
                  {courseOption}
                </option>
              ))}
            </select>

            <Button className="mt-6 w-full" onClick={() => setStep('diagnostic')}>
              Start diagnostic
            </Button>
          </section>
        </div>
      </div>
    );
  }

  if (step === 'diagnostic') {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-coral-500">
            Diagnostic
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-ink">
            Answer a few quick questions
          </h1>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-lagoon-500 transition-all"
              style={{ width: `${(answeredCount / diagnosticQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {diagnosticQuestions.map((question, index) => (
            <article
              key={question.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-bold text-slate-400">Question {index + 1}</p>
              <p className="mt-2 text-lg font-semibold leading-8 text-ink">
                <MathText value={question.prompt} />
              </p>

              {question.type === 'multiple-choice' ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {question.choices.map((choice) => (
                    <Button
                      key={choice}
                      variant={answers[question.id] === choice ? 'primary' : 'secondary'}
                      className="justify-start"
                      onClick={() =>
                        setAnswers((current) => ({ ...current, [question.id]: choice }))
                      }
                    >
                      <MathText value={choice} />
                    </Button>
                  ))}
                </div>
              ) : (
                <input
                  type="number"
                  value={answers[question.id] ?? ''}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                  className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-3 text-base outline-none ring-lagoon-500 focus:ring-2"
                  placeholder="Enter your answer"
                />
              )}
            </article>
          ))}
        </div>

        <div className="sticky bottom-20 mt-6 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-soft backdrop-blur md:bottom-4">
          <Button
            className="w-full"
            disabled={answeredCount < diagnosticQuestions.length}
            onClick={() => setStep('results')}
          >
            See starting level
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-sm font-bold uppercase tracking-wide text-coral-500">
        Starting plan
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-normal text-ink">
        You are ready to begin
      </h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {diagnosticResults.map((result) => {
          const topic = topics.find((item) => item.id === result.topicId);

          if (!topic) {
            return null;
          }

          return (
            <article
              key={result.topicId}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {topic.subject}
              </p>
              <h2 className="mt-1 text-lg font-bold text-ink">{topic.title}</h2>
              <p className="mt-3 text-sm text-slate-600">
                Diagnostic score: {Math.round(result.score * 100)}%
              </p>
              <p className="mt-1 text-sm font-semibold text-lagoon-600">
                Start at {result.recommendedDifficulty}
              </p>
            </article>
          );
        })}
      </div>
      <Button className="mt-6 w-full sm:w-auto" onClick={finishOnboarding}>
        Go to dashboard
      </Button>
    </div>
  );
}
