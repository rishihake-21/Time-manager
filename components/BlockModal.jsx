"use client";

import { useEffect, useState } from "react";
import { DAY_NAMES, parseISODate, toISODate, parseRecurrenceRule } from "../lib/dateUtils";

const CATEGORIES = [
  { id: "college", label: "College" },
  { id: "study", label: "Study" },
  { id: "project", label: "Project" },
  { id: "personal", label: "Personal" },
  { id: "exercise", label: "Exercise" },
  { id: "other", label: "Other" },
];

const emptyForm = {
  category: "college",
  title: "",
  start_time: "09:00",
  end_time: "10:00",
  location: "",
  notes: "",
  subject_id: "",
  recurrence_rule: "",
  recurrence_end: "",
};

export default function BlockModal({
  open,
  onClose,
  mode,
  initialDate,
  event,
  subjects,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onCancelOccurrence,
  onMoveOccurrence,
  onUpdateOccurrence,
}) {
  const [scope, setScope] = useState("recurring"); // "recurring" | "once"
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showRecurrence, setShowRecurrence] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === "edit" && event) {
      const isRecurring = !!event.recurrence_rule;
      setScope(isRecurring ? "recurring" : "once");
      setShowRecurrence(isRecurring);
      setForm({
        category: event.category,
        title: event.title,
        start_time: event.start_datetime.toTimeString().slice(0, 5),
        end_time: event.end_datetime.toTimeString().slice(0, 5),
        location: event.location || "",
        notes: event.description || "",
        subject_id: event.subject_id || "",
        recurrence_rule: event.recurrence_rule || "",
        recurrence_end: event.recurrence_end ? toISODate(new Date(event.recurrence_end)) : "",
      });
    } else {
      setScope("recurring");
      setShowRecurrence(true);
      setForm(emptyForm);
    }
  }, [open, mode, event]);

  if (!open) return null;

  const dayOfWeek = initialDate ? initialDate.getDay() : event ? new Date(event.start_datetime).getDay() : 1;
  const isoDate = initialDate ? toISODate(initialDate) : event ? toISODate(new Date(event.start_datetime)) : toISODate(new Date());

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function buildRecurrenceRule() {
    // This will be set by the day checkboxes
    return form.recurrence_rule;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (form.start_time >= form.end_time) {
      setError("End time must be after start time.");
      return;
    }
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const startDt = new Date(`${isoDate}T${form.start_time}:00`);
      const endDt = new Date(`${isoDate}T${form.end_time}:00`);

      const payload = {
        category: form.category,
        title: form.title.trim(),
        start_datetime: startDt.toISOString(),
        end_datetime: endDt.toISOString(),
        location: form.location.trim() || null,
        description: form.notes.trim() || null,
        subject_id: form.subject_id || null,
        recurrence_rule: scope === "recurring" && form.recurrence_rule ? form.recurrence_rule : null,
        recurrence_end: scope === "recurring" && form.recurrence_end ? new Date(`${form.recurrence_end}T23:59:59`).toISOString() : null,
        status: "scheduled",
      };

      if (mode === "create") {
        if (scope === "recurring") {
          await onCreateEvent(payload);
        } else {
          await onCreateEvent({ ...payload, recurrence_rule: null, recurrence_end: null });
        }
      } else if (event.isRecurring) {
        await onUpdateEvent(event.id, payload);
      } else {
        await onUpdateEvent(event.id, payload);
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
      if (event.isRecurring) {
        await onDeleteEvent(event.id);
      } else {
        await onDeleteEvent(event.id);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelOccurrence() {
    setSaving(true);
    setError(null);
    try {
      await onCancelOccurrence(event.id, isoDate);
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  // Handle day checkboxes for recurrence
  function toggleDay(day) {
    const days = parseRecurrenceRule(form.recurrence_rule);
    const newDays = days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort((a, b) => a - b);
    const dayCodes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    const rule = newDays.length > 0 ? `FREQ=WEEKLY;BYDAY=${newDays.map(d => dayCodes[d]).join(",")}` : "";
    update("recurrence_rule", rule);
  }

  function dayChecked(day) {
    return parseRecurrenceRule(form.recurrence_rule).includes(day);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-xl bg-surface p-5 shadow-lg sm:rounded-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">
            {mode === "create" ? "New Event" : "Edit Event"}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-inkfaint">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {mode === "create" && (
            <div>
              <span className="block text-sm font-medium text-ink">Type</span>
              <div className="mt-1 inline-flex rounded-md border border-line p-1">
                <button
                  type="button"
                  onClick={() => { setScope("recurring"); setShowRecurrence(true); }}
                  className={`rounded px-3 py-1 text-sm ${scope === "recurring" ? "bg-ink text-paper" : "text-inkfaint"}`}
                >
                  Recurring
                </button>
                <button
                  type="button"
                  onClick={() => { setScope("once"); setShowRecurrence(false); }}
                  className={`rounded px-3 py-1 text-sm ${scope === "once" ? "bg-ink text-paper" : "text-inkfaint"}`}
                >
                  One-time
                </button>
              </div>
            </div>
          )}

          <div>
            <span className="block text-sm font-medium text-ink">Category</span>
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

          {form.category === "study" || form.category === "project" ? (
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
                {subjects
                  .filter((s) => s.category === (form.category === "study" ? "study" : "project"))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          ) : null}

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
              placeholder={form.category === "college" ? "Data Structures Lecture" : "Study Session"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-ink">
                Start
              </label>
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
              <label htmlFor="end_time" className="block text-sm font-medium text-ink">
                End
              </label>
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

          {showRecurrence && (
            <div>
              <div className="flex items-center justify-between">
                <span className="block text-sm font-medium text-ink">Repeats Weekly</span>
                <label className="inline-flex items-center gap-1.5 text-sm text-inkfaint">
                  <input
                    type="checkbox"
                    checked={form.recurrence_rule !== ""}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const dayCodes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
                        update("recurrence_rule", `FREQ=WEEKLY;BYDAY=${dayCodes[dayOfWeek]}`);
                      } else {
                        update("recurrence_rule", "");
                      }
                    }}
                    className="rounded border-line text-college focus:ring-college"
                  />
                  Enable
                </label>
              </div>
              {form.recurrence_rule && (
                <div className="mt-2">
                  <span className="block text-sm font-medium text-ink">On Days</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {DAY_NAMES.map((day, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          dayChecked(i)
                            ? "bg-college text-white"
                            : "bg-surface text-inkfaint hover:text-ink border border-line"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <label htmlFor="recurrence_end" className="block text-sm font-medium text-ink">
                      Until <span className="text-inkfaint">(optional)</span>
                    </label>
                    <input
                      id="recurrence_end"
                      type="date"
                      value={form.recurrence_end}
                      onChange={(e) => update("recurrence_end", e.target.value)}
                      className="mt-1 w-full rounded-md border border-line px-3 py-2"
                      min={toISODate(new Date())}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-ink">
              Location <span className="text-inkfaint">(optional)</span>
            </label>
            <input
              id="location"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="Room 204"
            />
          </div>

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

            {mode === "edit" && event.isRecurring && (
              <button
                type="button"
                onClick={handleCancelOccurrence}
                disabled={saving}
                className="rounded-md border border-line px-3 py-2 text-sm text-inkfaint"
              >
                Cancel Just This Occurrence
              </button>
            )}

            {mode === "edit" && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="ml-auto rounded-md px-3 py-2 text-sm text-danger"
              >
                {event.isRecurring ? "Delete Series" : "Delete"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}