"use client";

import React from "react";
import Link from "next/link";
import { Task } from "@/lib/types";
import { StatusBadge } from "../ui/Badge";
import { Calendar, ArrowRight, Clock } from "lucide-react";

interface UpcomingDeadlinesProps {
  tasks: Task[];
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ tasks }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-base text-slate-900">Upcoming Deadlines</h3>
        </div>
        <Link
          href="/tasks?dueDate=upcoming"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Calendar className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-xs text-slate-500 font-medium">No upcoming deadlines.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tasks with due dates in the next 7 days will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 flex-1">
          {tasks.map((task) => {
            const formattedDate = task.dueDate
              ? new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : null;

            return (
              <div
                key={task._id}
                className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <StatusBadge status={task.status} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
