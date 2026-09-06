"use client";

const VIEWS = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export default function ViewSwitcher({ view, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Calendar view"
      className="inline-flex rounded-md border border-line bg-surface p-1"
    >
      {VIEWS.map((v) => (
        <button
          key={v.id}
          role="tab"
          aria-selected={view === v.id}
          onClick={() => onChange(v.id)}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            view === v.id
              ? "bg-college text-white"
              : "text-inkfaint hover:text-ink"
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
