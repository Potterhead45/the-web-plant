import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgClasses?: string;
  badge?: {
    text: string;
    variant?: "success" | "warning" | "danger" | "neutral";
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgClasses = "bg-emerald-50 text-emerald-800",
  badge,
}) => {
  const badgeClasses = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 border-amber-200/80",
    danger: "bg-rose-50 text-rose-700 border-rose-200/80",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBgClasses}`}>
          {icon}
        </div>
        {badge && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              badgeClasses[badge.variant || "neutral"]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
          {value}
        </h3>
        {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
};
