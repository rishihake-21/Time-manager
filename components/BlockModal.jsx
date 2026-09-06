"use client";

import { useEffect, useState } from "react";
import { DAY_NAMES, parseISODate, toISODate } from "../lib/dateUtils";

const emptyForm = {
  category: "college",
  title: "",
  start_time: "09:00",
  end_time: "10:00",
  location: "",
  notes: "",
};

/**
 * A single modal that covers both cases:
 *  - Creating a new block, either as a weekly recurring slot or as a
 *    one-time entry that applies to just the clicked date.
 *  - Editing an existing block. If it came from the recurring pattern you
 *    can save changes to every future week, cancel just this one occurrence,
 *    or delete the recurring slot entirely. One-time entries can be edited
 *    or deleted outright.
 */
export default function BlockModal({
  open,
  onClose,
  mode,
  initialDate,
  block,
  onCreateRecurring,
  onCreateException,
  onUpdateRecurring,
  onUpdateException,
  onDeleteRecurring,
  onDeleteException,
  onCancelOccurrence,
}) {
  const [scope, setScope] = useState("recurring"); // "recurring" | "once"
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === "edit" && block) {
      setScope(block.source === "recurring" ? "recurring" : "once");
      setForm({
        category: block.category,
        title: block.title,
        start_time: block.start_time?.slice(0, 5) ?? "09:00",
        end_time: block.end_time?.slice(0, 5) ?? "10:00",
        location: block.location || "",
        notes: block.notes || "",
      });
    } else {
      setScope("recurring");
      setForm(emptyForm);
    }
  }, [open, mode, block]);

  if (!open) return null;

  const dayOfWeek = initialDate ? initialDate.getDay() : block ? parseISODate(block.date).getDay() : 1;
  const isoDate = initialDate ? toISODate(initialDate) : block?.date;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (form.start_time >= form.end_time) {
      setError("End time must be after start time.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        if (scope === "recurring") {
          await onCreateRecurring({ ...form, day_of_week: dayOfWeek });
        } else {
          await onCreateException({ ...form, exception_date: isoDate, type: "add" });
        }
      } else if (block.source === "recurring") {
        await onUpdateRecurring(block.id, form);
      } else {
        await onUpdateException(block.id, form);
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
      if (block.source === "recurring") {
        await onDeleteRecurring(block.id);
      } else {
        await onDeleteException(block.id);
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
      await onCancelOccurrence(block.id, block.date);
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-xl border border-line bg-surface p-5 shadow-lg sm:rounded-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">
            {mode === "create" ? "New block" : "Edit block"}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-inkfaint">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {mode === "create" && (
            <div>
              <span className="block text-sm font-medium text-ink">Repeats</span>
              <div className="mt-1 inline-flex rounded-md border border-line p-1">
                <button
                  type="button"
                  onClick={() => setScope("recurring")}
                  className={`rounded px-3 py-1 text-sm ${scope === "recurring" ? "bg-ink text-paper" : "text-inkfaint"}`}
                >
                  Every {DAY_NAMES[dayOfWeek]}
                </button>
                <button
                  type="button"
                  onClick={() => setScope("once")}
                  className={`rounded px-3 py-1 text-sm ${scope === "once" ? "bg-ink text-paper" : "text-inkfaint"}`}
                >
                  Just this day
                </button>
              </div>
            </div>
          )}

          <div>
            <span className="block text-sm font-medium text-ink">Category</span>
            <div className="mt-1 inline-flex rounded-md border border-line p-1">
              <button
                type="button"
                onClick={() => update("category", "college")}
                className={`rounded px-3 py-1 text-sm ${form.category === "college" ? "bg-college text-white" : "text-inkfaint"}`}
              >
                College
              </button>
              <button
                type="button"
                onClick={() => update("category", "personal")}
                className={`rounded px-3 py-1 text-sm ${form.category === "personal" ? "bg-personal text-white" : "text-inkfaint"}`}
              >
                Personal
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-ink">
              Title
            </label>
            <input
              id="title"
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-surfaceRaised px-3 py-2 text-ink"
              placeholder="Data Structures Lecture"
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
                className="mt-1 w-full rounded-md border border-line bg-surfaceRaised px-3 py-2 text-ink"
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
                className="mt-1 w-full rounded-md border border-line bg-surfaceRaised px-3 py-2 text-ink"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-ink">
              Location <span className="text-inkfaint">(optional)</span>
            </label>
            <input
              id="location"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-surfaceRaised px-3 py-2 text-ink"
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
              className="mt-1 w-full rounded-md border border-line bg-surfaceRaised px-3 py-2 text-ink"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-college px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>

            {mode === "edit" && block?.source === "recurring" && (
              <button
                type="button"
                onClick={handleCancelOccurrence}
                disabled={saving}
                className="rounded-md border border-line px-3 py-2 text-sm text-inkfaint"
              >
                Skip just this day
              </button>
            )}

            {mode === "edit" && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="ml-auto rounded-md px-3 py-2 text-sm text-danger"
              >
                {block?.source === "recurring" ? "Delete forever" : "Delete"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
