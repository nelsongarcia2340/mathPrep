import type { Difficulty } from '../types';

const difficultyOrder: Difficulty[] = ['easy', 'medium', 'hard'];

interface AttemptStreaks {
  correctStreak: number;
  wrongStreak: number;
}

export const adjustDifficulty = (
  currentDifficulty: Difficulty,
  correctStreak: number,
  wrongStreak: number,
): Difficulty => {
  const index = difficultyOrder.indexOf(currentDifficulty);

  if (correctStreak >= 2) {
    return difficultyOrder[Math.min(index + 1, difficultyOrder.length - 1)];
  }

  if (wrongStreak >= 2) {
    return difficultyOrder[Math.max(index - 1, 0)];
  }

  return currentDifficulty;
};

export const getUpdatedPracticeStreaks = (
  isCorrect: boolean,
  previousCorrectStreak: number,
  previousWrongStreak: number,
): AttemptStreaks => ({
  correctStreak: isCorrect ? previousCorrectStreak + 1 : 0,
  wrongStreak: isCorrect ? 0 : previousWrongStreak + 1,
});

export const estimateDifficultyFromScore = (score: number): Difficulty => {
  if (score >= 0.75) {
    return 'hard';
  }

  if (score >= 0.45) {
    return 'medium';
  }

  return 'easy';
};
