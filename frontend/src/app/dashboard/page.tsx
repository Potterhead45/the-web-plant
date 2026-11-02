"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { RecentProjectsList } from "@/components/dashboard/RecentProjectsList";
import { ProjectFormModal } from "@/components/projects/ProjectFormModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardStats } from "@/store/slices/tasksSlice";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  Layers,
  Plus,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboardStats } = useAppSelector((state) => state.tasks);
  const user = useAppSelector((state) => state.auth.user);

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const stats = dashboardStats || {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    upcomingDeadlines: [],
    recentProjects: [],
  };

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <AppLayout
      title="Dashboard Overview"
      subtitle={`Welcome back, ${user?.name || "User"}`}
      actions={
        <button
          onClick={() => setIsCreateProjectOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Banner with Live Summary */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block text-[11px] font-semibold tracking-wider uppercase text-emerald-200 bg-white/10 px-2.5 py-1 rounded-full mb-3 backdrop-blur-xs">
              Live Project Analytics
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Organize workflows, track delivery, achieve goals.
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-normal leading-relaxed">
              You have <strong className="text-white font-semibold">{stats.totalProjects}</strong> active{" "}
              {stats.totalProjects === 1 ? "project" : "projects"} and{" "}
              <strong className="text-white font-semibold">{stats.totalTasks}</strong> total tasks.
              Overall task completion rate is{" "}
              <strong className="text-white font-semibold">{completionRate}%</strong>.
            </p>
          </div>

          <div className="absolute right-6 -bottom-6 opacity-10 text-white pointer-events-none hidden md:block">
            <TrendingUp className="w-56 h-56" />
          </div>
        </div>

        {/* 6 Real Stat Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Projects"
            value={stats.totalProjects}
            icon={<FolderKanban className="w-5 h-5" />}
            iconBgClasses="bg-emerald-50 text-emerald-700 border border-emerald-200/50"
          />

          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={<Layers className="w-5 h-5" />}
            iconBgClasses="bg-slate-100 text-slate-700 border border-slate-200/50"
          />

          <StatCard
            title="To Do"
            value={stats.pendingTasks}
            icon={<ListTodo className="w-5 h-5" />}
            iconBgClasses="bg-slate-100 text-slate-700 border border-slate-200/50"
          />

          <StatCard
            title="In Progress"
            value={stats.inProgressTasks}
            icon={<Clock className="w-5 h-5" />}
            iconBgClasses="bg-amber-50 text-amber-700 border border-amber-200/50"
          />

          <StatCard
            title="Completed"
            value={stats.completedTasks}
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconBgClasses="bg-emerald-50 text-emerald-700 border border-emerald-200/50"
            badge={
              stats.totalTasks > 0
                ? { text: `${completionRate}%`, variant: "success" }
                : undefined
            }
          />

          <StatCard
            title="Overdue"
            value={stats.overdueTasks}
            icon={<AlertTriangle className="w-5 h-5" />}
            iconBgClasses="bg-rose-50 text-rose-700 border border-rose-200/50"
            badge={
              stats.overdueTasks > 0
                ? { text: "Action Needed", variant: "danger" }
                : undefined
            }
          />
        </div>

        {/* Widgets: Upcoming Deadlines & Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingDeadlines tasks={stats.upcomingDeadlines || []} />
          <RecentProjectsList projects={stats.recentProjects || []} />
        </div>
      </div>

      <ProjectFormModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={() => {
          dispatch(fetchDashboardStats());
        }}
      />
    </AppLayout>
  );
}
