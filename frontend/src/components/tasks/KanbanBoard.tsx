"use client";

import React from "react";
import { Task, TaskStatus } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Plus, Circle, Clock, CheckCircle2 } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { updateTask, optimisticStatusChange } from "@/store/slices/tasksSlice";
import { addNotification } from "@/store/slices/uiSlice";

interface KanbanBoardProps {
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  showProjectName?: boolean;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onAddTask,
  onEditTask,
  showProjectName = false,
}) => {
  const dispatch = useAppDispatch();

  const columns: Array<{
    id: TaskStatus;
    title: string;
    icon: React.ReactNode;
    colorClasses: string;
    badgeClasses: string;
  }> = [
    {
      id: "todo",
      title: "To Do",
      icon: <Circle className="w-4 h-4 text-slate-500" />,
      colorClasses: "border-slate-200 bg-slate-50/70",
      badgeClasses: "bg-slate-200/80 text-slate-700",
    },
    {
      id: "in-progress",
      title: "In Progress",
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      colorClasses: "border-amber-200/60 bg-amber-50/30",
      badgeClasses: "bg-amber-100 text-amber-800",
    },
    {
      id: "done",
      title: "Done",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      colorClasses: "border-emerald-200/60 bg-emerald-50/30",
      badgeClasses: "bg-emerald-100 text-emerald-800",
    },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === targetStatus) return;

    dispatch(optimisticStatusChange({ id: taskId, status: targetStatus }));

    try {
      await dispatch(
        updateTask({
          id: taskId,
          data: { status: targetStatus },
        })
      ).unwrap();
    } catch {
      dispatch(
        addNotification({
          type: "error",
          message: "Failed to move task.",
        })
      );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-2xl border p-4 min-h-[500px] transition-colors ${col.colorClasses}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                {col.icon}
                <h3 className="font-bold text-sm text-slate-800">{col.title}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${col.badgeClasses}`}
                >
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onAddTask(col.id)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors"
                title={`Add task to ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards in Column */}
            <div className="flex flex-col gap-3 flex-1">
              {columnTasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", task._id);
                  }}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TaskCard
                    task={task}
                    onEdit={onEditTask}
                    showProjectName={showProjectName}
                  />
                </div>
              ))}

              {columnTasks.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 rounded-xl bg-white/40 min-h-[140px]">
                  <p className="text-xs text-slate-400 mb-2">No tasks in {col.title}</p>
                  <button
                    onClick={() => onAddTask(col.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add task
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
