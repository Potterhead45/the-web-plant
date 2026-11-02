import { app } from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { ENV } from "./config/env.js";

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(ENV.PORT, () => {
      console.log(`====================================================`);
      console.log(`🌿 PlantBoard Backend API Server`);
      console.log(`📡 Status: Running on port ${ENV.PORT}`);
      console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
      console.log(`🔗 Allowed Client URL: ${ENV.CLIENT_URL}`);
      console.log(`🏥 Health Check: http://localhost:${ENV.PORT}/api/health`);
      console.log(`====================================================`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log("[Server] Closed HTTP server and MongoDB connection.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("[Server] Fatal startup error:", error);
    process.exit(1);
  }
};

startServer();
