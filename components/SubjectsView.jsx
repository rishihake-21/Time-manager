"use client";

import { useState } from "react";
import { CATEGORY_COLORS } from "../lib/dateUtils";
import SubjectModal from "./SubjectModal";

const CATEGORY_TYPES = [
  { id: "college", label: "College" },
  { id: "study", label: "Study" },
  { id: "project", label: "Project" },
];

export default function SubjectsView({ subjects, onAddClick, onEditClick, onDeleteClick }) {
  const [filter, setFilter] = useState("all");

  const filteredSubjects = subjects.filter((s) =>
    filter === "all" ? true : s.category === filter
  );

  const grouped = {
    college: filteredSubjects.filter((s) => s.category === "college"),
    study: filteredSubjects.filter((s) => s.category === "study"),
    project: filteredSubjects.filter((s) => s.category === "project"),
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Subjects</h2>
        <button
          type="button"
          onClick={onAddClick}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper"
        >
          + Add Subject
        </button>
      </div>

      <div className="mt-4 inline-flex rounded-md border border-line bg-surface p-1" role="tablist">
        {CATEGORY_TYPES.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={filter === cat.id}
            onClick={() => setFilter(cat.id)}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === cat.id ? "bg-ink text-paper" : "text-inkfaint hover:text-ink"
            }`}
          >
            {cat.label}
          </button>
        ))}
        <button
          role="tab"
          aria-selected={filter === "all"}
          onClick={() => setFilter("all")}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === "all" ? "bg-ink text-paper" : "text-inkfaint hover:text-ink"
          }`}
        >
          All
        </button>
      </div>

      {filteredSubjects.length === 0 ? (
        <p className="mt-8 text-sm text-inkfaint text-center">
          No subjects yet. Add one to organize your events and tasks.
        </p>
      ) : (
        <div className="mt-4 space-y-6">
          {CATEGORY_TYPES.map((cat) => {
            const items = grouped[cat.id];
            if (items.length === 0) return null;
            const colors = CATEGORY_COLORS[cat.id] || CATEGORY_COLORS.other;
            return (
              <section key={cat.id}>
                <h3 className="font-display text-sm font-semibold text-inkfaint uppercase tracking-wide flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${colors.bg} ${colors.text}`}>
                    {cat.label}
                  </span>
                  {cat.label}
                </h3>
                <ul className="mt-3 space-y-2">
                  {items.map((subject) => (
                    <li key={subject.id}>
                      <SubjectCard subject={subject} onEdit={onEditClick} onDelete={onDeleteClick} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubjectCard({ subject, onEdit, onDelete }) {
  const colors = CATEGORY_COLORS[subject.category] || CATEGORY_COLORS.other;

  return (
    <button
      type="button"
      onClick={() => onEdit(subject)}
      className="w-full rounded-md border border-line bg-surface px-3 py-3 text-left shadow-sm transition-shadow hover:shadow flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: subject.color || (subject.category === "college" ? "#2F5D8A" : subject.category === "study" ? "#1B7A4A" : "#A04A1E") }}
        >
          {subject.short_name ? (
            <span className="text-white font-medium text-lg">{subject.short_name}</span>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )}
        </div>
        <div>
          <p className="font-medium text-ink">{subject.name}</p>
          {subject.short_name && <p className="text-xs text-inkfaint">{subject.short_name}</p>}
          {(subject.teacher || subject.room) && (
            <p className="text-xs text-inkfaint flex items-center gap-2">
              {subject.teacher && <span>👨‍🏫 {subject.teacher}</span>}
              {subject.room && <span>🚪 {subject.room}</span>}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(subject); }}
        className="shrink-0 p-1 text-inkfaint hover:text-danger"
        aria-label="Delete subject"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </button>
  );
}