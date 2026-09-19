"use client";

import { formatTimeLabel } from "../lib/dateUtils";

export default function BlockCard({ block, onClick, compact }) {
  const isCollege = block.category === "college";
  const borderColor = block.color || (isCollege ? "#2F5D8A" : "#8A6D1E");

  return (
    <button
      type="button"
      onClick={() => onClick(block)}
      style={{ borderLeftColor: borderColor }}
      className={`w-full rounded-md border border-line border-l-4 bg-surface px-3 py-2 text-left shadow-sm transition-shadow hover:shadow ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-ink line-clamp-1">{block.title}</span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
            isCollege ? "bg-college-soft text-college" : "bg-personal-soft text-personal"
          }`}
        >
          {block.category}
        </span>
      </div>
      <p className="mt-0.5 text-inkfaint">
        {formatTimeLabel(block.start_time)} – {formatTimeLabel(block.end_time)}
        {block.location ? ` · ${block.location}` : ""}
      </p>
    </button>
  );
}
