"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskListView } from "@/components/tasks/TaskListView";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { ProjectFormModal } from "@/components/projects/ProjectFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProjectById, deleteProject } from "@/store/slices/projectsSlice";
import { fetchProjectTasks } from "@/store/slices/tasksSlice";
import { addNotification } from "@/store/slices/uiSlice";
import { Task, TaskStatus } from "@/lib/types";
import {
  ArrowLeft,
  Plus,
  Kanban,
  List,
  Search,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

function ProjectDetailsContent({ projectId }: { projectId: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentProject, loading: projectLoading } = useAppSelector(
    (state) => state.projects
  );
  const { tasks } = useAppSelector((state) => state.tasks);

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dueDateFilter, setDueDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("todo");

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (projectId) {
      dispatch(
        fetchProjectTasks({
          projectId,
          params: {
            search: search.trim() || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
            dueDate: dueDateFilter !== "all" ? dueDateFilter : undefined,
            sortBy,
            order,
          },
        })
      );
    }
  }, [dispatch, projectId, search, statusFilter, dueDateFilter, sortBy, order]);

  const handleOpenAddTask = (initialStatus: TaskStatus = "todo") => {
    setTaskToEdit(null);
    setNewTaskStatus(initialStatus);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteProject = async () => {
    setIsDeletingProject(true);
    try {
      await dispatch(deleteProject(projectId)).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Project deleted successfully.",
        })
      );
      router.push("/projects");
    } catch {
      dispatch(
        addNotification({
          type: "error",
          message: "Failed to delete project.",
        })
      );
    } finally {
      setIsDeletingProject(false);
      setIsDeleteProjectOpen(false);
    }
  };

  if (projectLoading && !currentProject) {
    return (
      <AppLayout>
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading project...</p>
        </div>
      </AppLayout>
    );
  }

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto mt-12">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Project not found</h3>
          <p className="text-xs text-slate-500 mb-6">
            The project you requested might have been deleted or you do not have permission to view it.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </AppLayout>
    );
  }

  const completedCount = tasks.filter((t) => t.status === "done").length;
  const progressPct =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <AppLayout
      title={currentProject.title}
      subtitle="Project Board & Task Tracking"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Edit Project Details"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsDeleteProjectOpen(true)}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200 hover:border-rose-200"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenAddTask("todo")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Back Link & Project Summary Header */}
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Projects
          </Link>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                {currentProject.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {currentProject.description || "No project description provided."}
              </p>
            </div>

            <div className="w-full md:w-72 shrink-0 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
              <ProgressBar
                progress={progressPct}
                total={tasks.length}
                completed={completedCount}
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Filter and View Controls Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tasks by keyword..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-xs sm:text-sm placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Right: Filters, Sorting, and Kanban/List toggle */}
          <div className="flex flex-wrap items-center gap-2">
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

            {/* Sort Dropdown */}
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

            {/* View Mode Toggle Buttons */}
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
            onEditTask={handleOpenEditTask}
          />
        ) : (
          <TaskListView
            tasks={tasks}
            onEditTask={handleOpenEditTask}
          />
        )}
      </div>

      {/* Task Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        projectId={projectId}
        taskToEdit={taskToEdit}
        defaultStatus={newTaskStatus}
        onSuccess={() => {
          dispatch(
            fetchProjectTasks({
              projectId,
              params: {
                search: search.trim() || undefined,
                status: statusFilter !== "all" ? statusFilter : undefined,
                dueDate: dueDateFilter !== "all" ? dueDateFilter : undefined,
                sortBy,
                order,
              },
            })
          );
          dispatch(fetchProjectById(projectId));
        }}
      />

      {/* Edit Project Modal */}
      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projectToEdit={currentProject}
        onSuccess={() => {
          dispatch(fetchProjectById(projectId));
        }}
      />

      {/* Delete Project Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteProjectOpen}
        onClose={() => setIsDeleteProjectOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${currentProject.title}"? All associated tasks will be permanently removed.`}
        confirmText="Delete Project"
        isDestructive={true}
        isLoading={isDeletingProject}
      />
    </AppLayout>
  );
}

function ProjectDetailsInner({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  return <ProjectDetailsContent projectId={unwrappedParams.id} />;
}

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
        </div>
      }
    >
      <ProjectDetailsInner params={params} />
    </Suspense>
  );
}
