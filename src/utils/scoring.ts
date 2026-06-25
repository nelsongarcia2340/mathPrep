import type { Difficulty } from '../types';

const LEVEL_XP_THRESHOLD = 100;

const xpByDifficulty: Record<Difficulty, number> = {
  easy: 10,
  medium: 15,
  hard: 25,
};

export const getXpForCorrectAnswer = (difficulty: Difficulty): number =>
  xpByDifficulty[difficulty];

export const getLevelFromXp = (xp: number): number =>
  Math.floor(xp / LEVEL_XP_THRESHOLD) + 1;

export const getLevelProgress = (xp: number): number => {
  const currentLevelXp = xp % LEVEL_XP_THRESHOLD;
  return Math.round((currentLevelXp / LEVEL_XP_THRESHOLD) * 100);
};

export const getXpUntilNextLevel = (xp: number): number => {
  const remainder = xp % LEVEL_XP_THRESHOLD;
  return remainder === 0 ? LEVEL_XP_THRESHOLD : LEVEL_XP_THRESHOLD - remainder;
};

const getLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const isSameCalendarDay = (first: string, second: string): boolean =>
  first.slice(0, 10) === second.slice(0, 10);

export const getUpdatedDailyStreak = (
  previousActiveAt: string | undefined,
  currentStreak: number,
  now = new Date(),
): number => {
  if (!previousActiveAt) {
    return 1;
  }

  const previousDate = new Date(previousActiveAt);

  if (Number.isNaN(previousDate.getTime())) {
    return 1;
  }

  const previousDay = getLocalDateKey(previousDate);
  const currentDay = getLocalDateKey(now);

  if (previousDay === currentDay) {
    return Math.max(currentStreak, 1);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (previousDay === getLocalDateKey(yesterday)) {
    return currentStreak + 1;
  }

  return 1;
};
