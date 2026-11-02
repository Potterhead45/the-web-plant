import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { AppError } from "../utils/errors.js";
import { ENV } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: any = undefined;

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }
  // 2. Custom AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.details;
  }
  // 3. Mongoose CastError (e.g. invalid ObjectId)
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }
  // 4. Mongoose ValidationError
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Database validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }
  // 5. MongoDB Duplicate Key (E11000)
  else if (err.code === 11000) {
    statusCode = 409;
    const key = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with this ${key} already exists`;
  }
  // 6. JWT Errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }
  // 7. Generic Error
  else if (err instanceof Error) {
    message = err.message || message;
  }

  if (statusCode === 500 && ENV.NODE_ENV !== "test") {
    console.error("[ServerError]:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(ENV.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
