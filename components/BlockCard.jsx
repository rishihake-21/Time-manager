"use client";

import { formatTimeLabel } from "../lib/dateUtils";

export default function BlockCard({ block, onClick, onToggleComplete, compact }) {
  const isCollege = block.category === "college";
  const borderColor = block.color || (isCollege ? "#2E6BFF" : "#EE1D25");

  return (
    <div
      style={{ borderLeftColor: borderColor }}
      className={`webline flex w-full items-start gap-2 rounded-md border border-line border-l-4 bg-surface px-3 py-2 shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/20 ${
        block.completed ? "opacity-60" : ""
      } ${compact ? "text-xs" : "text-sm"}`}
    >
      {onToggleComplete && (
        <button
          type="button"
          aria-label={block.completed ? "Mark as not done" : "Mark as done"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(block);
          }}
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
            block.completed
              ? "border-webgold bg-webgold text-paper"
              : "border-inkfaint"
          }`}
        >
          {block.completed && <span className="text-[10px] leading-none">✓</span>}
        </button>
      )}

      <button
        type="button"
        onClick={() => onClick(block)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-medium text-ink line-clamp-1 ${
              block.completed ? "line-through decoration-inkfaint" : ""
            }`}
          >
            {block.title}
          </span>
          <span
            className={`shrink-0 rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
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
    </div>
  );
}
