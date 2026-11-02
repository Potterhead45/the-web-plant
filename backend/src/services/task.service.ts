import { Types } from "mongoose";
import { Task, ITask, TaskStatus } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from "../validations/task.validation.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

export class TaskService {
  /**
   * Create task within a project ensuring project ownership
   */
  static async createTask(
    userId: string,
    projectId: string,
    input: CreateTaskInput
  ): Promise<ITask> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundError("Project not found.");
    }

    // Verify project belongs to authenticated user
    const project = await Project.findOne({
      _id: new Types.ObjectId(projectId),
      user: new Types.ObjectId(userId),
    });

    if (!project) {
      const exists = await Project.findById(projectId);
      if (exists) {
        throw new ForbiddenError("You cannot create tasks in a project you do not own.");
      }
      throw new NotFoundError("Project not found.");
    }

    const task = await Task.create({
      title: input.title,
      description: input.description ?? "",
      status: input.status ?? "todo",
      dueDate: input.dueDate ?? null,
      project: project._id,
      user: new Types.ObjectId(userId),
    });

    return task;
  }

  /**
   * Get all tasks for the user with multi-dimensional filtering, searching, and sorting
   */
  static async getTasks(
    userId: string,
    query: TaskQueryInput,
    explicitProjectId?: string
  ): Promise<{ tasks: any[]; total: number }> {
    const userObjectId = new Types.ObjectId(userId);
    const filter: any = { user: userObjectId };

    // Project filtering (either from route param or query param)
    const targetProjectId = explicitProjectId || query.projectId;
    if (targetProjectId) {
      if (Types.ObjectId.isValid(targetProjectId)) {
        filter.project = new Types.ObjectId(targetProjectId);
      } else {
        return { tasks: [], total: 0 };
      }
    }

    // Status filtering
    if (query.status) {
      filter.status = query.status;
    }

    // Due date filtering
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (query.dueDate) {
      if (query.dueDate === "overdue") {
        filter.dueDate = { $lt: startOfToday, $ne: null };
        filter.status = { $ne: "done" };
      } else if (query.dueDate === "today") {
        filter.dueDate = { $gte: startOfToday, $lte: endOfToday };
      } else if (query.dueDate === "upcoming") {
        filter.dueDate = { $gt: endOfToday };
      } else if (query.dueDate === "has-due-date") {
        filter.dueDate = { $ne: null };
      } else if (query.dueDate === "no-due-date") {
        filter.dueDate = null;
      }
    }

    // Search query
    if (query.search && query.search.trim()) {
      filter.$or = [
        { title: { $regex: query.search.trim(), $options: "i" } },
        { description: { $regex: query.search.trim(), $options: "i" } },
      ];
    }

    // Sorting
    const sortField = query.sortBy || "createdAt";
    const sortOrder = query.order === "asc" ? 1 : -1;
    const sortOptions: any = {};

    if (sortField === "dueDate") {
      // For due date sort, we can sort dueDate ascending/descending
      sortOptions.dueDate = sortOrder;
      sortOptions.createdAt = -1;
    } else {
      sortOptions[sortField] = sortOrder;
    }

    const tasks = await Task.find(filter)
      .populate("project", "title")
      .sort(sortOptions)
      .lean();

    // Annotate tasks with computed `isOverdue`
    const enrichedTasks = tasks.map((task) => {
      const isOverdue =
        task.dueDate &&
        task.status !== "done" &&
        new Date(task.dueDate).getTime() < startOfToday.getTime();

      return {
        ...task,
        isOverdue: Boolean(isOverdue),
      };
    });

    return { tasks: enrichedTasks, total: enrichedTasks.length };
  }

  /**
   * Get single task by ID
   */
  static async getTaskById(userId: string, taskId: string): Promise<any> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new NotFoundError("Task not found.");
    }

    const task = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      user: new Types.ObjectId(userId),
    })
      .populate("project", "title")
      .lean();

    if (!task) {
      const exists = await Task.findById(taskId);
      if (exists) {
        throw new ForbiddenError("You do not have permission to view this task.");
      }
      throw new NotFoundError("Task not found.");
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const isOverdue =
      task.dueDate &&
      task.status !== "done" &&
      new Date(task.dueDate).getTime() < startOfToday.getTime();

    return {
      ...task,
      isOverdue: Boolean(isOverdue),
    };
  }

  /**
   * Update task with ownership check
   */
  static async updateTask(
    userId: string,
    taskId: string,
    input: UpdateTaskInput
  ): Promise<any> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new NotFoundError("Task not found.");
    }

    const task = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      user: new Types.ObjectId(userId),
    });

    if (!task) {
      const exists = await Task.findById(taskId);
      if (exists) {
        throw new ForbiddenError("You do not have permission to modify this task.");
      }
      throw new NotFoundError("Task not found.");
    }

    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.status !== undefined) task.status = input.status as TaskStatus;
    if (input.dueDate !== undefined) task.dueDate = input.dueDate;

    if (input.projectId && input.projectId !== task.project.toString()) {
      if (!Types.ObjectId.isValid(input.projectId)) {
        throw new NotFoundError("Target project not found.");
      }
      const targetProject = await Project.findOne({
        _id: new Types.ObjectId(input.projectId),
        user: new Types.ObjectId(userId),
      });
      if (!targetProject) {
        throw new ForbiddenError("Target project does not belong to you.");
      }
      task.project = targetProject._id;
    }

    await task.save();
    return this.getTaskById(userId, task._id.toString());
  }

  /**
   * Delete task with ownership check
   */
  static async deleteTask(userId: string, taskId: string): Promise<void> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new NotFoundError("Task not found.");
    }

    const task = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      user: new Types.ObjectId(userId),
    });

    if (!task) {
      const exists = await Task.findById(taskId);
      if (exists) {
        throw new ForbiddenError("You do not have permission to delete this task.");
      }
      throw new NotFoundError("Task not found.");
    }

    await Task.deleteOne({ _id: task._id });
  }

  /**
   * Get summary dashboard statistics for user
   */
  static async getDashboardStats(userId: string): Promise<any> {
    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [totalProjects, tasks, recentProjects] = await Promise.all([
      Project.countDocuments({ user: userObjectId }),
      Task.find({ user: userObjectId }).lean(),
      Project.find({ user: userObjectId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
    ]);

    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let todoTasks = 0;
    let overdueTasks = 0;
    let upcomingDeadlines: any[] = [];

    for (const t of tasks) {
      totalTasks++;
      if (t.status === "done") completedTasks++;
      else if (t.status === "in-progress") inProgressTasks++;
      else if (t.status === "todo") todoTasks++;

      if (t.dueDate && t.status !== "done") {
        const dueDate = new Date(t.dueDate);
        if (dueDate.getTime() < startOfToday.getTime()) {
          overdueTasks++;
        } else if (dueDate.getTime() <= sevenDaysFromNow.getTime()) {
          upcomingDeadlines.push({
            ...t,
            isOverdue: false,
          });
        }
      }
    }

    upcomingDeadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks: todoTasks,
      inProgressTasks,
      overdueTasks,
      upcomingDeadlines: upcomingDeadlines.slice(0, 5),
      recentProjects,
    };
  }
}
