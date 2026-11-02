"use client";

import React, { useState } from "react";
import { Task, TaskStatus } from "@/lib/types";
import { StatusBadge } from "../ui/Badge";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useAppDispatch } from "@/store/hooks";
import { updateTask, deleteTask, optimisticStatusChange } from "@/store/slices/tasksSlice";
import { addNotification } from "@/store/slices/uiSlice";
import {
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  showProjectName?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  showProjectName = false,
}) => {
  const dispatch = useAppDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setShowMenu(false);
    if (task.status === newStatus) return;

    // Optimistic UI update
    dispatch(optimisticStatusChange({ id: task._id, status: newStatus }));

    try {
      await dispatch(
        updateTask({
          id: task._id,
          data: { status: newStatus },
        })
      ).unwrap();
    } catch {
      dispatch(
        addNotification({
          type: "error",
          message: "Failed to update task status.",
        })
      );
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteTask(task._id)).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: `Task "${task.title}" deleted.`,
        })
      );
    } catch {
      dispatch(
        addNotification({
          type: "error",
          message: "Failed to delete task.",
        })
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const projectName =
    typeof task.project === "object" && task.project !== null
      ? task.project.title
      : undefined;

  let formattedDate: string | null = null;
  if (task.dueDate) {
    formattedDate = new Date(task.dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <>
      <div className="group relative bg-white rounded-xl border border-slate-200/90 hover:border-emerald-700/40 p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col gap-2.5">
        {/* Header: Project tag + Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={task.status} isOverdue={task.isOverdue} size="sm" />
            {showProjectName && projectName && (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[130px]">
                {projectName}
              </span>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 text-xs">
                  <div className="px-3 py-1 font-semibold text-slate-400 text-[10px] uppercase tracking-wider">
                    Move to
                  </div>
                  <button
                    onClick={() => handleStatusChange("todo")}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 ${
                      task.status === "todo" ? "font-semibold text-emerald-700" : ""
                    }`}
                  >
                    <Circle className="w-3 h-3 text-slate-400" />
                    To Do
                  </button>
                  <button
                    onClick={() => handleStatusChange("in-progress")}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 ${
                      task.status === "in-progress" ? "font-semibold text-amber-700" : ""
                    }`}
                  >
                    <Clock className="w-3 h-3 text-amber-500" />
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange("done")}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 ${
                      task.status === "done" ? "font-semibold text-emerald-700" : ""
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Done
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(task);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Pencil className="w-3 h-3 text-slate-400" />
                    Edit Task
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-medium"
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                    Delete Task
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h4
          className={`text-sm font-semibold text-slate-900 leading-snug line-clamp-2 ${
            task.status === "done" ? "line-through text-slate-400" : ""
          }`}
        >
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Footer: Due date */}
        {formattedDate && (
          <div
            className={`mt-1 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium ${
              task.isOverdue && task.status !== "done"
                ? "text-rose-600 font-semibold"
                : "text-slate-500"
            }`}
          >
            {task.isOverdue && task.status !== "done" ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Due {formattedDate}</span>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"?`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
};
