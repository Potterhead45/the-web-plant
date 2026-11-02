import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";

describe("Health Check API Endpoint", () => {
  it("GET /api/health - returns service operational status and timestamp", async () => {
    const res = await request(app).get("/api/health");

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, "ok");
    assert.equal(res.body.data.service, "PlantBoard Backend API");
    assert.ok(res.body.data.timestamp);
    assert.ok(typeof res.body.data.uptime === "number");
  });
});
