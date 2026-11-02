import React from "react";
import { TaskStatus } from "@/lib/types";
import { Clock, CheckCircle2, Circle, AlertTriangle } from "lucide-react";

interface BadgeProps {
  status?: TaskStatus;
  isOverdue?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<BadgeProps> = ({
  status,
  isOverdue = false,
  className = "",
  size = "md",
}) => {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  if (isOverdue && status !== "done") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 font-medium ${sizeClasses} ${className}`}
      >
        <AlertTriangle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
        Overdue
      </span>
    );
  }

  switch (status) {
    case "done":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium ${sizeClasses} ${className}`}
        >
          <CheckCircle2 className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Done
        </span>
      );
    case "in-progress":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 font-medium ${sizeClasses} ${className}`}
        >
          <Clock className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
          In Progress
        </span>
      );
    case "todo":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium ${sizeClasses} ${className}`}
        >
          <Circle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
          To Do
        </span>
      );
  }
};
