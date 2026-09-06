"use client";

import { DAY_SHORT, isSameDay, toISODate } from "../lib/dateUtils";
import BlockCard from "./BlockCard";

export default function WeekView({ weekDates, today, blocksByDate, onBlockClick, onDayClick, onAddClick, onToggleComplete }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
      {weekDates.map((date) => {
        const iso = toISODate(date);
        const blocks = blocksByDate.get(iso) || [];
        const isToday = isSameDay(date, today);
        return (
          <div
            key={iso}
            className={`rounded-lg border bg-surface/60 ${isToday ? "border-personal" : "border-line"}`}
          >
            <button
              type="button"
              onClick={() => onDayClick(date)}
              className={`flex w-full items-center justify-between border-b border-line px-3 py-2 text-left ${
                isToday ? "bg-personal-soft" : ""
              }`}
            >
              <span className="text-sm font-medium text-ink">
                {DAY_SHORT[date.getDay()]} {date.getDate()}
              </span>
              {isToday && <span className="text-[10px] font-bold text-personal">TODAY</span>}
            </button>
            <div className="space-y-1.5 p-2">
              {blocks.length === 0 ? (
                <p className="px-1 py-2 text-xs text-inkfaint">Free</p>
              ) : (
                blocks.map((block) => (
                  <BlockCard
                    key={block.key}
                    block={block}
                    onClick={onBlockClick}
                    onToggleComplete={onToggleComplete}
                    compact
                  />
                ))
              )}
              <button
                type="button"
                onClick={() => onAddClick(date)}
                className="w-full rounded border border-dashed border-line py-1 text-xs text-inkfaint hover:text-ink"
              >
                + Add
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
