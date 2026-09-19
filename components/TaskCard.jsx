"use client";

import { formatDateShort, getPriorityLabel, getPriorityColor, CATEGORY_COLORS } from "../lib/dateUtils";

export default function TaskCard({ task, onClick, onToggle }) {
  const colors = task.subject
    ? CATEGORY_COLORS[task.subject.category] || CATEGORY_COLORS.other
    : CATEGORY_COLORS.other;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-left shadow-sm transition-shadow hover:shadow flex items-center gap-3"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id, !task.completed);
        }}
        className="shrink-0 w-5 h-5 rounded border-2 border-line flex items-center justify-center text-paper transition-colors hover:border-college"
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && (
          <svg className="w-3.5 h-3.5 text-college" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink line-clamp-1">{task.title}</span>
          {task.priority > 0 && (
            <span className={`shrink-0 text-[10px] font-medium uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
              {getPriorityLabel(task.priority)}
            </span>
          )}
        </div>

        {(task.subject || task.due_datetime) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-inkfaint">
            {task.subject && (
              <span
                className={`rounded-full px-1.5 py-0.5 ${colors.bg} ${colors.text}`}
              >
                {task.subject.name}
              </span>
            )}
            {task.due_datetime && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDateShort(new Date(task.due_datetime))}
              </span>
            )}
          </div>
        )}

        {task.description && (
          <p className="mt-1 text-sm text-inkfaint line-clamp-2">{task.description}</p>
        )}
      </div>
    </button>
  );
}