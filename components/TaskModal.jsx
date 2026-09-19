"use client";

import { useEffect, useState } from "react";
import { toISODate, parseISODateTime } from "../lib/dateUtils";

const emptyForm = {
  title: "",
  description: "",
  due_datetime: "",
  priority: 0,
  subject_id: "",
  category: "personal",
};

export default function TaskModal({
  open,
  onClose,
  mode,
  task,
  subjects,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === "edit" && task) {
      setForm({
        title: task.title,
        description: task.description || "",
        due_datetime: task.due_datetime ? task.due_datetime.slice(0, 16) : "",
        priority: task.priority || 0,
        subject_id: task.subject_id || "",
        category: task.category || "personal",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, mode, task]);

  if (!open) return null;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        due_datetime: form.due_datetime ? new Date(form.due_datetime).toISOString() : null,
        priority: form.priority,
        subject_id: form.subject_id || null,
      };
      if (mode === "create") {
        await onCreate(payload);
      } else {
        await onUpdate(task.id, payload);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    setError(null);
    try {
      await onDelete(task.id);
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-xl bg-surface p-5 shadow-lg sm:rounded-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">
            {mode === "create" ? "New Task" : "Edit Task"}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-inkfaint">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-ink">
              Title
            </label>
            <input
              id="title"
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="Complete assignment"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-ink">
              Description <span className="text-inkfaint">(optional)</span>
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="subject_id" className="block text-sm font-medium text-ink">
              Subject / Track / Project <span className="text-inkfaint">(optional)</span>
            </label>
            <select
              id="subject_id"
              value={form.subject_id}
              onChange={(e) => update("subject_id", e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 bg-surface"
            >
              <option value="">None</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="due_datetime" className="block text-sm font-medium text-ink">
              Due Date <span className="text-inkfaint">(optional)</span>
            </label>
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

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>

            {mode === "edit" && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="ml-auto rounded-md px-3 py-2 text-sm text-danger"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}