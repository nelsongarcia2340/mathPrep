import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { topics } from '../data/topics';
import type {
  Course,
  DiagnosticResult,
  GradeLevel,
  TopicProgress,
  UserProgress,
} from '../types';

interface ProgressActions {
  completeOnboarding: (profile: {
    gradeLevel: GradeLevel;
    course: Course;
    diagnosticResults: DiagnosticResult[];
  }) => void;
  resetProgress: () => void;
}

type ProgressStore = UserProgress & ProgressActions;

const createInitialTopicProgress = (): Record<string, TopicProgress> =>
  Object.fromEntries(
    topics.map((topic) => [
      topic.id,
      {
        topicId: topic.id,
        mastery: 0,
        attempted: 0,
        correct: 0,
        currentDifficulty: 'easy',
        correctStreak: 0,
        wrongStreak: 0,
      },
    ]),
  );

const initialProgress: UserProgress = {
  topicProgress: createInitialTopicProgress(),
  mistakeJournal: [],
  xp: 0,
  level: 1,
  dailyStreak: 0,
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      ...initialProgress,
      completeOnboarding: ({ gradeLevel, course, diagnosticResults }) =>
        set((state) => {
          const seededProgress = { ...state.topicProgress };

          diagnosticResults.forEach((result) => {
            seededProgress[result.topicId] = {
              ...seededProgress[result.topicId],
              mastery: Math.round(result.score * 35),
              currentDifficulty: result.recommendedDifficulty,
            };
          });

          return {
            profile: {
              gradeLevel,
              course,
              diagnosticCompleted: true,
              diagnosticResults,
            },
            topicProgress: seededProgress,
            xp: Math.max(state.xp, 25),
            level: 1,
            dailyStreak: Math.max(state.dailyStreak, 1),
            lastActiveDate: new Date().toISOString(),
          };
        }),
      resetProgress: () =>
        set({
          ...initialProgress,
          topicProgress: createInitialTopicProgress(),
        }),
    }),
    {
      name: 'mathprep-progress',
      version: 1,
    },
  ),
);
