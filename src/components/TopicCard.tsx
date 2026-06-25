import type { Topic, TopicProgress } from '../types';

interface TopicCardProps {
  topic: Topic;
  progress?: TopicProgress;
}

export function TopicCard({ topic, progress }: TopicCardProps) {
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
    </article>
  );
}
