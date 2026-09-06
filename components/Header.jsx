"use client";

import { formatFullDate, formatMonthYear, getWeekDates } from "../lib/dateUtils";

export default function Header({ today, selectedDate, onSignOut }) {
  const week = getWeekDates(selectedDate);
  const weekLabel = `${week[0].toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} – ${week[6].toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;

  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Ledger
        </h1>
        <p className="mt-0.5 text-sm text-inkfaint">
          Today is {formatFullDate(today)}
        </p>
      </div>
      <div className="text-right text-sm text-inkfaint">
        <p>{formatMonthYear(selectedDate)}</p>
        <p>Week of {weekLabel}</p>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-1 underline underline-offset-2"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
