import {
  getEventsForDate,
  getEventsForRange,
  getCurrentEvent,
  getNextEvent,
  getTimeRemaining,
  getProgress,
  parseRecurrenceRule,
  matchesRecurrence,
  getOccurrenceDateTime,
} from "./dateUtils";

export {
  getEventsForDate,
  getEventsForRange,
  getCurrentEvent,
  getNextEvent,
  getTimeRemaining,
  getProgress,
  parseRecurrenceRule,
  matchesRecurrence,
  getOccurrenceDateTime,
};

// Legacy compatibility - for any code still using the old block model
export function getBlocksForDate(date, recurringBlocks, exceptions) {
  // This is kept for backward compatibility during migration
  // New code should use getEventsForDate
  return [];
}

export function getBlocksForRange(dates, recurringBlocks, exceptions) {
  return new Map();
}

export function detectOverlap(blockA, blockB) {
  const aStart = new Date(blockA.start_datetime).getTime();
  const aEnd = new Date(blockA.end_datetime).getTime();
  const bStart = new Date(blockB.start_datetime).getTime();
  const bEnd = new Date(blockB.end_datetime).getTime();
  return aStart < bEnd && bStart < aEnd;
}