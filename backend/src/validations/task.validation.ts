import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Task title is required" })
    .max(200, { message: "Task title cannot exceed 200 characters" })
    .trim(),
  description: z
    .string()
    .max(2000, { message: "Task description cannot exceed 2000 characters" })
    .trim()
    .optional()
    .default(""),
  status: z
    .enum(["todo", "in-progress", "done"], {
      error: "Status must be 'todo', 'in-progress', or 'done'",
    })
    .optional()
    .default("todo"),
  dueDate: z
    .union([z.string().datetime(), z.string().date(), z.literal(""), z.null()])
    .optional()
    .transform((val) => {
      if (!val || val === "") return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Task title cannot be empty" })
    .max(200, { message: "Task title cannot exceed 200 characters" })
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, { message: "Task description cannot exceed 2000 characters" })
    .trim()
    .optional(),
  status: z
    .enum(["todo", "in-progress", "done"], {
      error: "Status must be 'todo', 'in-progress', or 'done'",
    })
    .optional(),
  dueDate: z
    .union([z.string().datetime(), z.string().date(), z.literal(""), z.null()])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (!val || val === "") return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }),
  projectId: z.string().optional(),
});

export const taskQuerySchema = z.object({
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  dueDate: z.string().optional(), // 'overdue' | 'today' | 'upcoming' | ISO string
  sortBy: z
    .enum(["dueDate", "createdAt", "title", "status", "updatedAt"])
    .optional()
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  projectId: z.string().optional(),
  search: z.string().trim().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
