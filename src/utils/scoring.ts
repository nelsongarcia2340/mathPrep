export const getLevelFromXp = (xp: number): number => Math.floor(xp / 250) + 1;

export const getLevelProgress = (xp: number): number => {
  const currentLevelXp = xp % 250;
  return Math.round((currentLevelXp / 250) * 100);
};

export const isSameCalendarDay = (first: string, second: string): boolean =>
  first.slice(0, 10) === second.slice(0, 10);
