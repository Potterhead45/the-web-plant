"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskListView } from "@/components/tasks/TaskListView";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTasks } from "@/store/slices/tasksSlice";
import { fetchProjects } from "@/store/slices/projectsSlice";
import { Task, TaskStatus } from "@/lib/types";
import {
  Plus,
  Kanban,
  List,
  Search,
} from "lucide-react";

export default function AllTasksPage() {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector((state) => state.tasks);
  const { projects } = useAppSelector((state) => state.projects);

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dueDateFilter, setDueDateFilter] = useState<string>("all");
  const [projectIdFilter, setProjectIdFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>("");
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchTasks({
        search: search.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        dueDate: dueDateFilter !== "all" ? dueDateFilter : undefined,
        projectId: projectIdFilter !== "all" ? projectIdFilter : undefined,
        sortBy,
        order,
      })
    );
  }, [
    dispatch,
    search,
    statusFilter,
    dueDateFilter,
    projectIdFilter,
    sortBy,
    order,
  ]);

  const handleOpenAddTask = (status: TaskStatus = "todo") => {
    if (projects.length === 0) {
      alert("Please create a project first before adding tasks.");
      return;
    }
    const selected = projectIdFilter !== "all" ? projectIdFilter : projects[0]._id;
    setTargetProjectId(selected);
    setDefaultStatus(status);
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    const pId = typeof task.project === "object" ? task.project._id : task.project;
    setTargetProjectId(pId);
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  return (
    <AppLayout
      title="All Tasks"
      subtitle="Cross-project task management and scheduling"
      actions={
        <button
          onClick={() => handleOpenAddTask("todo")}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tasks across all projects..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-xs sm:text-sm placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Filters & Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Project Filter */}
            <select
              value={projectIdFilter}
              onChange={(e) => setProjectIdFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 max-w-[160px]"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            {/* Due Date Filter */}
            <select
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="all">All Dates</option>
              <option value="overdue">Overdue Only</option>
              <option value="today">Due Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="has-due-date">Has Due Date</option>
              <option value="no-due-date">No Due Date</option>
            </select>

            {/* Sort Options */}
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [newSortBy, newOrder] = e.target.value.split("-") as [
                  string,
                  "asc" | "desc"
                ];
                setSortBy(newSortBy);
                setOrder(newOrder);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "kanban"
                    ? "bg-white text-emerald-800 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "list"
                    ? "bg-white text-emerald-800 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Board or List View */}
        {viewMode === "kanban" ? (
          <KanbanBoard
            tasks={tasks}
            onAddTask={handleOpenAddTask}
            onEditTask={handleEditTask}
            showProjectName={true}
          />
        ) : (
          <TaskListView
            tasks={tasks}
            onEditTask={handleEditTask}
            showProjectName={true}
          />
        )}
      </div>

      {targetProjectId && (
        <TaskFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setTaskToEdit(null);
          }}
          projectId={targetProjectId}
          taskToEdit={taskToEdit}
          defaultStatus={defaultStatus}
          onSuccess={() => {
            dispatch(
              fetchTasks({
                search: search.trim() || undefined,
                status: statusFilter !== "all" ? statusFilter : undefined,
                dueDate: dueDateFilter !== "all" ? dueDateFilter : undefined,
                projectId: projectIdFilter !== "all" ? projectIdFilter : undefined,
                sortBy,
                order,
              })
            );
          }}
        />
      )}
    </AppLayout>
  );
}
