"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFormModal } from "@/components/projects/ProjectFormModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProjects } from "@/store/slices/projectsSlice";
import { Project } from "@/lib/types";
import { Plus, Search, FolderKanban, Loader2, ArrowUpDown } from "lucide-react";

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { projects, loading } = useAppSelector((state) => state.projects);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  useEffect(() => {
    dispatch(
      fetchProjects({
        search: search.trim() || undefined,
        sortBy,
        order,
      })
    );
  }, [dispatch, search, sortBy, order]);

  const handleEdit = (project: Project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <AppLayout
      title="Projects"
      subtitle="Manage, monitor, and coordinate your teams' initiatives"
      actions={
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Search & Sort Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by title or description..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-xs sm:text-sm placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort by:</span>
            </div>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [newSortBy, newOrder] = e.target.value.split("-") as [
                  string,
                  "asc" | "desc"
                ];
                setSortBy(newSortBy);
                setOrder(newOrder);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Projects Grid or Loading/Empty state */}
        {loading && projects.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
            <p className="text-xs font-medium text-slate-500">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="w-10 h-10 text-emerald-700" />}
            title={search ? "No matching projects found" : "No projects yet"}
            description={
              search
                ? `No projects matched "${search}". Try searching with a different term.`
                : "Create your first project to start organizing tasks, setting due dates, and tracking milestones."
            }
            actionText={search ? undefined : "Create First Project"}
            onAction={search ? undefined : handleCreate}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProjectToEdit(null);
        }}
        projectToEdit={projectToEdit}
      />
    </AppLayout>
  );
}
