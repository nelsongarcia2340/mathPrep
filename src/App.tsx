import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { MistakeJournalPage } from './pages/MistakeJournalPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { PracticePage } from './pages/PracticePage';
import { SettingsPage } from './pages/SettingsPage';
import { TimedTestPage } from './pages/TimedTestPage';
import { useProgressStore } from './store/progressStore';

function OnboardingRedirect() {
  const profile = useProgressStore((state) => state.profile);

  if (profile?.diagnosticCompleted) {
    return <Navigate to="/" replace />;
  }

  return <OnboardingPage />;
}

export function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingRedirect />} />
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="practice/:topicId" element={<PracticePage />} />
        <Route path="test" element={<TimedTestPage />} />
        <Route path="timed-test" element={<TimedTestPage />} />
        <Route path="mistakes" element={<MistakeJournalPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
