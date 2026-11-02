import jwt from "jsonwebtoken";
import { CookieOptions, Response } from "express";
import { ENV } from "../config/env.js";

export interface TokenPayload {
  userId: string;
  email: string;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
};

export const getCookieOptions = (): CookieOptions => {
  const isProduction = ENV.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    path: "/",
  };
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(ENV.COOKIE_NAME, token, getCookieOptions());
};

export const clearAuthCookie = (res: Response): void => {
  const isProduction = ENV.NODE_ENV === "production";
  res.clearCookie(ENV.COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
};
