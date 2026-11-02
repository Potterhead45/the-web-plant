import { z } from "zod";

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Project title is required" })
    .max(150, { message: "Project title cannot exceed 150 characters" })
    .trim(),
  description: z
    .string()
    .max(1000, { message: "Description cannot exceed 1000 characters" })
    .trim()
    .optional()
    .default(""),
});

export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Project title is required" })
    .max(150, { message: "Project title cannot exceed 150 characters" })
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, { message: "Description cannot exceed 1000 characters" })
    .trim()
    .optional(),
});

export const projectQuerySchema = z.object({
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "title", "updatedAt"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
