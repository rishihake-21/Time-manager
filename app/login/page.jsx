"use client";

import { useMemo, useState } from "react";
import AuthGuard from "../components/AuthGuard";
import Header from "../components/Header";
import ViewSwitcher from "../components/ViewSwitcher";
import CategoryFilter from "../components/CategoryFilter";
import DayView from "../components/DayView";
import WeekView from "../components/WeekView";
import MonthView from "../components/MonthView";
import BlockModal from "../components/BlockModal";
import { useAuth } from "../lib/useAuth";
import { useSchedule } from "../lib/useSchedule";
import { getBlocksForDate, getBlocksForRange } from "../lib/scheduleEngine";
import { addDays, getMonthGrid, getWeekDates } from "../lib/dateUtils";

function DashboardContent() {
  const { user, signOut } = useAuth();
  const {
    recurringBlocks,
    exceptions,
    completions,
    loading,
    addRecurringBlock,
    updateRecurringBlock,
    deleteRecurringBlock,
    addException,
    updateException,
    deleteException,
    cancelOccurrence,
    toggleCompletion,
  } = useSchedule(user?.id);

  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [view, setView] = useState("day");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [modalBlock, setModalBlock] = useState(null);
  const [modalInitialDate, setModalInitialDate] = useState(today);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const monthDates = useMemo(() => getMonthGrid(selectedDate), [selectedDate]);

  function applyFilter(blocks) {
    if (categoryFilter === "all") return blocks;
    return blocks.filter((b) => b.category === categoryFilter);
  }

  const dayBlocks = useMemo(
    () => applyFilter(getBlocksForDate(selectedDate, recurringBlocks, exceptions, completions)),
    [selectedDate, recurringBlocks, exceptions, completions, categoryFilter]
  );

  const weekBlocksByDate = useMemo(() => {
    const map = getBlocksForRange(weekDates, recurringBlocks, exceptions, completions);
    for (const [key, blocks] of map) map.set(key, applyFilter(blocks));
    return map;
  }, [weekDates, recurringBlocks, exceptions, completions, categoryFilter]);

  const monthBlocksByDate = useMemo(() => {
    const map = getBlocksForRange(monthDates, recurringBlocks, exceptions, completions);
    for (const [key, blocks] of map) map.set(key, applyFilter(blocks));
    return map;
  }, [monthDates, recurringBlocks, exceptions, completions, categoryFilter]);

  function openCreate(date) {
    setModalMode("create");
    setModalInitialDate(date);
    setModalBlock(null);
    setModalOpen(true);
  }

  function openEdit(block) {
    setModalMode("edit");
    setModalBlock(block);
    setModalOpen(true);
  }

  function goToday() {
    setSelectedDate(new Date());
  }

  function navigate(direction) {
    if (view === "day") setSelectedDate((d) => addDays(d, direction));
    else if (view === "week") setSelectedDate((d) => addDays(d, direction * 7));
    else setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() + direction, 1));
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <Header today={today} selectedDate={selectedDate} onSignOut={signOut} />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <ViewSwitcher view={view} onChange={setView} />
        <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Previous"
          className="rounded-md border border-line px-2.5 py-1 text-sm text-inkfaint hover:text-ink"
        >
          ←
        </button>
        <button
          type="button"
          onClick={goToday}
          className="rounded-md border border-line px-3 py-1 text-sm text-inkfaint hover:text-ink"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => navigate(1)}
          aria-label="Next"
          className="rounded-md border border-line px-2.5 py-1 text-sm text-inkfaint hover:text-ink"
        >
          →
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-inkfaint">Loading your schedule…</p>
      ) : (
        <div className="mt-6">
          {view === "day" && (
            <DayView
              date={selectedDate}
              today={today}
              blocks={dayBlocks}
              onBlockClick={openEdit}
              onAddClick={openCreate}
              onToggleComplete={toggleCompletion}
            />
          )}
          {view === "week" && (
            <WeekView
              weekDates={weekDates}
              today={today}
              blocksByDate={weekBlocksByDate}
              onBlockClick={openEdit}
              onDayClick={(date) => {
                setSelectedDate(date);
                setView("day");
              }}
              onAddClick={openCreate}
              onToggleComplete={toggleCompletion}
            />
          )}
          {view === "month" && (
            <MonthView
              monthDates={monthDates}
              currentMonthDate={selectedDate}
              today={today}
              blocksByDate={monthBlocksByDate}
              onDayClick={(date) => {
                setSelectedDate(date);
                setView("day");
              }}
            />
          )}
        </div>
      )}

      <BlockModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialDate={modalInitialDate}
        block={modalBlock}
        onCreateRecurring={addRecurringBlock}
        onCreateException={addException}
        onUpdateRecurring={updateRecurringBlock}
        onUpdateException={updateException}
        onDeleteRecurring={deleteRecurringBlock}
        onDeleteException={deleteException}
        onCancelOccurrence={cancelOccurrence}
      />
    </main>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
