import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/task.service.js";
import { sendResponse } from "../utils/apiResponse.js";

export class TaskController {
  static async createForProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const projectId = req.params.projectId as string;
      const task = await TaskService.createTask(userId, projectId, req.body);
      sendResponse({
        res,
        statusCode: 201,
        message: "Task created successfully.",
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getForProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const projectId = req.params.projectId as string;
      const { tasks, total } = await TaskService.getTasks(userId, req.query as any, projectId);
      sendResponse({
        res,
        statusCode: 200,
        message: "Project tasks retrieved successfully.",
        data: { tasks, total },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const { tasks, total } = await TaskService.getTasks(userId, req.query as any);
      sendResponse({
        res,
        statusCode: 200,
        message: "Tasks retrieved successfully.",
        data: { tasks, total },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const task = await TaskService.getTaskById(userId, req.params.id as string);
      sendResponse({
        res,
        statusCode: 200,
        message: "Task retrieved successfully.",
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const task = await TaskService.updateTask(
        userId,
        req.params.id as string,
        req.body
      );
      sendResponse({
        res,
        statusCode: 200,
        message: "Task updated successfully.",
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      await TaskService.deleteTask(userId, req.params.id as string);
      sendResponse({
        res,
        statusCode: 200,
        message: "Task deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const stats = await TaskService.getDashboardStats(userId);
      sendResponse({
        res,
        statusCode: 200,
        message: "Dashboard statistics retrieved successfully.",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
