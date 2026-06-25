import type { Difficulty } from '../types';

const difficultyOrder: Difficulty[] = ['easy', 'medium', 'hard'];

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

export const estimateDifficultyFromScore = (score: number): Difficulty => {
  if (score >= 0.75) {
    return 'hard';
  }

  if (score >= 0.45) {
    return 'medium';
  }

  return 'easy';
};
