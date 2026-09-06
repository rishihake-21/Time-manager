import { toISODate, timeToMinutes } from "./dateUtils";

/**
 * Computes the effective list of blocks for a single date by taking the
 * recurring weekly pattern and applying that date's exceptions on top:
 *  - "cancel" exceptions remove a specific recurring block for that date only.
 *  - "add" exceptions insert an ad-hoc block for that date (used when personal
 *    work needs to sit inside normal college hours, or vice versa).
 */
export function getBlocksForDate(date, recurringBlocks, exceptions, completions = []) {
  const isoDate = toISODate(date);
  const dayOfWeek = date.getDay();

  const dayExceptions = exceptions.filter((e) => e.exception_date === isoDate);
  const cancelledIds = new Set(
    dayExceptions
      .filter((e) => e.type === "cancel")
      .map((e) => e.recurring_block_id)
  );

  const completedKeys = new Set(
    completions
      .filter((c) => c.completion_date === isoDate)
      .map((c) => `${c.block_source}-${c.block_id}`)
  );

  const base = recurringBlocks
    .filter((b) => b.day_of_week === dayOfWeek && !cancelledIds.has(b.id))
    .map((b) => ({
      key: `recurring-${b.id}-${isoDate}`,
      source: "recurring",
      id: b.id,
      category: b.category,
      title: b.title,
      start_time: b.start_time,
      end_time: b.end_time,
      location: b.location,
      color: b.color,
      notes: b.notes,
      date: isoDate,
      completed: completedKeys.has(`recurring-${b.id}`),
    }));

  const added = dayExceptions
    .filter((e) => e.type === "add")
    .map((e) => ({
      key: `exception-${e.id}`,
      source: "exception",
      id: e.id,
      category: e.category,
      title: e.title,
      start_time: e.start_time,
      end_time: e.end_time,
      location: e.location,
      color: e.color,
      notes: e.notes,
      date: isoDate,
      completed: completedKeys.has(`exception-${e.id}`),
    }));

  return [...base, ...added].sort(
    (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
  );
}

export function getBlocksForRange(dates, recurringBlocks, exceptions, completions = []) {
  const map = new Map();
  for (const date of dates) {
    map.set(toISODate(date), getBlocksForDate(date, recurringBlocks, exceptions, completions));
  }
  return map;
}

export function detectOverlap(blockA, blockB) {
  const aStart = timeToMinutes(blockA.start_time);
  const aEnd = timeToMinutes(blockA.end_time);
  const bStart = timeToMinutes(blockB.start_time);
  const bEnd = timeToMinutes(blockB.end_time);
  return aStart < bEnd && bStart < aEnd;
}
