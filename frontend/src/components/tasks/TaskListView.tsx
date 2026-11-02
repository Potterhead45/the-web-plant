"use client";

import React, { useState } from "react";
import { Task, TaskStatus } from "@/lib/types";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useAppDispatch } from "@/store/hooks";
import { updateTask, deleteTask } from "@/store/slices/tasksSlice";
import { addNotification } from "@/store/slices/uiSlice";
import {
  Calendar,
  Pencil,
  Trash2,
  AlertTriangle,
  Folder,
} from "lucide-react";

interface TaskListViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  showProjectName?: boolean;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onEditTask,
  showProjectName = false,
}) => {
  const dispatch = useAppDispatch();
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await dispatch(
        updateTask({
          id: taskId,
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
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteTask(taskToDelete._id)).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: `Task "${taskToDelete.title}" deleted.`,
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
      setTaskToDelete(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
        No tasks match the selected criteria.
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Status</th>
                {showProjectName && <th className="py-3 px-4">Project</th>}
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {tasks.map((task) => {
                const projectName =
                  typeof task.project === "object" && task.project !== null
                    ? task.project.title
                    : undefined;

                const formattedDate = task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null;

                return (
                  <tr
                    key={task._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Task Title & Description */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-slate-500 line-clamp-1 mt-0.5 text-[11px]">
                          {task.description}
                        </div>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task._id, e.target.value as TaskStatus)
                        }
                        className="text-xs font-medium py-1 px-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>

                    {/* Project Name (if enabled) */}
                    {showProjectName && (
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {projectName ? (
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Folder className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[140px]">{projectName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    )}

                    {/* Due Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {formattedDate ? (
                        <div
                          className={`flex items-center gap-1.5 ${
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
                          <span>{formattedDate}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">No due date</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Task"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"?`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
};
