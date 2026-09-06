"use client";

import { formatFullDate, isSameDay } from "../lib/dateUtils";
import BlockCard from "./BlockCard";

export default function DayView({ date, today, blocks, onBlockClick, onAddClick, onToggleComplete }) {
  const doneCount = blocks.filter((b) => b.completed).length;
  const progressPct = blocks.length ? Math.round((doneCount / blocks.length) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-normal text-ink">
          {formatFullDate(date)}
          {isSameDay(date, today) && (
            <span className="ml-2 rounded-sm bg-personal px-2 py-0.5 align-middle text-xs font-bold uppercase tracking-wide text-white">
              Today
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => onAddClick(date)}
          className="rounded-md bg-college px-3 py-1.5 text-sm font-semibold text-white shadow shadow-college/30"
        >
          + Add block
        </button>
      </div>

      {blocks.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-inkfaint">
            <span>
              {doneCount} of {blocks.length} done
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-webgold transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {blocks.length === 0 ? (
        <p className="mt-8 text-sm text-inkfaint">
          Nothing scheduled. Add a block to get started.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {blocks.map((block) => (
            <li key={block.key}>
              <BlockCard block={block} onClick={onBlockClick} onToggleComplete={onToggleComplete} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
