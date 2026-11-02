import { before, after, afterEach } from "node:test";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../src/config/db.js";

let mongod: MongoMemoryServer | null = null;

export const setupTestDB = () => {
  before(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test_jwt_secret_key_plantboard_12345";
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await connectDB(uri);
  });

  afterEach(async () => {
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      for (const collection of collections) {
        await collection.deleteMany({});
      }
    }
  });

  after(async () => {
    await disconnectDB();
    if (mongod) {
      await mongod.stop();
    }
  });
};
