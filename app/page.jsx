"use client";

import { useMemo, useState, useEffect } from "react";
import AuthGuard from "../components/AuthGuard";
import Header from "../components/Header";
import ViewSwitcher from "../components/ViewSwitcher";
import CategoryFilter from "../components/CategoryFilter";
import TodayView from "../components/TodayView";
import WeekView from "../components/WeekView";
import TasksView from "../components/TasksView";
import SubjectsView from "../components/SubjectsView";
import SettingsView from "../components/SettingsView";
import BlockModal from "../components/BlockModal";
import TaskModal from "../components/TaskModal";
import SubjectModal from "../components/SubjectModal";
import QuickAddModal from "../components/QuickAddModal";
import SearchView from "../components/SearchView";
import { useAuth } from "../lib/useAuth";
import { useSchedule } from "../lib/useSchedule";
import { useNotifications } from "../lib/useNotifications";
import { getEventsForDate, getEventsForRange, toISODate, getWeekDates } from "../lib/dateUtils";

function DashboardContent() {
  const { user, signOut } = useAuth();
  const {
    subjects,
    events,
    exceptions,
    tasks,
    settings,
    loading,
    error,
    refresh,
    addEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    cancelOccurrence,
    moveOccurrence,
    updateOccurrence,
    importException,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    addSubject,
    updateSubject,
    deleteSubject,
    updateSettings,
  } = useSchedule(user?.id);

  // Initialize notifications
  useNotifications(user?.id, settings);

  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [view, setView] = useState("today"); // today, week, tasks, subjects, settings
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [weekViewMode, setWeekViewMode] = useState("grid");

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventModalMode, setEventModalMode] = useState("create");
  const [eventModalEvent, setEventModalEvent] = useState(null);
  const [eventModalInitialDate, setEventModalInitialDate] = useState(today);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState("create");
  const [taskModalTask, setTaskModalTask] = useState(null);

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectModalMode, setSubjectModalMode] = useState("create");
  const [subjectModalSubject, setSubjectModalSubject] = useState(null);

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const eventsByDate = useMemo(
    () => getEventsForRange(weekDates, events, exceptions, subjects),
    [weekDates, events, exceptions, subjects]
  );

  const dayEvents = useMemo(
    () => getEventsForDate(selectedDate, events, exceptions, subjects),
    [selectedDate, events, exceptions, subjects]
  );

  const dayTasks = useMemo(
    () => tasks.filter((t) => !t.completed && (!t.due_datetime || toISODate(new Date(t.due_datetime)) === toISODate(selectedDate))),
    [tasks, selectedDate]
  );

  function applyCategoryFilter(events) {
    if (categoryFilter === "all") return events;
    return events.filter((e) => e.category === categoryFilter);
  }

  const filteredDayEvents = applyCategoryFilter(dayEvents);
  const filteredEventsByDate = new Map();
  for (const [date, evts] of eventsByDate) {
    filteredEventsByDate.set(date, applyCategoryFilter(evts));
  }

  function openCreateEvent(date) {
    setEventModalMode("create");
    setEventModalInitialDate(date);
    setEventModalEvent(null);
    setEventModalOpen(true);
  }

  function openEditEvent(event) {
    setEventModalMode("edit");
    setEventModalEvent(event);
    setEventModalOpen(true);
  }

  function openCreateTask() {
    setTaskModalMode("create");
    setTaskModalTask(null);
    setTaskModalOpen(true);
  }

  function openEditTask(task) {
    setTaskModalMode("edit");
    setTaskModalTask(task);
    setTaskModalOpen(true);
  }

  function openCreateSubject() {
    setSubjectModalMode("create");
    setSubjectModalSubject(null);
    setSubjectModalOpen(true);
  }

  function openEditSubject(subject) {
    setSubjectModalMode("edit");
    setSubjectModalSubject(subject);
    setSubjectModalOpen(true);
  }

  function goToday() {
    setSelectedDate(new Date());
    setView("today");
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuickAddOpen(false);
        setEventModalOpen(false);
        setTaskModalOpen(false);
        setSubjectModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function navigate(direction) {
    if (view === "today" || view === "tasks") {
      setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + direction));
    } else if (view === "week") {
      setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + direction * 7));
    }
  }

  const handleQuickAddEvent = async (eventData) => {
    await addEvent(eventData);
    setQuickAddOpen(false);
  };

  const handleQuickAddTask = async (taskData) => {
    await addTask(taskData);
    setQuickAddOpen(false);
  };

  const handleImportData = async (data) => {
    // Import subjects
    for (const subject of data.subjects || []) {
      const { id, created_at, updated_at, user_id, ...rest } = subject;
      await addSubject(rest);
    }
    // Import events
    for (const event of data.events || []) {
      const { id, created_at, updated_at, user_id, ...rest } = event;
      await addEvent(rest);
    }
    // Import exceptions
    for (const exc of data.exceptions || []) {
      const { id, created_at, user_id, ...rest } = exc;
      await importException(rest);
    }
    // Import tasks
    for (const task of data.tasks || []) {
      const { id, created_at, updated_at, user_id, completed_at, ...rest } = task;
      await addTask(rest);
    }
    // Import settings
    if (data.settings) {
      await updateSettings(data.settings);
    }
    // Refresh to reload all data
    refresh();
  };

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
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="rounded-full border border-line p-2 text-inkfaint hover:text-ink hover:bg-surface transition-colors"
            aria-label="Search (⌘K)"
            title="Search (⌘K)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            className="rounded-full bg-ink p-2 text-paper shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Quick add"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-inkfaint">Loading your schedule…</p>
      ) : error ? (
        <p className="mt-8 text-sm text-danger">{error}</p>
      ) : (
        <div className="mt-6">
          {view === "today" && (
            <TodayView
              date={selectedDate}
              today={today}
              events={filteredDayEvents}
              tasks={dayTasks}
              subjects={subjects}
              selectedDate={selectedDate}
              onEventClick={openEditEvent}
              onTaskClick={openEditTask}
              onTaskToggle={toggleTaskComplete}
              onAddEventClick={() => openCreateEvent(selectedDate)}
              onAddTaskClick={openCreateTask}
            />
          )}
          {view === "week" && (
            <WeekView
              weekDates={weekDates}
              today={today}
              eventsByDate={filteredEventsByDate}
              onEventClick={openEditEvent}
              onDayClick={(date) => { setSelectedDate(date); setView("today"); }}
              onAddClick={openCreateEvent}
              viewMode={weekViewMode}
              onViewModeChange={setWeekViewMode}
            />
          )}
          {view === "tasks" && (
            <TasksView
              tasks={tasks}
              onTaskClick={openEditTask}
              onTaskToggle={toggleTaskComplete}
              onAddTaskClick={openCreateTask}
              onTaskDelete={deleteTask}
            />
          )}
          {view === "subjects" && (
            <SubjectsView
              subjects={subjects}
              onAddClick={openCreateSubject}
              onEditClick={openEditSubject}
              onDeleteClick={deleteSubject}
            />
          )}
          {view === "settings" && (
            <SettingsView
              settings={settings}
              onUpdateSettings={updateSettings}
              user={user}
              subjects={subjects}
              events={events}
              exceptions={exceptions}
              tasks={tasks}
              onImportData={handleImportData}
            />
          )}
        </div>
      )}

      <BlockModal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        mode={eventModalMode}
        initialDate={eventModalInitialDate}
        event={eventModalEvent}
        subjects={subjects}
        onCreateEvent={addEvent}
        onUpdateEvent={updateEvent}
        onDeleteEvent={deleteEvent}
        onCancelOccurrence={cancelOccurrence}
        onMoveOccurrence={moveOccurrence}
        onUpdateOccurrence={updateOccurrence}
      />

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        mode={taskModalMode}
        task={taskModalTask}
        subjects={subjects}
        onCreate={addTask}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />

      <SubjectModal
        open={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        mode={subjectModalMode}
        subject={subjectModalSubject}
        onCreate={addSubject}
        onUpdate={updateSubject}
        onDelete={deleteSubject}
      />

      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onAddEvent={handleQuickAddEvent}
        onAddTask={handleQuickAddTask}
      />

      <SearchView
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        events={events}
        subjects={subjects}
        tasks={tasks}
        onEventClick={openEditEvent}
        onTaskClick={openEditTask}
        onSubjectClick={openEditSubject}
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