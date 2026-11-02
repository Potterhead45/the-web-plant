import { Request, Response, NextFunction } from "express";
import { ProjectService } from "../services/project.service.js";
import { sendResponse } from "../utils/apiResponse.js";

export class ProjectController {
  static async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const project = await ProjectService.createProject(userId, req.body);
      sendResponse({
        res,
        statusCode: 201,
        message: "Project created successfully.",
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const { projects, total } = await ProjectService.getProjects(userId, req.query as any);
      sendResponse({
        res,
        statusCode: 200,
        message: "Projects retrieved successfully.",
        data: { projects, total },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const project = await ProjectService.getProjectById(userId, req.params.id as string);
      sendResponse({
        res,
        statusCode: 200,
        message: "Project details retrieved successfully.",
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const project = await ProjectService.updateProject(
        userId,
        req.params.id as string,
        req.body
      );
      sendResponse({
        res,
        statusCode: 200,
        message: "Project updated successfully.",
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      await ProjectService.deleteProject(userId, req.params.id as string);
      sendResponse({
        res,
        statusCode: 200,
        message: "Project and all associated tasks deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}
