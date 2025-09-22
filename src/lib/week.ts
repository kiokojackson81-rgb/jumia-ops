// Mon→Sun week boundaries in Africa/Nairobi (UTC+3), no deps
const EAT_OFFSET_HOURS = 3;

function toEAT(d: Date) {
  return new Date(d.getTime() + EAT_OFFSET_HOURS * 3600 * 1000);
}
function fromEAT(dEat: Date) {
  return new Date(dEat.getTime() - EAT_OFFSET_HOURS * 3600 * 1000);
}

export function weekBoundsEAT(forDate?: Date) {
  const eat = toEAT(forDate ?? new Date());
  const dow = eat.getDay(); // 0=Sun..6=Sat
  const diffToMon = (dow + 6) % 7; // Monday=0
  const mondayEat = new Date(eat);
  mondayEat.setHours(0, 0, 0, 0);
  mondayEat.setDate(mondayEat.getDate() - diffToMon);

  const sundayEat = new Date(mondayEat);
  sundayEat.setDate(sundayEat.getDate() + 6);
  sundayEat.setHours(23, 59, 59, 999);

  return {
    weekStartUtc: fromEAT(mondayEat),
    weekEndUtc: fromEAT(sundayEat),
    weekStartEat: mondayEat,
    weekEndEat: sundayEat,
  };
}

export function isInCurrentWeekEAT(date: Date) {
  const { weekStartUtc, weekEndUtc } = weekBoundsEAT();
  return date >= weekStartUtc && date <= weekEndUtc;
}
