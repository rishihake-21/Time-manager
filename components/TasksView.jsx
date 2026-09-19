"use client";

import { useState } from "react";
import { formatDateShort, getPriorityLabel, getPriorityColor, CATEGORY_COLORS } from "../lib/dateUtils";
import TaskCard from "./TaskCard";

const TABS = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

export default function TasksView({ tasks, onTaskClick, onTaskToggle, onAddTaskClick, onTaskDelete }) {
  const [activeTab, setActiveTab] = useState("today");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "completed") return task.completed;
    if (activeTab === "today") {
      if (task.completed) return false;
      if (!task.due_datetime) return true; // No due date = show in today
      const dueDate = new Date(task.due_datetime);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate <= today;
    }
    // upcoming
    if (task.completed) return false;
    if (!task.due_datetime) return false;
    const dueDate = new Date(task.due_datetime);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate > today;
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Tasks</h2>
        <button
          type="button"
          onClick={onAddTaskClick}
          className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper"
        >
          + Add Task
        </button>
      </div>

      <div className="mt-4 inline-flex rounded-md border border-line bg-surface p-1" role="tablist">
        {TABS.map((tab) => {
          const count = tasks.filter((t) => {
            if (tab.id === "completed") return t.completed;
            if (tab.id === "today") {
              if (t.completed) return false;
              if (!t.due_datetime) return true;
              const due = new Date(t.due_datetime);
              due.setHours(0, 0, 0, 0);
              return due <= today;
            }
            if (tab.id === "upcoming") {
              if (t.completed) return false;
              if (!t.due_datetime) return false;
              const due = new Date(t.due_datetime);
              due.setHours(0, 0, 0, 0);
              return due > today;
            }
            return false;
          }).length;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-ink text-paper"
                  : "text-inkfaint hover:text-ink"
              }`}
            >
              {tab.label} {count > 0 && <span className="ml-1 text-xs text-inkfaint">({count})</span>}
            </button>
          );
        })}
      </div>

      {filteredTasks.length === 0 ? (
        <p className="mt-8 text-sm text-inkfaint text-center">
          {activeTab === "completed"
            ? "No completed tasks yet."
            : activeTab === "today"
            ? "No tasks for today. Add a task to get started."
            : "No upcoming tasks."}
        </p>
      ) : (
        <ul className="mt-4 space-y-2" role="tabpanel">
          {filteredTasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                onClick={onTaskClick}
                onToggle={onTaskToggle}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}