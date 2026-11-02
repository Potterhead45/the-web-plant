"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import { ProgressBar } from "../ui/ProgressBar";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useAppDispatch } from "@/store/hooks";
import { deleteProject } from "@/store/slices/projectsSlice";
import { addNotification } from "@/store/slices/uiSlice";
import {
  Folder,
  ArrowRight,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle2,
} from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit }) => {
  const dispatch = useAppDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const stats = project.taskCounts || { total: 0, todo: 0, inProgress: 0, done: 0 };
  const progress = project.progress ?? (stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteProject(project._id)).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: `Project "${project.title}" deleted.`,
        })
      );
    } catch {
      dispatch(
        addNotification({
          type: "error",
          message: "Failed to delete project.",
        })
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formattedDate = new Date(project.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <div className="relative group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-700/30 hover:shadow-lg hover:shadow-emerald-700/5 transition-all duration-200 flex flex-col p-6">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
              <Folder className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <Link
                href={`/projects/${project._id}`}
                className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1"
              >
                {project.title}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Created {formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(project);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    Edit Project
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Delete Project
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 min-h-8 mb-5 leading-relaxed">
          {project.description || "No description provided."}
        </p>

        {/* Progress Bar */}
        <div className="mb-5">
          <ProgressBar
            progress={progress}
            total={stats.total}
            completed={stats.done}
            size="sm"
          />
        </div>

        {/* Card Footer: Metrics & Details Link */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <span>
              <strong className="text-slate-900">{stats.total}</strong> Tasks
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {stats.done} Done
            </span>
          </div>

          <Link
            href={`/projects/${project._id}`}
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold group-hover:translate-x-0.5 transition-all"
          >
            Open Board
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.title}"? This will permanently delete the project and all of its associated tasks.`}
        confirmText="Delete Project"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
};
