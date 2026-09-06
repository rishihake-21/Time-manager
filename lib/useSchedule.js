"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useSchedule(userId) {
  const [recurringBlocks, setRecurringBlocks] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [rb, ex] = await Promise.all([
      supabase
        .from("recurring_blocks")
        .select("*")
        .order("start_time", { ascending: true }),
      supabase
        .from("date_exceptions")
        .select("*")
        .order("start_time", { ascending: true }),
    ]);

    if (rb.error) setError(rb.error.message);
    else setRecurringBlocks(rb.data);

    if (ex.error) setError(ex.error.message);
    else setExceptions(ex.data);

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Real-time: reflect changes instantly, including from other devices/tabs.
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("schedule-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recurring_blocks", filter: `user_id=eq.${userId}` },
        () => loadAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "date_exceptions", filter: `user_id=eq.${userId}` },
        () => loadAll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadAll]);

  const addRecurringBlock = useCallback(
    async (block) => {
      const { error: err } = await supabase
        .from("recurring_blocks")
        .insert([{ ...block, user_id: userId }]);
      if (err) throw err;
    },
    [userId]
  );

  const updateRecurringBlock = useCallback(async (id, updates) => {
    const { error: err } = await supabase
      .from("recurring_blocks")
      .update(updates)
      .eq("id", id);
    if (err) throw err;
  }, []);

  const deleteRecurringBlock = useCallback(async (id) => {
    const { error: err } = await supabase
      .from("recurring_blocks")
      .delete()
      .eq("id", id);
    if (err) throw err;
  }, []);

  const addException = useCallback(
    async (exception) => {
      const { error: err } = await supabase
        .from("date_exceptions")
        .insert([{ ...exception, user_id: userId }]);
      if (err) throw err;
    },
    [userId]
  );

  const updateException = useCallback(async (id, updates) => {
    const { error: err } = await supabase
      .from("date_exceptions")
      .update(updates)
      .eq("id", id);
    if (err) throw err;
  }, []);

  const deleteException = useCallback(async (id) => {
    const { error: err } = await supabase
      .from("date_exceptions")
      .delete()
      .eq("id", id);
    if (err) throw err;
  }, []);

  /** Cancel a single occurrence of a recurring block on a given date. */
  const cancelOccurrence = useCallback(
    async (recurringBlockId, isoDate) => {
      const { error: err } = await supabase.from("date_exceptions").insert([
        {
          user_id: userId,
          exception_date: isoDate,
          type: "cancel",
          recurring_block_id: recurringBlockId,
        },
      ]);
      if (err) throw err;
    },
    [userId]
  );

  return {
    recurringBlocks,
    exceptions,
    loading,
    error,
    refresh: loadAll,
    addRecurringBlock,
    updateRecurringBlock,
    deleteRecurringBlock,
    addException,
    updateException,
    deleteException,
    cancelOccurrence,
  };
}
