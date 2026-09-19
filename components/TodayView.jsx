"use client";

import { useMemo } from "react";
import {
  formatFullDate,
  formatTimeLabel,
  getCurrentEvent,
  getNextEvent,
  getTimeRemaining,
  getProgress,
  CATEGORY_COLORS,
} from "../lib/dateUtils";
import BlockCard from "./BlockCard";
import TaskCard from "./TaskCard";
import WeeklySummary from "./WeeklySummary";

export default function TodayView({
  date,
  today,
  events,
  tasks,
  subjects,
  selectedDate,
  onEventClick,
  onTaskClick,
  onTaskToggle,
  onAddEventClick,
  onAddTaskClick,
}) {
  const isToday = date.toDateString() === today.toDateString();

  const currentEvent = useMemo(() => getCurrentEvent(events), [events]);
  const nextEvent = useMemo(() => getNextEvent(events), [events]);
  const timelineEvents = useMemo(
    () => events.filter((e) => e !== currentEvent && e !== nextEvent),
    [events, currentEvent, nextEvent]
  );

  const incompleteTasks = useMemo(
    () => tasks.filter((t) => !t.completed),
    [tasks]
  );

  if (!isToday && timelineEvents.length === 0 && incompleteTasks.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">
            {formatFullDate(date)}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onAddEventClick}
              className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper"
            >
              + Event
            </button>
            <button
              type="button"
              onClick={onAddTaskClick}
              className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink"
            >
              + Task
            </button>
          </div>
        </div>
        <p className="mt-8 text-sm text-inkfaint">Nothing scheduled. Add an event or task to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">
          {formatFullDate(date)}
          {isToday && (
            <span className="ml-2 rounded-full bg-college-soft px-2 py-0.5 text-xs font-medium text-college align-middle">
              Today
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAddEventClick}
            className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper"
          >
            + Event
          </button>
          <button
            type="button"
            onClick={onAddTaskClick}
            className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink"
          >
            + Task
          </button>
        </div>
      </div>

      {/* NOW - Current Event */}
      {currentEvent && (
        <CurrentEventCard
          event={currentEvent}
          onClick={onEventClick}
          now={new Date()}
        />
      )}

      {/* NEXT - Next Event */}
      {nextEvent && !currentEvent && (
        <NextEventCard event={nextEvent} onClick={onEventClick} now={new Date()} />
      )}
      {nextEvent && currentEvent && (
        <NextEventCard event={nextEvent} onClick={onEventClick} now={new Date()} />
      )}

      {/* TODAY'S TIMELINE */}
      {timelineEvents.length > 0 && (
        <section className="mt-6">
          <h3 className="font-display text-sm font-semibold text-inkfaint uppercase tracking-wide">
            Today's Schedule
          </h3>
          <ul className="mt-3 space-y-2">
            {timelineEvents.map((event) => (
              <li key={`${event.id}-${event.start_datetime.getTime()}`}>
                <BlockCard block={event} onClick={onEventClick} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* TODAY'S TASKS */}
      {incompleteTasks.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-inkfaint uppercase tracking-wide">
              Tasks
            </h3>
            <button
              type="button"
              onClick={onAddTaskClick}
              className="text-xs text-college underline underline-offset-1"
            >
              + Add
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {incompleteTasks.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} onClick={onTaskClick} onToggle={onTaskToggle} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {timelineEvents.length === 0 && incompleteTasks.length === 0 && !currentEvent && !nextEvent && (
        <p className="mt-8 text-sm text-inkfaint">Nothing scheduled. Add an event or task to get started.</p>
      )}

      {/* WEEKLY SUMMARY */}
      {isToday && (
        <section className="mt-6">
          <WeeklySummary events={events} subjects={subjects} selectedDate={selectedDate} />
        </section>
      )}
    </div>
  );
}

function CurrentEventCard({ event, onClick, now }) {
  const progress = getProgress(now, event.start_datetime, event.end_datetime);
  const remaining = getTimeRemaining(event.end_datetime, now);
  const colors = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other;
  const isStudyOrProject = event.category === "study" || event.category === "project";

  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      style={{ borderLeftColor: colors.border === "border-college" ? "#2F5D8A" : colors.border === "border-study" ? "#1B7A4A" : colors.border === "border-project" ? "#A04A1E" : colors.border === "border-personal" ? "#8A6D1E" : colors.border === "border-exercise" ? "#C0392B" : "#5D6D7E" }}
      className="w-full rounded-md border border-line border-l-4 bg-surface px-3 py-3 text-left shadow-sm transition-shadow hover:shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-inkfaint uppercase tracking-wide">NOW</span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${colors.bg} ${colors.text}`}
        >
          {event.category}
        </span>
      </div>
      <p className="font-medium text-ink line-clamp-1">{event.title}</p>
      {isStudyOrProject && event.subject && (
        <p className="mt-0.5 text-sm text-inkfaint">{event.subject.name}</p>
      )}
      <p className="mt-1 text-sm text-inkfaint">
        {formatTimeLabel(event.start_datetime.toTimeString().slice(0, 5))} –{" "}
        {formatTimeLabel(event.end_datetime.toTimeString().slice(0, 5))}
        {event.location ? ` · ${event.location}` : ""}
      </p>
      <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
        <div
          className="h-full rounded-full bg-college transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-sm text-inkfaint">{remaining}</p>
    </button>
  );
}

function NextEventCard({ event, onClick, now }) {
  const colors = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other;
  const isStudyOrProject = event.category === "study" || event.category === "project";
  const timeUntil = getTimeRemaining(event.start_datetime, now);

  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      style={{ borderLeftColor: colors.border === "border-college" ? "#2F5D8A" : colors.border === "border-study" ? "#1B7A4A" : colors.border === "border-project" ? "#A04A1E" : colors.border === "border-personal" ? "#8A6D1E" : colors.border === "border-exercise" ? "#C0392B" : "#5D6D7E" }}
      className="mt-4 w-full rounded-md border border-line border-l-4 bg-surface px-3 py-3 text-left shadow-sm transition-shadow hover:shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-inkfaint uppercase tracking-wide">NEXT</span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${colors.bg} ${colors.text}`}
        >
          {event.category}
        </span>
      </div>
      <p className="font-medium text-ink line-clamp-1">{event.title}</p>
      {isStudyOrProject && event.subject && (
        <p className="mt-0.5 text-sm text-inkfaint">{event.subject.name}</p>
      )}
      <p className="mt-1 text-sm text-inkfaint">
        {formatTimeLabel(event.start_datetime.toTimeString().slice(0, 5))} –{" "}
        {formatTimeLabel(event.end_datetime.toTimeString().slice(0, 5))}
        {event.location ? ` · ${event.location}` : ""}
      </p>
      <p className="mt-1 text-sm text-college">Starts in {timeUntil.replace("Ended", "now")}</p>
    </button>
  );
}