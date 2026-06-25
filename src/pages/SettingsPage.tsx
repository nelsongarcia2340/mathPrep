import { Button } from '../components/Button';
import { useProgressStore } from '../store/progressStore';

export function SettingsPage() {
  const resetProgress = useProgressStore((state) => state.resetProgress);

  return (
    <div className="max-w-2xl">
      <p className="text-sm font-bold uppercase tracking-wide text-coral-500">Settings</p>
      <h1 className="mt-2 text-3xl font-black tracking-normal text-ink">
        App preferences
      </h1>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Progress data</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          MathPrep v1 stores progress in this browser with localStorage.
        </p>
        <Button className="mt-4" variant="secondary" onClick={resetProgress}>
          Reset onboarding and progress
        </Button>
      </section>
    </div>
  );
}
