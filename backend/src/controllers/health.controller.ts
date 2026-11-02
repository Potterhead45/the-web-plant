import { Request, Response } from "express";
import { sendResponse } from "../utils/apiResponse.js";
import { ENV } from "../config/env.js";

export class HealthController {
  static getHealth(_req: Request, res: Response): void {
    sendResponse({
      res,
      statusCode: 200,
      message: "PlantBoard API service is operational.",
      data: {
        status: "ok",
        service: "PlantBoard Backend API",
        version: "1.0.0",
        environment: ENV.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
      },
    });
  }
}
