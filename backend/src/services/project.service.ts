import { Types } from "mongoose";
import { Project, IProject } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { CreateProjectInput, UpdateProjectInput, ProjectQueryInput } from "../validations/project.validation.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

export interface ProjectWithStats extends IProject {
  taskCounts: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
  progress: number;
}

export class ProjectService {
  /**
   * Create a new project for the authenticated user
   */
  static async createProject(userId: string, input: CreateProjectInput): Promise<IProject> {
    const project = await Project.create({
      title: input.title,
      description: input.description ?? "",
      user: new Types.ObjectId(userId),
    });
    return project;
  }

  /**
   * List all projects belonging to the user with search, sort, and computed task statistics
   */
  static async getProjects(
    userId: string,
    query: ProjectQueryInput
  ): Promise<{ projects: any[]; total: number }> {
    const userObjectId = new Types.ObjectId(userId);
    const filter: any = { user: userObjectId };

    if (query.search && query.search.trim()) {
      filter.$or = [
        { title: { $regex: query.search.trim(), $options: "i" } },
        { description: { $regex: query.search.trim(), $options: "i" } },
      ];
    }

    const sortField = query.sortBy || "createdAt";
    const sortOrder = query.order === "asc" ? 1 : -1;
    const sortOptions: any = { [sortField]: sortOrder };

    const rawProjects = await Project.find(filter).sort(sortOptions).lean();

    if (rawProjects.length === 0) {
      return { projects: [], total: 0 };
    }

    const projectIds = rawProjects.map((p) => p._id);

    // Aggregate task stats for these projects in a single query
    const taskStats = await Task.aggregate([
      {
        $match: {
          project: { $in: projectIds },
          user: userObjectId,
        },
      },
      {
        $group: {
          _id: { project: "$project", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap: Record<string, { total: number; todo: number; inProgress: number; done: number }> = {};
    for (const p of rawProjects) {
      statsMap[p._id.toString()] = { total: 0, todo: 0, inProgress: 0, done: 0 };
    }

    for (const stat of taskStats) {
      const projId = stat._id.project.toString();
      const status = stat._id.status;
      const count = stat.count;

      if (statsMap[projId]) {
        statsMap[projId].total += count;
        if (status === "todo") statsMap[projId].todo += count;
        else if (status === "in-progress") statsMap[projId].inProgress += count;
        else if (status === "done") statsMap[projId].done += count;
      }
    }

    const projectsWithStats = rawProjects.map((project) => {
      const counts = statsMap[project._id.toString()] || {
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
      };
      const progress = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;

      return {
        ...project,
        taskCounts: counts,
        progress,
      };
    });

    return { projects: projectsWithStats, total: rawProjects.length };
  }

  /**
   * Get single project details by ID with ownership verification and task statistics
   */
  static async getProjectById(userId: string, projectId: string): Promise<any> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundError("Project not found.");
    }

    const project = await Project.findOne({
      _id: new Types.ObjectId(projectId),
      user: new Types.ObjectId(userId),
    }).lean();

    if (!project) {
      // Check if project exists at all to return proper error without leaking
      const exists = await Project.findById(projectId);
      if (exists) {
        throw new ForbiddenError("You do not have permission to access this project.");
      }
      throw new NotFoundError("Project not found.");
    }

    // Compute task counts
    const taskCounts = await Task.aggregate([
      {
        $match: {
          project: new Types.ObjectId(projectId),
          user: new Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = { total: 0, todo: 0, inProgress: 0, done: 0 };
    for (const item of taskCounts) {
      counts.total += item.count;
      if (item._id === "todo") counts.todo = item.count;
      else if (item._id === "in-progress") counts.inProgress = item.count;
      else if (item._id === "done") counts.done = item.count;
    }

    const progress = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;

    return {
      ...project,
      taskCounts: counts,
      progress,
    };
  }

  /**
   * Update project details with ownership check
   */
  static async updateProject(
    userId: string,
    projectId: string,
    input: UpdateProjectInput
  ): Promise<IProject> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundError("Project not found.");
    }

    const project = await Project.findOne({
      _id: new Types.ObjectId(projectId),
      user: new Types.ObjectId(userId),
    });

    if (!project) {
      const exists = await Project.findById(projectId);
      if (exists) {
        throw new ForbiddenError("You do not have permission to modify this project.");
      }
      throw new NotFoundError("Project not found.");
    }

    if (input.title !== undefined) project.title = input.title;
    if (input.description !== undefined) project.description = input.description;

    await project.save();
    return project;
  }

  /**
   * Delete project and cascade-delete all its associated tasks
   */
  static async deleteProject(userId: string, projectId: string): Promise<void> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundError("Project not found.");
    }

    const project = await Project.findOne({
      _id: new Types.ObjectId(projectId),
      user: new Types.ObjectId(userId),
    });

    if (!project) {
      const exists = await Project.findById(projectId);
      if (exists) {
        throw new ForbiddenError("You do not have permission to delete this project.");
      }
      throw new NotFoundError("Project not found.");
    }

    // Cascade delete all tasks belonging to this project and user
    await Task.deleteMany({
      project: new Types.ObjectId(projectId),
      user: new Types.ObjectId(userId),
    });

    // Delete the project
    await Project.deleteOne({ _id: project._id });
  }
}
