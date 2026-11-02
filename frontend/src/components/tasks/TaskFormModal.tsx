"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createTask, updateTask } from "@/store/slices/tasksSlice";
import { addNotification } from "@/store/slices/uiSlice";
import { Task, TaskStatus } from "@/lib/types";
import { Loader2, Calendar } from "lucide-react";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  taskToEdit?: Task | null;
  defaultStatus?: TaskStatus;
  onSuccess?: (task: Task) => void;
}

const TaskFormContent: React.FC<{
  projectId: string;
  taskToEdit?: Task | null;
  defaultStatus: TaskStatus;
  onClose: () => void;
  onSuccess?: (task: Task) => void;
}> = ({ projectId, taskToEdit, defaultStatus, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { actionLoading } = useAppSelector((state) => state.tasks);

  const initialDueDate = taskToEdit?.dueDate
    ? new Date(taskToEdit.dueDate).toISOString().split("T")[0]
    : "";

  const [title, setTitle] = useState(taskToEdit?.title || "");
  const [description, setDescription] = useState(taskToEdit?.description || "");
  const [status, setStatus] = useState<TaskStatus>(taskToEdit?.status || defaultStatus);
  const [dueDate, setDueDate] = useState<string>(initialDueDate);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      const formattedDueDate = dueDate ? new Date(dueDate).toISOString() : null;

      if (taskToEdit) {
        const result = await dispatch(
          updateTask({
            id: taskToEdit._id,
            data: {
              title: title.trim(),
              description: description.trim(),
              status,
              dueDate: formattedDueDate,
            },
          })
        ).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: "Task updated successfully.",
          })
        );
        onSuccess?.(result);
      } else {
        const result = await dispatch(
          createTask({
            projectId,
            data: {
              title: title.trim(),
              description: description.trim(),
              status,
              dueDate: formattedDueDate,
            },
          })
        ).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: "Task created successfully.",
          })
        );
        onSuccess?.(result);
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to save task");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Task Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          placeholder="e.g., Design user onboarding wireframes"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm transition-all placeholder:text-slate-400"
          maxLength={200}
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Description <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add relevant notes, checklist items or requirements..."
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm transition-all placeholder:text-slate-400 resize-none"
          maxLength={2000}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm bg-white"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Due Date <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm bg-white"
            />
            {!dueDate && (
              <div className="absolute right-3.5 top-3 pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
            )}
          </div>
          {dueDate && (
            <button
              type="button"
              onClick={() => setDueDate("")}
              className="text-[11px] text-slate-500 hover:text-slate-800 mt-1 inline-block"
            >
              Clear date
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={actionLoading}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={actionLoading || !title.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-medium shadow-xs transition-colors disabled:opacity-50"
        >
          {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {taskToEdit ? "Save Task" : "Create Task"}
        </button>
      </div>
    </form>
  );
};

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  projectId,
  taskToEdit,
  defaultStatus = "todo",
  onSuccess,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? "Edit Task" : "Create New Task"}
      description={
        taskToEdit
          ? "Update details, status, or deadline for this task."
          : "Add a task to keep work structured and trackable."
      }
      maxWidth="md"
    >
      <TaskFormContent
        key={`${isOpen}-${taskToEdit?._id || "new"}`}
        projectId={projectId}
        taskToEdit={taskToEdit}
        defaultStatus={defaultStatus}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
};
