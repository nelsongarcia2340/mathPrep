import { Link } from 'react-router-dom';
import { getQuestionById } from '../data/questions';
import { getTopicById } from '../data/topics';
import { useProgressStore } from '../store/progressStore';
import { MathText } from '../utils/math';

export function MistakeJournalPage() {
  const mistakes = useProgressStore((state) => state.mistakeJournal);

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-wide text-coral-500">
        Mistake Journal
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-normal text-ink">
        Review what tripped you up
      </h1>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {mistakes.length === 0 ? (
          <p className="text-slate-600">
            Missed questions will appear here once practice mode is connected.
          </p>
        ) : (
          <div className="space-y-4">
            {mistakes.map((mistake) => {
              const question = getQuestionById(mistake.questionId);
              const topic = getTopicById(mistake.topicId);

              return (
                <article
                  key={mistake.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-coral-500">
                    {topic?.title ?? 'Practice'}
                  </p>
                  <p className="mt-2 font-semibold leading-7 text-ink">
                    {question ? <MathText value={question.prompt} /> : 'Question unavailable'}
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p>
                      Your answer: <span className="font-bold">{mistake.selectedAnswer}</span>
                    </p>
                    <p>
                      Correct answer:{' '}
                      <span className="font-bold">
                        <MathText value={mistake.correctAnswer} />
                      </span>
                    </p>
                  </div>
                  <Link
                    to={`/practice/${mistake.topicId}`}
                    className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-bold text-lagoon-600 ring-1 ring-lagoon-100 transition hover:bg-lagoon-50"
                  >
                    Review again
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
