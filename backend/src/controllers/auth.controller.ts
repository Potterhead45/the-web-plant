import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { setAuthCookie, clearAuthCookie } from "../utils/token.js";
import { sendResponse } from "../utils/apiResponse.js";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.register(req.body);
      setAuthCookie(res, token);
      sendResponse({
        res,
        statusCode: 201,
        message: "Registration successful. Welcome to PlantBoard!",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.login(req.body);
      setAuthCookie(res, token);
      sendResponse({
        res,
        statusCode: 200,
        message: "Login successful. Welcome back!",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      clearAuthCookie(res);
      sendResponse({
        res,
        statusCode: 200,
        message: "Logged out successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      sendResponse({
        res,
        statusCode: 200,
        message: "Current user profile fetched successfully.",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
