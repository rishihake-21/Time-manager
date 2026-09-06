// All helpers work with plain Date objects in the browser's local timezone.

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function parseISODate(iso) {
  // Parses "YYYY-MM-DD" as a local-time date, avoiding the UTC-midnight
  // shift that `new Date("YYYY-MM-DD")` applies (which can land on the
  // wrong local day depending on timezone).
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a, b) {
  return toISODate(a) === toISODate(b);
}

export function addDays(date, n) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function startOfWeek(date, weekStartsOn = 1) {
  // weekStartsOn: 0 = Sunday, 1 = Monday
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getWeekDates(date, weekStartsOn = 1) {
  const start = startOfWeek(date, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getMonthGrid(date, weekStartsOn = 1) {
  // Returns an array of Date objects covering full weeks that contain the month.
  const first = startOfMonth(date);
  const last = endOfMonth(date);
  const gridStart = startOfWeek(first, weekStartsOn);
  const gridEnd = startOfWeek(last, weekStartsOn); // start of the last week in the month
  const totalDays = Math.round((gridEnd - gridStart) / 86400000) + 7;
  return Array.from({ length: totalDays }, (_, i) => addDays(gridStart, i));
}

export function formatMonthYear(date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function formatFullDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function timeToMinutes(t) {
  // "HH:MM" or "HH:MM:SS" -> minutes since midnight
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToLabel(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatTimeLabel(t) {
  return minutesToLabel(timeToMinutes(t));
}
