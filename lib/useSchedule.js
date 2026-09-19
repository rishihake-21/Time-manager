"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useSchedule(userId) {
  const [subjects, setSubjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [subjRes, evtRes, excRes, taskRes, setRes] = await Promise.all([
        supabase.from("subjects").select("*").order("name", { ascending: true }),
        supabase.from("events").select("*").order("start_datetime", { ascending: true }),
        supabase.from("event_exceptions").select("*").order("occurrence_date", { ascending: true }),
        supabase.from("tasks").select("*").order("due_datetime", { ascending: true, nullsFirst: false }),
        supabase.from("settings").select("*").single(),
      ]);

      if (subjRes.error) throw subjRes.error;
      setSubjects(subjRes.data || []);

      if (evtRes.error) throw evtRes.error;
      setEvents(evtRes.data || []);

      if (excRes.error) throw excRes.error;
      setExceptions(excRes.data || []);

      if (taskRes.error) throw taskRes.error;
      setTasks(taskRes.data || []);

      if (setRes.error && setRes.error.code !== "PGRST116") throw setRes.error;
      setSettings(setRes.data);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("schedule-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subjects", filter: `user_id=eq.${userId}` },
        () => loadAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events", filter: `user_id=eq.${userId}` },
        () => loadAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_exceptions", filter: `user_id=eq.${userId}` },
        () => loadAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` },
        () => loadAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings", filter: `user_id=eq.${userId}` },
        () => loadAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadAll]);

  // Subjects
  const addSubject = useCallback(async (subject) => {
    const { error: err } = await supabase.from("subjects").insert([{ ...subject, user_id: userId }]);
    if (err) throw err;
  }, [userId]);

  const updateSubject = useCallback(async (id, updates) => {
    const { error: err } = await supabase.from("subjects").update(updates).eq("id", id);
    if (err) throw err;
  }, []);

  const deleteSubject = useCallback(async (id) => {
    const { error: err } = await supabase.from("subjects").delete().eq("id", id);
    if (err) throw err;
  }, []);

  // Events
  const addEvent = useCallback(async (event) => {
    const { error: err } = await supabase.from("events").insert([{ ...event, user_id: userId }]);
    if (err) throw err;
  }, [userId]);

  const updateEvent = useCallback(async (id, updates) => {
    const { error: err } = await supabase.from("events").update(updates).eq("id", id);
    if (err) throw err;
  }, []);

  const deleteEvent = useCallback(async (id) => {
    const { error: err } = await supabase.from("events").delete().eq("id", id);
    if (err) throw err;
  }, []);

  const updateEventStatus = useCallback(async (id, status) => {
    const updates = { status };
    if (status === "completed") updates.completed_at = new Date().toISOString();
    const { error: err } = await supabase.from("events").update(updates).eq("id", id);
    if (err) throw err;
  }, []);

  // Event exceptions
  const addException = useCallback(async (exception) => {
    const { error: err } = await supabase.from("event_exceptions").insert([{ ...exception, user_id: userId }]);
    if (err) throw err;
  }, [userId]);

  const updateException = useCallback(async (id, updates) => {
    const { error: err } = await supabase.from("event_exceptions").update(updates).eq("id", id);
    if (err) throw err;
  }, []);

  const deleteException = useCallback(async (id) => {
    const { error: err } = await supabase.from("event_exceptions").delete().eq("id", id);
    if (err) throw err;
  }, []);

  const cancelOccurrence = useCallback(async (eventId, occurrenceDate) => {
    const { error: err } = await supabase.from("event_exceptions").insert([
      {
        user_id: userId,
        event_id: eventId,
        occurrence_date: occurrenceDate,
        action: "cancel",
      },
    ]);
    if (err) throw err;
  }, [userId]);

  const moveOccurrence = useCallback(async (eventId, occurrenceDate, newStart, newEnd) => {
    const { error: err } = await supabase.from("event_exceptions").insert([
      {
        user_id: userId,
        event_id: eventId,
        occurrence_date: occurrenceDate,
        action: "move",
        replacement_start: newStart.toISOString(),
        replacement_end: newEnd.toISOString(),
      },
    ]);
    if (err) throw err;
  }, [userId]);

  const updateOccurrence = useCallback(async (eventId, occurrenceDate, updates) => {
    const { error: err } = await supabase.from("event_exceptions").insert([
      {
        user_id: userId,
        event_id: eventId,
        occurrence_date: occurrenceDate,
        action: "update",
        replacement_title: updates.title,
        replacement_location: updates.location,
        replacement_notes: updates.notes,
      },
    ]);
    if (err) throw err;
  }, [userId]);

  // Import exceptions (for backup restore)
  const importException = useCallback(async (exception) => {
    const { error: err } = await supabase.from("event_exceptions").insert([{ ...exception, user_id: userId }]);
    if (err) throw err;
  }, [userId]);

  // Tasks
  const addTask = useCallback(async (task) => {
    const { error: err } = await supabase.from("tasks").insert([{ ...task, user_id: userId }]);
    if (err) throw err;
  }, [userId]);

  const updateTask = useCallback(async (id, updates) => {
    const { error: err } = await supabase.from("tasks").update(updates).eq("id", id);
    if (err) throw err;
  }, []);

  const deleteTask = useCallback(async (id) => {
    const { error: err } = await supabase.from("tasks").delete().eq("id", id);
    if (err) throw err;
  }, []);

  const toggleTaskComplete = useCallback(async (id, completed) => {
    const updates = { completed };
    if (completed) updates.completed_at = new Date().toISOString();
    else updates.completed_at = null;
    const { error: err } = await supabase.from("tasks").update(updates).eq("id", id);
    if (err) throw err;
  }, []);

  // Settings
  const updateSettings = useCallback(async (updates) => {
    const { error: err } = await supabase.from("settings").upsert([{ user_id: userId, ...updates }]);
    if (err) throw err;
  }, [userId]);

  return {
    subjects,
    events,
    exceptions,
    tasks,
    settings,
    loading,
    error,
    refresh: loadAll,
    // Subjects
    addSubject,
    updateSubject,
    deleteSubject,
    // Events
    addEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    // Exceptions
    addException,
    updateException,
    deleteException,
    cancelOccurrence,
    moveOccurrence,
    updateOccurrence,
    importException,
    // Tasks
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    // Settings
    updateSettings,
  };
}