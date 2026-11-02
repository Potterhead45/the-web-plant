"use client";

import React from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import { ProgressBar } from "../ui/ProgressBar";
import { FolderKanban, ArrowRight, Folder } from "lucide-react";

interface RecentProjectsListProps {
  projects: Project[];
}

export const RecentProjectsList: React.FC<RecentProjectsListProps> = ({ projects }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-base text-slate-900">Recent Projects</h3>
        </div>
        <Link
          href="/projects"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Folder className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-xs text-slate-500 font-medium">No projects created yet.</p>
          <Link
            href="/projects"
            className="text-[11px] text-emerald-700 hover:underline font-semibold mt-1"
          >
            Create your first project →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 flex-1">
          {projects.map((project) => {
            const stats = project.taskCounts || { total: 0, done: 0 };
            const progress =
              project.progress ??
              (stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0);

            return (
              <div
                key={project._id}
                className="py-3 flex flex-col gap-2 first:pt-0 last:pb-0 group"
              >
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/projects/${project._id}`}
                    className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate"
                  >
                    {project.title}
                  </Link>
                  <span className="text-[11px] text-slate-500 shrink-0 font-medium">
                    {stats.total} {stats.total === 1 ? "task" : "tasks"}
                  </span>
                </div>
                <ProgressBar progress={progress} showLabel={false} size="sm" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
