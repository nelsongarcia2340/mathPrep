import { Link, Navigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TopicCard } from '../components/TopicCard';
import { topics } from '../data/topics';
import { useProgressStore } from '../store/progressStore';
import {
  getLevelFromXp,
  getLevelProgress,
  getXpUntilNextLevel,
} from '../utils/scoring';

export function DashboardPage() {
  const { profile, topicProgress, mistakeJournal, xp, dailyStreak } =
    useProgressStore();

  if (!profile?.diagnosticCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  const recommendedTopic =
    topics.find((topic) => topic.subject === profile.course) ?? topics[0];
  const unresolvedMistakes = mistakeJournal.filter((mistake) => !mistake.reviewed);
  const progressValues = Object.values(topicProgress);
  const attemptedTopics = progressValues.filter((progress) => progress.attempted > 0)
    .length;
  const totalAttempts = progressValues.reduce(
    (sum, progress) => sum + progress.attempted,
    0,
  );
  const totalCorrect = progressValues.reduce(
    (sum, progress) => sum + progress.correct,
    0,
  );
  const accuracy = totalAttempts
    ? Math.round((totalCorrect / totalAttempts) * 100)
    : 0;
  const level = getLevelFromXp(xp);
  const masteryData = topics.map((topic) => ({
    topic: topic.title,
    mastery: topicProgress[topic.id]?.mastery ?? 0,
  }));

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
            {profile.course} · {profile.gradeLevel} grade · {attemptedTopics} topics
            started
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to={`/practice/${recommendedTopic.id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-lagoon-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-lagoon-500"
          >
            Start practice
          </Link>
          <Link
            to="/timed-test"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Timed test
          </Link>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-500">XP</p>
          <p className="mt-2 text-3xl font-black text-ink">{xp}</p>
          <p className="mt-1 text-sm text-slate-500">
            {getXpUntilNextLevel(xp)} XP to next level
          </p>
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
          <p className="mt-1 text-sm text-slate-500">Practice keeps it alive</p>
        </article>
        <Link
          to="/mistakes"
          className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:bg-coral-50 hover:ring-coral-100"
        >
          <p className="text-sm font-semibold text-slate-500">Mistake Journal</p>
          <p className="mt-2 text-3xl font-black text-ink">
            {unresolvedMistakes.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">unresolved</p>
        </Link>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-normal text-ink">
                Mastery by Topic
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Current mastery from practice and test attempts.
              </p>
            </div>
            <p className="rounded-full bg-lagoon-50 px-3 py-1 text-sm font-bold text-lagoon-600">
              {accuracy}% accuracy
            </p>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={masteryData}
                layout="vertical"
                margin={{ top: 8, right: 18, bottom: 8, left: 24 }}
              >
                <CartesianGrid horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tickLine={false} />
                <YAxis
                  dataKey="topic"
                  type="category"
                  tickLine={false}
                  width={88}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value) => [`${value}%`, 'Mastery']}
                />
                <Bar dataKey="mastery" fill="#21b8a5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black tracking-normal text-ink">
              Quick Start
            </h2>
            <div className="mt-4 grid gap-2">
              <Link
                to={`/practice/${recommendedTopic.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-lagoon-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-lagoon-500"
              >
                Practice {recommendedTopic.title}
              </Link>
              <Link
                to="/timed-test"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Start timed test
              </Link>
              <Link
                to="/mistakes"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-coral-50 px-4 py-2 text-sm font-semibold text-coral-500 transition hover:bg-coral-100"
              >
                Review mistakes
              </Link>
            </div>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">All-time attempts</p>
            <p className="mt-2 text-3xl font-black text-ink">{totalAttempts}</p>
            <p className="mt-1 text-sm text-slate-500">{totalCorrect} correct</p>
          </article>
        </aside>
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-normal text-ink">
              Practice by Topic
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Jump straight into focused practice.
            </p>
          </div>
          <Link
            to="/timed-test"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Timed test mode
          </Link>
        </div>
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
