"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  short_name: "",
  category: "college",
  teacher: "",
  room: "",
  notes: "",
  color: "",
};

const CATEGORY_COLORS = {
  college: "#2F5D8A",
  study: "#1B7A4A",
  project: "#A04A1E",
};

export default function SubjectModal({
  open,
  onClose,
  mode,
  subject,
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
    if (mode === "edit" && subject) {
      setForm({
        name: subject.name,
        short_name: subject.short_name || "",
        category: subject.category,
        teacher: subject.teacher || "",
        room: subject.room || "",
        notes: subject.notes || "",
        color: subject.color || "",
      });
    } else {
      setForm({ ...emptyForm, color: CATEGORY_COLORS.college });
    }
  }, [open, mode, subject]);

  if (!open) return null;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.short_name.trim()) {
      // Auto-generate from name
      const words = form.name.trim().split(/\s+/);
      update("short_name", words.map(w => w[0].toUpperCase()).join("").slice(0, 4));
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        short_name: form.short_name.trim().toUpperCase() || null,
        category: form.category,
        teacher: form.teacher.trim() || null,
        room: form.room.trim() || null,
        notes: form.notes.trim() || null,
        color: form.color || CATEGORY_COLORS[form.category],
      };
      if (mode === "create") {
        await onCreate(payload);
      } else {
        await onUpdate(subject.id, payload);
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
      await onDelete(subject.id);
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
            {mode === "create" ? "New Subject" : "Edit Subject"}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-inkfaint">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-ink">
              Type
            </label>
            <div className="mt-1 inline-flex rounded-md border border-line p-1">
              {[
                { id: "college", label: "College" },
                { id: "study", label: "Study" },
                { id: "project", label: "Project" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { update("category", cat.id); update("color", CATEGORY_COLORS[cat.id]); }}
                  className={`rounded px-3 py-1 text-sm ${form.category === cat.id ? "bg-ink text-paper" : "text-inkfaint"}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink">
              Name
            </label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="Data Structures & Algorithms"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="short_name" className="block text-sm font-medium text-ink">
              Short Name <span className="text-inkfaint">(optional, auto-generated)</span>
            </label>
            <input
              id="short_name"
              value={form.short_name}
              onChange={(e) => update("short_name", e.target.value.toUpperCase())}
              maxLength={4}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-uppercase"
              placeholder="DSA"
            />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-ink">
              Color
            </label>
            <div className="mt-1 flex gap-2">
              {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => update("color", color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-transform ${form.color === color ? "border-ink scale-110" : "border-transparent hover:border-line"}`}
                  style={{ backgroundColor: color }}
                  aria-label={key}
                />
              ))}
              <input
                type="color"
                id="color"
                value={form.color}
                onChange={(e) => update("color", e.target.value)}
                className="w-10 h-10 rounded-lg border border-line cursor-pointer"
                aria-label="Custom color"
              />
            </div>
          </div>

          {form.category === "college" && (
            <>
              <div>
                <label htmlFor="teacher" className="block text-sm font-medium text-ink">
                  Teacher <span className="text-inkfaint">(optional)</span>
                </label>
                <input
                  id="teacher"
                  value={form.teacher}
                  onChange={(e) => update("teacher", e.target.value)}
                  className="mt-1 w-full rounded-md border border-line px-3 py-2"
                  placeholder="Prof. Smith"
                />
              </div>
              <div>
                <label htmlFor="room" className="block text-sm font-medium text-ink">
                  Room <span className="text-inkfaint">(optional)</span>
                </label>
                <input
                  id="room"
                  value={form.room}
                  onChange={(e) => update("room", e.target.value)}
                  className="mt-1 w-full rounded-md border border-line px-3 py-2"
                  placeholder="Room 204"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-ink">
              Notes <span className="text-inkfaint">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
            />
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