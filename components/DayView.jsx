"use client";

import { formatFullDate, isSameDay } from "../lib/dateUtils";
import BlockCard from "./BlockCard";

export default function DayView({ date, today, blocks, onBlockClick, onAddClick }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">
          {formatFullDate(date)}
          {isSameDay(date, today) && (
            <span className="ml-2 rounded-full bg-college-soft px-2 py-0.5 text-xs font-medium text-college align-middle">
              Today
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => onAddClick(date)}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper"
        >
          + Add block
        </button>
      </div>

      {blocks.length === 0 ? (
        <p className="mt-8 text-sm text-inkfaint">
          Nothing scheduled. Add a block to get started.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {blocks.map((block) => (
            <li key={block.key}>
              <BlockCard block={block} onClick={onBlockClick} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
