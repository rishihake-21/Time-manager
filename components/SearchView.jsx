"use client";

import { useState, useEffect, useMemo } from "react";
import { formatDateShort, formatTimeLabel, CATEGORY_COLORS } from "../lib/dateUtils";

export default function SearchView({ 
  open, 
  onClose, 
  events, 
  subjects, 
  tasks, 
  onEventClick, 
  onTaskClick, 
  onSubjectClick 
}) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("ledger_recent_searches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveTab("all");
      // Focus the input after a brief delay for animation
      setTimeout(() => {
        const input = document.getElementById("search-input");
        input?.focus();
      }, 50);
    }
  }, [open]);

  const saveRecentSearch = (q) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("ledger_recent_searches", JSON.stringify(updated));
  };

  const filteredEvents = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return events.filter(e => 
      e.title.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      (e.subject?.name?.toLowerCase().includes(q)) ||
      (e.location?.toLowerCase().includes(q)) ||
      (e.description?.toLowerCase().includes(q))
    );
  }, [events, query]);

  const filteredSubjects = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return subjects.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.short_name?.toLowerCase().includes(q)) ||
      (s.teacher?.toLowerCase().includes(q)) ||
      (s.room?.toLowerCase().includes(q))
    );
  }, [subjects, query]);

  const filteredTasks = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description?.toLowerCase().includes(q)) ||
      (t.subject?.name?.toLowerCase().includes(q))
    );
  }, [tasks, query]);

  const allResults = useMemo(() => {
    if (activeTab === "events") return filteredEvents.map(e => ({ ...e, type: "event" }));
    if (activeTab === "subjects") return filteredSubjects.map(s => ({ ...s, type: "subject" }));
    if (activeTab === "tasks") return filteredTasks.map(t => ({ ...t, type: "task" }));
    return [
      ...filteredEvents.map(e => ({ ...e, type: "event" })),
      ...filteredSubjects.map(s => ({ ...s, type: "subject" })),
      ...filteredTasks.map(t => ({ ...t, type: "task" }))
    ];
  }, [filteredEvents, filteredSubjects, filteredTasks, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    saveRecentSearch(query);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-ink/40 sm:items-center">
      <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl bg-surface shadow-xl">
        <div className="border-b border-line p-4">
          <form onSubmit={handleSearch} className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-inkfaint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, subjects, tasks…"
              className="w-full rounded-md border border-line bg-surface pl-10 pr-12 py-3 text-lg text-ink placeholder-inkfaint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-college"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-inkfaint hover:text-ink"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        <div className="border-b border-line px-4 py-2 overflow-x-auto">
          <div className="flex gap-1 min-w-max" role="tablist">
            {[
              { id: "all", label: "All" },
              { id: "events", label: "Events", count: filteredEvents.length },
              { id: "subjects", label: "Subjects", count: filteredSubjects.length },
              { id: "tasks", label: "Tasks", count: filteredTasks.length },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-inkfaint hover:text-ink"
                }`}
              >
                {tab.label} {tab.count !== undefined && <span className="ml-1 text-xs text-inkfaint">({tab.count})</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-4">
          {query.trim() && allResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-inkfaint/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="mt-4 text-sm text-inkfaint">No results for "{query}"</p>
            </div>
          )}

          {allResults.map((item, index) => (
            <SearchResultItem
              key={`${item.type}-${item.id}-${index}`}
              item={item}
              onClick={() => {
                if (item.type === "event") onEventClick(item);
                else if (item.type === "task") onTaskClick(item);
                else if (item.type === "subject") onSubjectClick(item);
                onClose();
              }}
            />
          ))}

          {!query.trim() && recentSearches.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display text-sm font-semibold text-inkfaint uppercase tracking-wide mb-3">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setQuery(s); saveRecentSearch(s); }}
                    className="rounded-full border border-line px-3 py-1 text-sm text-inkfaint hover:text-ink hover:border-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!query.trim() && recentSearches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-inkfaint/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="mt-4 text-sm text-inkfaint">Search events, subjects, or tasks</p>
              <p className="mt-1 text-xs text-inkfaint">Press ⌘K to open search anywhere</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultItem({ item, onClick }) {
  if (item.type === "event") {
    const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
    const isStudyOrProject = item.category === "study" || item.category === "project";
    return (
      <button type="button" onClick={onClick} className="w-full rounded-md border border-line bg-surface px-4 py-3 text-left shadow-sm hover:shadow transition-shadow flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-3">
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${colors.bg} ${colors.text}`}>
            {item.category}
          </span>
          <div>
            <p className="font-medium text-ink">{item.title}</p>
            {isStudyOrProject && item.subject && <p className="text-sm text-inkfaint">{item.subject.name}</p>}
            <p className="text-sm text-inkfaint">
              {formatDateShort(new Date(item.start_datetime))} · {formatTimeLabel(item.start_datetime.toTimeString().slice(0,5))}–{formatTimeLabel(item.end_datetime.toTimeString().slice(0,5))}
              {item.location ? ` · ${item.location}` : ""}
            </p>
          </div>
        </div>
        <span className="text-xs text-inkfaint">Event</span>
      </button>
    );
  }

  if (item.type === "subject") {
    const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
    return (
      <button type="button" onClick={onClick} className="w-full rounded-md border border-line bg-surface px-4 py-3 text-left shadow-sm hover:shadow transition-shadow flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color || (item.category === "college" ? "#2F5D8A" : item.category === "study" ? "#1B7A4A" : "#A04A1E") }}>
            {item.short_name ? <span className="text-white font-medium text-lg">{item.short_name}</span> : <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          </div>
          <div>
            <p className="font-medium text-ink">{item.name}</p>
            <p className="text-sm text-inkfaint flex items-center gap-2">
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text}`}>{item.category}</span>
              {item.teacher && <span>👨‍🏫 {item.teacher}</span>}
              {item.room && <span>🚪 {item.room}</span>}
            </p>
          </div>
        </div>
        <span className="text-xs text-inkfaint">Subject</span>
      </button>
    );
  }

  if (item.type === "task") {
    const colors = item.subject ? (CATEGORY_COLORS[item.subject.category] || CATEGORY_COLORS.other) : CATEGORY_COLORS.other;
    return (
      <button type="button" onClick={onClick} className="w-full rounded-md border border-line bg-surface px-4 py-3 text-left shadow-sm hover:shadow transition-shadow flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded border-2 border-line flex items-center justify-center text-paper">
            {item.completed && <svg className="w-3.5 h-3.5 text-college" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-ink line-clamp-1">{item.title}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-inkfaint">
              {item.subject && <span className={`rounded-full px-1.5 py-0.5 ${colors.bg} ${colors.text}`}>{item.subject.name}</span>}
              {item.due_datetime && <span>📅 {formatDateShort(new Date(item.due_datetime))}</span>}
              {item.priority > 0 && <span className="font-medium capitalize">Priority: {["None","Low","Medium","High"][item.priority]}</span>}
            </div>
          </div>
        </div>
        <span className="text-xs text-inkfaint">Task</span>
      </button>
    );
  }

  return null;
}