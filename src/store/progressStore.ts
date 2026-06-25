import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { topics } from '../data/topics';
import type {
  Course,
  DiagnosticResult,
  GradeLevel,
  Question,
  TopicProgress,
  UserProgress,
} from '../types';
import { adjustDifficulty, getUpdatedPracticeStreaks } from '../utils/adaptive';
import { stringifyCorrectAnswer } from '../utils/answers';
import { getLevelFromXp } from '../utils/scoring';

interface ProgressActions {
  completeOnboarding: (profile: {
    gradeLevel: GradeLevel;
    course: Course;
    diagnosticResults: DiagnosticResult[];
  }) => void;
  recordPracticeAttempt: (attempt: {
    question: Question;
    selectedAnswer: string;
    isCorrect: boolean;
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
      recordPracticeAttempt: ({ question, selectedAnswer, isCorrect }) =>
        set((state) => {
          const now = new Date().toISOString();
          const currentTopicProgress =
            state.topicProgress[question.topicId] ??
            createInitialTopicProgress()[question.topicId];
          const streaks = getUpdatedPracticeStreaks(
            isCorrect,
            currentTopicProgress.correctStreak,
            currentTopicProgress.wrongStreak,
          );
          const nextDifficulty = adjustDifficulty(
            currentTopicProgress.currentDifficulty,
            streaks.correctStreak,
            streaks.wrongStreak,
          );
          const difficultyChanged =
            nextDifficulty !== currentTopicProgress.currentDifficulty;
          const attempted = currentTopicProgress.attempted + 1;
          const correct = currentTopicProgress.correct + (isCorrect ? 1 : 0);
          const accuracyMastery = Math.round((correct / attempted) * 100);
          const masteryDelta = isCorrect ? 6 : -4;
          const nextMastery = Math.max(
            0,
            Math.min(
              100,
              Math.round((currentTopicProgress.mastery + accuracyMastery) / 2) +
                masteryDelta,
            ),
          );
          const nextXp = state.xp + (isCorrect ? 15 : 5);

          return {
            topicProgress: {
              ...state.topicProgress,
              [question.topicId]: {
                ...currentTopicProgress,
                attempted,
                correct,
                mastery: nextMastery,
                currentDifficulty: nextDifficulty,
                correctStreak: difficultyChanged ? 0 : streaks.correctStreak,
                wrongStreak: difficultyChanged ? 0 : streaks.wrongStreak,
                lastPracticedAt: now,
              },
            },
            mistakeJournal: isCorrect
              ? state.mistakeJournal
              : [
                  {
                    id: `${question.id}-${Date.now()}`,
                    questionId: question.id,
                    selectedAnswer,
                    correctAnswer: stringifyCorrectAnswer(question),
                    topicId: question.topicId,
                    missedAt: now,
                    reviewed: false,
                  },
                  ...state.mistakeJournal,
                ],
            xp: nextXp,
            level: getLevelFromXp(nextXp),
            dailyStreak: Math.max(state.dailyStreak, 1),
            lastActiveDate: now,
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
