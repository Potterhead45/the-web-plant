import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/token.js";
import { UnauthorizedError } from "../utils/errors.js";
import { User, IUser } from "../models/user.model.js";
import { ENV } from "../config/env.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies[ENV.COOKIE_NAME]) {
      token = req.cookies[ENV.COOKIE_NAME];
    }

    // 2. Fallback to Authorization: Bearer <token> header
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new UnauthorizedError("Authentication token is missing. Please log in.");
    }

    let payload: TokenPayload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new UnauthorizedError("Invalid or expired authentication session. Please log in again.");
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError("The account associated with this token no longer exists.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
