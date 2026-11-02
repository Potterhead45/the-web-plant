export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string | { _id: string; title: string };
  user: string;
  status: TaskStatus;
  dueDate?: string | null;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCounts {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  user: string;
  taskCounts?: TaskCounts;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  upcomingDeadlines: Task[];
  recentProjects: Project[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
  errors?: Array<{ field?: string; message: string }>;
}
