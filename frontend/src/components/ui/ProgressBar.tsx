import React from "react";

interface ProgressBarProps {
  progress?: number;
  total?: number;
  completed?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  total,
  completed,
  showLabel = true,
  size = "md",
  className = "",
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round(progress)));

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const getBarColor = (pct: number) => {
    if (pct === 100) return "bg-emerald-600";
    if (pct >= 50) return "bg-emerald-500";
    if (pct > 0) return "bg-emerald-400";
    return "bg-slate-300";
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 text-xs text-slate-500 font-medium">
          <span>
            {total !== undefined && completed !== undefined
              ? `${completed} of ${total} tasks completed`
              : "Progress"}
          </span>
          <span className="font-semibold text-slate-700">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor(
            percentage
          )}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
