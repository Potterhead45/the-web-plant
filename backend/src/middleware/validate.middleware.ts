import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validateBody = (schema: ZodType) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodType) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.query);
      // In Express 5, req.query is a getter, so we mutate properties via Object.assign
      for (const key of Object.keys(req.query)) {
        delete (req.query as any)[key];
      }
      Object.assign(req.query, parsed);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = (schema: ZodType) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.params);
      for (const key of Object.keys(req.params)) {
        delete (req.params as any)[key];
      }
      Object.assign(req.params, parsed);
      next();
    } catch (error) {
      next(error);
    }
  };
};
