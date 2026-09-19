"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SettingsView({ 
  settings, 
  onUpdateSettings, 
  user,
  subjects,
  events,
  exceptions,
  tasks,
  onImportData 
}) {
  const [form, setForm] = useState({
    default_view: "today",
    week_starts_on: 1,
    notification_enabled: true,
    default_reminder_minutes: 10,
    theme: "system",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        default_view: settings.default_view || "today",
        week_starts_on: settings.week_starts_on ?? 1,
        notification_enabled: settings.notification_enabled ?? true,
        default_reminder_minutes: settings.default_reminder_minutes ?? 10,
        theme: settings.theme || "system",
      });
    }
  }, [settings]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await onUpdateSettings(form);
      setMessage("Settings saved");
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  function handleExport() {
    const data = {
      version: 1,
      exported_at: new Date().toISOString(),
      subjects: subjects || [],
      events: events || [],
      exceptions: exceptions || [],
      tasks: tasks || [],
      settings: settings || {},
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setMessage("Data exported successfully");
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleImport(e) {
    e.preventDefault();
    if (!importFile) {
      setError("Please select a file first");
      return;
    }
    
    setImporting(true);
    setError(null);
    setMessage(null);
    
    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      
      if (!data.version || !data.subjects || !data.events || !data.tasks) {
        throw new Error("Invalid backup file format");
      }
      
      await onImportData(data);
      setMessage("Data imported successfully");
      setImportFile(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to import data");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-display text-xl font-semibold text-ink">Settings</h2>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <section>
          <h3 className="font-display text-sm font-semibold text-inkfaint uppercase tracking-wide mb-3">
            Appearance
          </h3>
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-ink">
              Theme
            </label>
            <select
              id="theme"
              value={form.theme}
              onChange={(e) => update("theme", e.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 bg-surface"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </section>

        <section>
          <h3 className="font-display text-sm font-semibold text-inkfaint uppercase tracking-wide mb-3">
            Calendar
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="week_starts_on" className="block text-sm font-medium text-ink">
                Week Starts On
              </label>
              <select
                id="week_starts_on"
                value={form.week_starts_on}
                onChange={(e) => update("week_starts_on", Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 bg-surface"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
            <div>
              <label htmlFor="default_view" className="block text-sm font-medium text-ink">
                Default View
              </label>
              <select
                id="default_view"
                value={form.default_view}
                onChange={(e) => update("default_view", e.target.value)}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 bg-surface"
              >
                <option value="today">Today</option>
                <option value="week">Week</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-display text-sm font-semibold text-inkfaint uppercase tracking-wide mb-3">
            Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.notification_enabled}
                onChange={(e) => update("notification_enabled", e.target.checked)}
                className="rounded border-line text-college focus:ring-college"
              />
              <span className="text-sm text-ink">Enable notifications</span>
            </label>
            <div>
              <label htmlFor="default_reminder_minutes" className="block text-sm font-medium text-ink">
                Default Reminder
              </label>
              <select
                id="default_reminder_minutes"
                value={form.default_reminder_minutes}
                onChange={(e) => update("default_reminder_minutes", Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 bg-surface"
                disabled={!form.notification_enabled}
              >
                <option value={0}>At time of event</option>
                <option value={5}>5 minutes before</option>
                <option value={10}>10 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-display text-sm font-semibold text-inkfaint uppercase tracking-wide mb-3">
            Account
          </h3>
          <div className="space-y-2 text-sm text-inkfaint">
            <p>Signed in as: <span className="text-ink">{user?.email || "Unknown"}</span></p>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-danger underline underline-offset-1 hover:no-underline"
            >
              Sign Out
            </button>
          </div>
        </section>

        <section>
          <h3 className="font-display text-sm font-semibold text-inkfaint uppercase tracking-wide mb-3">
            Data Backup & Restore
          </h3>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleExport}
              className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink hover:bg-surface/50 text-left flex items-center justify-between"
            >
              <span>Export Data (JSON)</span>
              <svg className="w-4 h-4 text-inkfaint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            
            <form onSubmit={handleImport} className="space-y-2">
              <div>
                <label htmlFor="import-file" className="block text-sm font-medium text-ink">
                  Import Data (JSON)
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="flex-1 w-full rounded-md border border-line px-3 py-2 text-sm bg-surface file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-college-soft file:text-college hover:file:bg-college/80"
                  />
                </div>
                <p className="mt-1 text-xs text-inkfaint">Select a previously exported JSON backup file</p>
              </div>
              <button
                type="submit"
                disabled={!importFile || importing}
                className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink hover:bg-surface/50 disabled:opacity-50"
              >
                {importing ? "Importing…" : "Import Selected File"}
              </button>
            </form>
          </div>
        </section>

        {error && <p className="text-sm text-danger">{error}</p>}
        {message && <p className="text-sm text-college">{message}</p>}

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}