import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { AuthService } from "../services/auth.service.js";
import { setAuthCookie, clearAuthCookie } from "../utils/token.js";
import { sendResponse } from "../utils/apiResponse.js";
import { ENV } from "../config/env.js";

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
            avatar: user.avatar,
            authProvider: user.authProvider,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Redirects user to Google OAuth 2.0 Consent Screen with CSRF state
   */
  static getGoogleAuthUrl(_req: Request, res: Response): void {
    try {
      const state = crypto.randomBytes(32).toString("hex");

      const isProduction = ENV.NODE_ENV === "production";
      res.cookie("oauth_state", state, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 10 * 60 * 1000, // 10 minutes
        path: "/",
      });

      const url = AuthService.getGoogleAuthUrl(state);
      res.redirect(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize Google authentication.";
      res.redirect(`${ENV.CLIENT_URL}/login?error=${encodeURIComponent(msg)}`);
    }
  }

  /**
   * Handles Google OAuth 2.0 callback
   */
  static async googleCallback(req: Request, res: Response): Promise<void> {
    const isProduction = ENV.NODE_ENV === "production";
    const clearStateCookie = () => {
      res.clearCookie("oauth_state", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
      });
    };

    try {
      // Handle user cancellation / Google error query
      if (req.query.error) {
        clearStateCookie();
        const reason =
          req.query.error === "access_denied"
            ? "Google sign-in was cancelled."
            : `Google sign-in error: ${req.query.error}`;
        res.redirect(`${ENV.CLIENT_URL}/login?error=${encodeURIComponent(reason)}`);
        return;
      }

      const code = req.query.code as string;
      const state = req.query.state as string;
      const expectedState = req.cookies?.oauth_state;

      const { token } = await AuthService.handleGoogleCallback(code, state, expectedState);

      // Set application JWT in HttpOnly cookie
      setAuthCookie(res, token);
      clearStateCookie();

      // Redirect user to authenticated dashboard
      res.redirect(`${ENV.CLIENT_URL}/dashboard`);
    } catch (err: unknown) {
      clearStateCookie();
      const msg = err instanceof Error ? err.message : "Google authentication failed. Please try again.";
      res.redirect(`${ENV.CLIENT_URL}/login?error=${encodeURIComponent(msg)}`);
    }
  }
}
