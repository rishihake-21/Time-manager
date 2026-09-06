"use client";

import { DAY_SHORT, isSameDay, toISODate } from "../lib/dateUtils";

export default function MonthView({ monthDates, currentMonthDate, today, blocksByDate, onDayClick }) {
  const currentMonth = currentMonthDate.getMonth();

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-inkfaint">
        {DAY_SHORT.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {monthDates.map((date) => {
          const iso = toISODate(date);
          const blocks = blocksByDate.get(iso) || [];
          const inMonth = date.getMonth() === currentMonth;
          const isToday = isSameDay(date, today);
          const hasCollege = blocks.some((b) => b.category === "college");
          const hasPersonal = blocks.some((b) => b.category === "personal");

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onDayClick(date)}
              className={`flex h-16 flex-col items-start rounded-md border p-1.5 text-left transition-colors ${
                inMonth ? "border-line bg-surface" : "border-transparent bg-transparent text-inkfaint/50"
              } ${isToday ? "ring-2 ring-college" : ""}`}
            >
              <span className={`text-xs font-medium ${inMonth ? "text-ink" : "text-inkfaint/50"}`}>
                {date.getDate()}
              </span>
              <div className="mt-auto flex gap-1">
                {hasCollege && <span className="h-1.5 w-1.5 rounded-full bg-college" />}
                {hasPersonal && <span className="h-1.5 w-1.5 rounded-full bg-personal" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
