// src/lib/week.ts

export type WeekRange = { start: Date; end: Date };

/** Returns the current week (Mon 00:00:00 -> Sun 23:59:59) */
export function currentWeek(): WeekRange {
  const now = new Date();
  const day = now.getDay(); // 0 Sun..6 Sat
  const diffToMonday = (day + 6) % 7; // Mon=0
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - diffToMonday);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
