import { useProgressStore } from '../store/progressStore';

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
          <p className="text-slate-600">{mistakes.length} mistake saved.</p>
        )}
      </div>
    </div>
  );
}
