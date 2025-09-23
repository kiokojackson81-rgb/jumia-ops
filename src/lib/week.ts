// src/lib/week.ts

/**
 * Helpers for "EAT" (Africa/Nairobi, UTC+3) weekly calculations
 * We do all math in UTC but shift by +3h to simulate EAT,
 * then shift back when returning bounds.
 */

const MS_HOUR = 60 * 60 * 1000;
const MS_DAY = 24 * MS_HOUR;
const EAT_SHIFT = 3 * MS_HOUR;

/** Return start (Mon 00:00 EAT) and end (next Mon 00:00 EAT) as UTC Dates */
export function weekBoundsEAT(base?: Date) {
  const now = base ? new Date(base) : new Date();

  // shift to "EAT clock"
  const eatMs = now.getTime() + EAT_SHIFT;
  const eat = new Date(eatMs);

  // JS weekday (0=Sun..6=Sat); we want Monday-start weeks
  const day = eat.getUTCDay();                 // in "EAT clock"
  const daysFromMonday = (day + 6) % 7;        // Sun=>6, Mon=>0, Tue=>1, ...

  // Go to Monday 00:00 (EAT)
  const startEat = new Date(eat);
  startEat.setUTCDate(eat.getUTCDate() - daysFromMonday);
  startEat.setUTCHours(0, 0, 0, 0);

  const endEat = new Date(startEat.getTime() + 7 * MS_DAY);

  // shift back to real UTC timeline
  const startUTC = new Date(startEat.getTime() - EAT_SHIFT);
  const endUTC = new Date(endEat.getTime() - EAT_SHIFT);

  return { start: startUTC, end: endUTC };
}

/** Is the given date inside the current EAT week? */
export function isInCurrentWeekEAT(d: Date | string | number) {
  const target = new Date(d);
  const { start, end } = weekBoundsEAT();
  return target >= start && target < end;
}
