"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createProject, updateProject } from "@/store/slices/projectsSlice";
import { addNotification } from "@/store/slices/uiSlice";
import { Project } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
  onSuccess?: (project: Project) => void;
}

const ProjectFormContent: React.FC<{
  projectToEdit?: Project | null;
  onClose: () => void;
  onSuccess?: (project: Project) => void;
}> = ({ projectToEdit, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { actionLoading } = useAppSelector((state) => state.projects);

  const [title, setTitle] = useState(projectToEdit?.title || "");
  const [description, setDescription] = useState(projectToEdit?.description || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    try {
      if (projectToEdit) {
        const result = await dispatch(
          updateProject({
            id: projectToEdit._id,
            data: { title: title.trim(), description: description.trim() },
          })
        ).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: "Project updated successfully.",
          })
        );
        onSuccess?.(result);
      } else {
        const result = await dispatch(
          createProject({
            title: title.trim(),
            description: description.trim(),
          })
        ).unwrap();
        dispatch(
          addNotification({
            type: "success",
            message: "Project created successfully.",
          })
        );
        onSuccess?.(result);
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to save project");
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
          Project Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          placeholder="e.g., Marketing Campaign Q4"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm transition-all placeholder:text-slate-400"
          maxLength={150}
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
          placeholder="Brief description of the project goals, scope, and target outcomes..."
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-sm transition-all placeholder:text-slate-400 resize-none"
          maxLength={1000}
        />
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
          {projectToEdit ? "Save Changes" : "Create Project"}
        </button>
      </div>
    </form>
  );
};

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
  onSuccess,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? "Edit Project" : "Create New Project"}
      description={
        projectToEdit
          ? "Update the title and details for this project."
          : "Start a new project to organize and track tasks."
      }
      maxWidth="md"
    >
      <ProjectFormContent
        key={`${isOpen}-${projectToEdit?._id || "new"}`}
        projectToEdit={projectToEdit}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
};
