import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async (uri?: string): Promise<typeof mongoose> => {
  const connectionUri = uri || ENV.MONGODB_URI;

  try {
    const conn = await mongoose.connect(connectionUri);
    console.log(`[MongoDB] Connected to database: ${conn.connection.name} (${conn.connection.host})`);
    return conn;
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("[MongoDB] Disconnected successfully");
  } catch (error) {
    console.error("[MongoDB] Disconnect error:", error);
  }
};
