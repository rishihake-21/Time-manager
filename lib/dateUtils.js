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

export const CATEGORIES = [
  { id: "college", label: "College", color: "college" },
  { id: "study", label: "Study", color: "study" },
  { id: "project", label: "Project", color: "project" },
  { id: "personal", label: "Personal", color: "personal" },
  { id: "exercise", label: "Exercise", color: "exercise" },
  { id: "other", label: "Other", color: "other" },
];

export const CATEGORY_COLORS = {
  college: { bg: "bg-college-soft", text: "text-college", border: "border-college" },
  study: { bg: "bg-study-soft", text: "text-study", border: "border-study" },
  project: { bg: "bg-project-soft", text: "text-project", border: "border-project" },
  personal: { bg: "bg-personal-soft", text: "text-personal", border: "border-personal" },
  exercise: { bg: "bg-exercise-soft", text: "text-exercise", border: "border-exercise" },
  other: { bg: "bg-other-soft", text: "text-other", border: "border-other" },
};

export function parseISODate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toISODateTime(date) {
  const isoDate = toISODate(date);
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${isoDate}T${h}:${m}:00`;
}

export function parseISODateTime(iso) {
  // Parse "YYYY-MM-DDTHH:MM:SS" or "YYYY-MM-DDTHH:MM" as local time
  const [datePart, timePart] = iso.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, min] = (timePart || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, h, min);
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
  const first = startOfMonth(date);
  const last = endOfMonth(date);
  const gridStart = startOfWeek(first, weekStartsOn);
  const gridEnd = startOfWeek(last, weekStartsOn);
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

export function formatDateShort(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function timeToMinutes(t) {
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

export function formatTimeRange(start, end) {
  return `${formatTimeLabel(start)} – ${formatTimeLabel(end)}`;
}

export function formatDateTimeRange(startDt, endDt) {
  const startDate = toISODate(startDt);
  const endDate = toISODate(endDt);
  if (startDate === endDate) {
    return `${formatFullDate(startDt)}, ${formatTimeRange(
      startDt.toTimeString().slice(0, 5),
      endDt.toTimeString().slice(0, 5)
    )}`;
  }
  return `${formatDateShort(startDt)} ${formatTimeLabel(
    startDt.toTimeString().slice(0, 5)
  )} – ${formatDateShort(endDt)} ${formatTimeLabel(
    endDt.toTimeString().slice(0, 5)
  )}`;
}

// Get time string "HH:MM" from Date
export function getTimeString(date) {
  return date.toTimeString().slice(0, 5);
}

// Parse simple rrule for weekly recurrence: "FREQ=WEEKLY;BYDAY=MO,WE,FR"
// Returns array of day numbers (0=Sun...6=Sat)
export function parseRecurrenceRule(rrule) {
  if (!rrule) return [];
  const byDayMatch = rrule.match(/BYDAY=([^;]+)/);
  if (!byDayMatch) return [];
  const dayMap = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
  return byDayMatch[1].split(",").map((d) => dayMap[d.trim().toUpperCase()]).filter((d) => d !== undefined);
}

// Check if a date matches a recurrence rule
export function matchesRecurrence(date, rrule, recurrenceStart, recurrenceEnd) {
  if (!rrule) return false;
  const days = parseRecurrenceRule(rrule);
  if (days.length === 0) return false;
  
  const dateDay = date.getDay();
  if (!days.includes(dateDay)) return false;
  
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startOnly = new Date(recurrenceStart.getFullYear(), recurrenceStart.getMonth(), recurrenceStart.getDate());
  if (dateOnly < startOnly) return false;
  
  if (recurrenceEnd) {
    const endOnly = new Date(recurrenceEnd.getFullYear(), recurrenceEnd.getMonth(), recurrenceEnd.getDate());
    if (dateOnly > endOnly) return false;
  }
  
  return true;
}

// Get occurrence datetime for a recurring event on a specific date
export function getOccurrenceDateTime(baseEvent, targetDate) {
  const startTime = baseEvent.start_datetime.toTimeString().slice(0, 5);
  const endTime = baseEvent.end_datetime.toTimeString().slice(0, 5);
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  
  const start = new Date(targetDate);
  start.setHours(sh, sm, 0, 0);
  
  const end = new Date(targetDate);
  end.setHours(eh, em, 0, 0);
  
  return { start, end };
}

// Compute effective events for a date range
export function getEventsForRange(dates, events, exceptions, subjects) {
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const exceptionMap = new Map();
  
  // Build exception lookup by event_id + occurrence_date
  for (const ex of exceptions) {
    const key = `${ex.event_id}|${ex.occurrence_date}`;
    if (!exceptionMap.has(key)) exceptionMap.set(key, []);
    exceptionMap.get(key).push(ex);
  }
  
  const result = new Map();
  
  for (const date of dates) {
    const isoDate = toISODate(date);
    const dayEvents = [];
    
    // Get non-recurring events for this date
    const singleEvents = events.filter(e => {
      if (e.recurrence_rule) return false; // Handle recurring separately
      const eventDate = toISODate(new Date(e.start_datetime));
      return eventDate === isoDate && e.status === "scheduled";
    });
    
    // Get recurring events that occur on this date
    const recurringEvents = events.filter(e => {
      if (!e.recurrence_rule) return false;
      if (e.status !== "scheduled") return false;
      return matchesRecurrence(date, e.recurrence_rule, new Date(e.start_datetime), e.recurrence_end ? new Date(e.recurrence_end) : null);
    });
    
    // Process single events
    for (const event of singleEvents) {
      const exKey = `${event.id}|${isoDate}`;
      const eventExceptions = exceptionMap.get(exKey) || [];
      const cancelled = eventExceptions.some(ex => ex.action === "cancel");
      if (cancelled) continue;
      
      const moved = eventExceptions.find(ex => ex.action === "move");
      const updated = eventExceptions.find(ex => ex.action === "update");
      
      let startDt = new Date(event.start_datetime);
      let endDt = new Date(event.end_datetime);
      let title = event.title;
      let location = event.location;
      let notes = event.description;
      
      if (moved) {
        startDt = new Date(moved.replacement_start);
        endDt = new Date(moved.replacement_end);
      }
      if (updated) {
        title = updated.replacement_title || title;
        location = updated.replacement_location || location;
        notes = updated.replacement_notes || notes;
      }
      
      dayEvents.push({
        ...event,
        subject: subjectMap.get(event.subject_id),
        start_datetime: startDt,
        end_datetime: endDt,
        title,
        location,
        description: notes,
        isRecurring: false,
        isException: !!moved || !!updated,
      });
    }
    
    // Process recurring events
    for (const event of recurringEvents) {
      const exKey = `${event.id}|${isoDate}`;
      const eventExceptions = exceptionMap.get(exKey) || [];
      const cancelled = eventExceptions.some(ex => ex.action === "cancel");
      if (cancelled) continue;
      
      const moved = eventExceptions.find(ex => ex.action === "move");
      const updated = eventExceptions.find(ex => ex.action === "update");
      
      let occurrence = getOccurrenceDateTime(event, date);
      let title = event.title;
      let location = event.location;
      let notes = event.description;
      
      if (moved) {
        occurrence.start = new Date(moved.replacement_start);
        occurrence.end = new Date(moved.replacement_end);
      }
      if (updated) {
        title = updated.replacement_title || title;
        location = updated.replacement_location || location;
        notes = updated.replacement_notes || notes;
      }
      
      dayEvents.push({
        ...event,
        subject: subjectMap.get(event.subject_id),
        start_datetime: occurrence.start,
        end_datetime: occurrence.end,
        title,
        location,
        description: notes,
        isRecurring: true,
        isException: !!moved || !!updated,
      });
    }
    
    // Add exception-only events (type "add" - but we handle via moved/updated above)
    
    dayEvents.sort((a, b) => a.start_datetime - b.start_datetime);
    result.set(isoDate, dayEvents);
  }
  
  return result;
}

// Get events for a single date
export function getEventsForDate(date, events, exceptions, subjects) {
  const map = getEventsForRange([date], events, exceptions, subjects);
  return map.get(toISODate(date)) || [];
}

// Get current event (happening now)
export function getCurrentEvent(events, now = new Date()) {
  return events.find(e => e.start_datetime <= now && e.end_datetime > now) || null;
}

// Get next upcoming event
export function getNextEvent(events, now = new Date()) {
  const upcoming = events.filter(e => e.start_datetime > now);
  return upcoming[0] || null;
}

// Get time remaining string
export function getTimeRemaining(target, now = new Date()) {
  const diff = target - now;
  if (diff <= 0) return "Ended";
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

// Get progress percentage
export function getProgress(current, start, end) {
  const total = end - start;
  const elapsed = current - start;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export function getPriorityLabel(priority) {
  const labels = ["None", "Low", "Medium", "High"];
  return labels[priority] || "None";
}

export function getPriorityColor(priority) {
  const colors = ["text-inkfaint", "text-blue-600", "text-yellow-600", "text-red-600"];
  return colors[priority] || "text-inkfaint";
}