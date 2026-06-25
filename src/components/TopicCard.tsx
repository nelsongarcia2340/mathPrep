import type { Topic, TopicProgress } from '../types';
import { Link } from 'react-router-dom';

interface TopicCardProps {
  topic: Topic;
  progress?: TopicProgress;
  showPracticeLink?: boolean;
}

export function TopicCard({ topic, progress, showPracticeLink = false }: TopicCardProps) {
  const mastery = progress?.mastery ?? 0;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-coral-500">
            {topic.subject}
          </p>
          <h3 className="mt-1 text-lg font-bold text-ink">{topic.title}</h3>
        </div>
        <span className="rounded-full bg-lagoon-50 px-3 py-1 text-sm font-bold text-lagoon-600">
          {mastery}%
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{topic.summary}</p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-lagoon-500"
          style={{ width: `${mastery}%` }}
        />
      </div>
      {showPracticeLink ? (
        <Link
          to={`/practice/${topic.id}`}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-bold text-lagoon-600 ring-1 ring-lagoon-100 transition hover:bg-lagoon-50"
        >
          Practice this topic
        </Link>
      ) : null}
    </article>
  );
}
