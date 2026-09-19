"use client";

import { useState } from "react";

export default function QuickAddModal({ open, onClose, onAddEvent, onAddTask }) {
  const [step, setStep] = useState("choose"); // "choose" | "event" | "task"

  if (!open) return null;

  function handleBack() {
    setStep("choose");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-xl bg-surface p-5 shadow-lg sm:rounded-xl">
        {step === "choose" && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-ink">Add New</h3>
              <button type="button" onClick={onClose} aria-label="Close" className="text-inkfaint">✕</button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStep("event")}
                className="rounded-lg border border-line p-4 text-left hover:bg-surface/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-college-soft flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-college" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="font-medium text-ink">Event</p>
                <p className="text-sm text-inkfaint">Scheduled activity with time</p>
              </button>
              <button
                type="button"
                onClick={() => setStep("task")}
                className="rounded-lg border border-line p-4 text-left hover:bg-surface/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-personal-soft flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-personal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="font-medium text-ink">Task</p>
                <p className="text-sm text-inkfaint">To-do item, optional due date</p>
              </button>
            </div>
          </>
        )}

        {step === "event" && (
          <EventQuickForm onBack={handleBack} onSubmit={onAddEvent} onClose={onClose} />
        )}

        {step === "task" && (
          <TaskQuickForm onBack={handleBack} onSubmit={onAddTask} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function EventQuickForm({ onBack, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    start_time: "09:00",
    end_time: "10:00",
    category: "college",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const CATEGORIES = [
    { id: "college", label: "College" },
    { id: "study", label: "Study" },
    { id: "project", label: "Project" },
    { id: "personal", label: "Personal" },
    { id: "exercise", label: "Exercise" },
    { id: "other", label: "Other" },
  ];

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (form.start_time >= form.end_time) {
      setError("End time must be after start time.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const startDt = new Date(`${form.date}T${form.start_time}:00`);
      const endDt = new Date(`${form.date}T${form.end_time}:00`);
      await onSubmit({
        title: form.title.trim(),
        category: form.category,
        start_datetime: startDt.toISOString(),
        end_datetime: endDt.toISOString(),
        status: "scheduled",
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-inkfaint underline underline-offset-1"
      >
        ← Back
      </button>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-ink">Title</label>
        <input
          id="title"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="mt-1 w-full rounded-md border border-line px-3 py-2"
          placeholder="Event title"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-ink">Date</label>
          <input
            id="date"
            type="date"
            required
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className="mt-1 w-full rounded-md border border-line px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-ink">Start</label>
          <input
            id="start_time"
            type="time"
            required
            value={form.start_time}
            onChange={(e) => update("start_time", e.target.value)}
            className="mt-1 w-full rounded-md border border-line px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-ink">End</label>
          <input
            id="end_time"
            type="time"
            required
            value={form.end_time}
            onChange={(e) => update("end_time", e.target.value)}
            className="mt-1 w-full rounded-md border border-line px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">Category</label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => update("category", cat.id)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                form.category === cat.id
                  ? `bg-${cat.id} text-white`
                  : "bg-surface text-inkfaint hover:text-ink border border-line"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create Event"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-line px-4 py-2 text-sm text-inkfaint"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function TaskQuickForm({ onBack, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title: "",
    due_datetime: "",
    priority: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title: form.title.trim(),
        due_datetime: form.due_datetime ? new Date(form.due_datetime).toISOString() : null,
        priority: form.priority,
        completed: false,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-inkfaint underline underline-offset-1"
      >
        ← Back
      </button>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-ink">Title</label>
        <input
          id="title"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="mt-1 w-full rounded-md border border-line px-3 py-2"
          placeholder="Task title"
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="due_datetime" className="block text-sm font-medium text-ink">Due Date (optional)</label>
        <input
          id="due_datetime"
          type="datetime-local"
          value={form.due_datetime}
          onChange={(e) => update("due_datetime", e.target.value)}
          className="mt-1 w-full rounded-md border border-line px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">Priority</label>
        <div className="mt-1 inline-flex gap-2">
          {[
            { value: 0, label: "None" },
            { value: 1, label: "Low" },
            { value: 2, label: "Medium" },
            { value: 3, label: "High" },
          ].map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => update("priority", p.value)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                form.priority === p.value
                  ? "border-college bg-college-soft text-college"
                  : "border-line text-inkfaint hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create Task"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-line px-4 py-2 text-sm text-inkfaint"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}