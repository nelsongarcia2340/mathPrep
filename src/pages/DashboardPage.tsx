import { Link, Navigate } from 'react-router-dom';
import { TopicCard } from '../components/TopicCard';
import { topics } from '../data/topics';
import { useProgressStore } from '../store/progressStore';
import { getLevelProgress } from '../utils/scoring';

export function DashboardPage() {
  const { profile, topicProgress, xp, level, dailyStreak } = useProgressStore();

  if (!profile?.diagnosticCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  const recommendedTopic =
    topics.find((topic) => topic.subject === profile.course) ?? topics[0];

  return (
    <div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-coral-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-slate-600">
            {profile.course} · {profile.gradeLevel} grade
          </p>
        </div>
        <Link
          to={`/practice/${recommendedTopic.id}`}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-lagoon-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-lagoon-500"
        >
          Start practice
        </Link>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-500">XP</p>
          <p className="mt-2 text-3xl font-black text-ink">{xp}</p>
        </article>
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-500">Level</p>
          <p className="mt-2 text-3xl font-black text-ink">{level}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-coral-500"
              style={{ width: `${getLevelProgress(xp)}%` }}
            />
          </div>
        </article>
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-500">Daily streak</p>
          <p className="mt-2 text-3xl font-black text-ink">{dailyStreak} day</p>
        </article>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-black tracking-normal text-ink">Topics</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              progress={topicProgress[topic.id]}
              showPracticeLink
            />
          ))}
        </div>
      </section>
    </div>
  );
}
