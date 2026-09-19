"use client";

import { useState } from "react";
import { DAY_SHORT, isSameDay, toISODate, formatTimeLabel } from "../lib/dateUtils";
import BlockCard from "./BlockCard";

export default function WeekView({
  weekDates,
  today,
  eventsByDate,
  onEventClick,
  onDayClick,
  onAddClick,
  viewMode = "grid",
  onViewModeChange,
}) {
  const [mobileView, setMobileView] = useState(viewMode || "grid");

  // Desktop: grid view, Mobile: day list view
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* View toggle for mobile */}
        <div className="inline-flex rounded-md border border-line bg-surface p-1" role="tablist">
          <button
            role="tab"
            aria-selected={mobileView === "grid"}
            onClick={() => { setMobileView("grid"); onViewModeChange?.("grid"); }}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              mobileView === "grid" ? "bg-ink text-paper" : "text-inkfaint hover:text-ink"
            }`}
          >
            Week Grid
          </button>
          <button
            role="tab"
            aria-selected={mobileView === "list"}
            onClick={() => { setMobileView("list"); onViewModeChange?.("list"); }}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              mobileView === "list" ? "bg-ink text-paper" : "text-inkfaint hover:text-ink"
            }`}
          >
            Day List
          </button>
        </div>

        {mobileView === "grid" ? (
          <div className="grid grid-cols-7 gap-1 text-xs">
            {weekDates.map((date) => {
              const iso = toISODate(date);
              const events = eventsByDate.get(iso) || [];
              const isToday = isSameDay(date, today);
              return (
                <div key={iso} className="rounded-lg border border-line bg-surface/60 min-h-[120px]">
                  <button
                    type="button"
                    onClick={() => onDayClick(date)}
                    className={`flex w-full items-center justify-between border-b border-line px-2 py-1.5 text-left ${
                      isToday ? "bg-college-soft" : ""
                    }`}
                  >
                    <span className="text-xs font-medium text-ink">
                      {DAY_SHORT[date.getDay()]} {date.getDate()}
                    </span>
                    {isToday && <span className="text-[9px] font-medium text-college">TODAY</span>}
                  </button>
                  <div className="space-y-1 p-1.5 max-h-[100px] overflow-y-auto">
                    {events.length === 0 ? (
                      <p className="px-1 py-2 text-[10px] text-inkfaint">Free</p>
                    ) : (
                      events.slice(0, 4).map((event) => (
                        <BlockCard key={`${event.id}-${event.start_datetime.getTime()}`} block={event} onClick={onEventClick} compact />
                      ))
                    )}
                    {events.length > 4 && (
                      <p className="px-1 text-[10px] text-inkfaint text-center">+{events.length - 4} more</p>
                    )}
                    <button
                      type="button"
                      onClick={() => onAddClick(date)}
                      className="w-full mt-1 rounded border border-dashed border-line py-1 text-[10px] text-inkfaint hover:text-ink"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {weekDates.map((date) => {
              const iso = toISODate(date);
              const events = eventsByDate.get(iso) || [];
              const isToday = isSameDay(date, today);
              return (
                <div key={iso} className="rounded-lg border border-line bg-surface">
                  <button
                    type="button"
                    onClick={() => { onDayClick(date); setMobileView("grid"); }}
                    className={`flex w-full items-center justify-between border-b border-line px-3 py-2 text-left ${
                      isToday ? "bg-college-soft" : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-ink">
                      {DAY_SHORT[date.getDay()]} {date.getDate()} {date.toLocaleDateString(undefined, { month: "short" })}
                    </span>
                    {isToday && <span className="text-xs font-medium text-college">TODAY</span>}
                  </button>
                  <div className="space-y-2 p-3">
                    {events.length === 0 ? (
                      <div className="py-4 text-center text-sm text-inkfaint">
                        <p>Free</p>
                        <button
                          type="button"
                          onClick={() => onAddClick(date)}
                          className="mt-2 text-college underline underline-offset-1 text-sm"
                        >
                          + Add event
                        </button>
                      </div>
                    ) : (
                      <>
                        {events.map((event) => (
                          <BlockCard key={`${event.id}-${event.start_datetime.getTime()}`} block={event} onClick={onEventClick} />
                        ))}
                        <button
                          type="button"
                          onClick={() => onAddClick(date)}
                          className="w-full rounded border border-dashed border-line py-2 text-sm text-inkfaint hover:text-ink"
                        >
                          + Add Event
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Desktop grid view
  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDates.map((date) => {
        const iso = toISODate(date);
        const events = eventsByDate.get(iso) || [];
        const isToday = isSameDay(date, today);
        return (
          <div key={iso} className="rounded-lg border border-line bg-surface/60 min-h-[200px]">
            <button
              type="button"
              onClick={() => onDayClick(date)}
              className={`flex w-full items-center justify-between border-b border-line px-3 py-2 text-left ${
                isToday ? "bg-college-soft" : ""
              }`}
            >
              <span className="text-sm font-medium text-ink">
                {DAY_SHORT[date.getDay()]} {date.getDate()}
              </span>
              {isToday && <span className="text-[10px] font-medium text-college">TODAY</span>}
            </button>
            <div className="space-y-1.5 p-2">
              {events.length === 0 ? (
                <p className="px-1 py-2 text-xs text-inkfaint">Free</p>
              ) : (
                events.map((event) => (
                  <BlockCard key={`${event.id}-${event.start_datetime.getTime()}`} block={event} onClick={onEventClick} compact />
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