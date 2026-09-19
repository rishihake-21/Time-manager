"use client";

import { useMemo } from "react";
import { getEventsForRange, getWeekDates, timeToMinutes, CATEGORY_COLORS } from "../lib/dateUtils";

export default function WeeklySummary({ events, subjects, selectedDate }) {
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  
  const summary = useMemo(() => {
    // Get all events for the week (including recurring expanded)
    const eventsByDate = getEventsForRange(weekDates, events, [], subjects);
    let allEvents = [];
    for (const evts of eventsByDate.values()) {
      allEvents = [...allEvents, ...evts];
    }

    // Group by category and calculate hours
    const categoryHours = {};
    const categories = ["college", "study", "project", "personal", "exercise", "other"];
    
    categories.forEach(cat => {
      categoryHours[cat] = 0;
    });

    allEvents.forEach(event => {
      const cat = event.category || "other";
      const start = timeToMinutes(event.start_datetime.toTimeString().slice(0, 5));
      const end = timeToMinutes(event.end_datetime.toTimeString().slice(0, 5));
      const hours = (end - start) / 60;
      if (categoryHours[cat] !== undefined) {
        categoryHours[cat] += hours;
      } else {
        categoryHours.other = (categoryHours.other || 0) + hours;
      }
    });

    // Filter out zero-hour categories and sort by hours descending
    return Object.entries(categoryHours)
      .filter(([, hours]) => hours > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([category, hours]) => ({ category, hours: Math.round(hours * 10) / 10 }));
  }, [events, subjects, weekDates]);

  const totalHours = useMemo(() => 
    summary.reduce((sum, item) => sum + item.hours, 0), [summary]);

  if (summary.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface/50 p-6 text-center">
        <p className="text-sm text-inkfaint">No scheduled time this week</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <h3 className="font-display text-sm font-semibold text-inkfaint uppercase tracking-wide mb-4 flex items-center justify-between">
        <span>This Week</span>
        <span className="text-ink font-medium">{totalHours.toFixed(1)}h total</span>
      </h3>
      <div className="space-y-3">
        {summary.map((item) => {
          const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
          const percentage = totalHours > 0 ? Math.round((item.hours / totalHours) * 100) : 0;
          return (
            <div key={item.category} className="flex items-center gap-3">
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${colors.bg} ${colors.text}`}>
                {item.category}
              </span>
              <div className="flex-1 h-2 rounded-full bg-line overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%`, backgroundColor: colors.text === "text-college" ? "#2F5D8A" : colors.text === "text-study" ? "#1B7A4A" : colors.text === "text-project" ? "#A04A1E" : colors.text === "text-personal" ? "#8A6D1E" : colors.text === "text-exercise" ? "#C0392B" : "#5D6D7E" }}
                />
              </div>
              <span className="shrink-0 text-sm font-medium text-ink w-16 text-right">{item.hours.toFixed(1)}h</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}