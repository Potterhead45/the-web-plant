import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";
import { setupTestDB } from "./setup.js";

describe("Authentication API Endpoints", () => {
  setupTestDB();

  const validUser = {
    name: "Jane Doe",
    email: "jane@plantboard.dev",
    password: "Password123!",
  };

  it("POST /api/auth/register - successfully registers a new user with HttpOnly cookie", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, validUser.email.toLowerCase());
    assert.equal(res.body.data.user.name, validUser.name);
    assert.equal(res.body.data.user.password, undefined); // Password must NEVER be returned
    assert.ok(res.body.data.token);

    // Verify HttpOnly cookie was set
    const cookies = res.headers["set-cookie"] || [];
    assert.ok(cookies.some((c: string) => c.includes("plantboard_token=")));
    assert.ok(cookies.some((c: string) => c.includes("HttpOnly")));
  });

  it("POST /api/auth/register - rejects duplicate email with 409 Conflict", async () => {
    // First registration
    await request(app).post("/api/auth/register").send(validUser);

    // Duplicate registration
    const res = await request(app).post("/api/auth/register").send(validUser);

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already exists/i);
  });

  it("POST /api/auth/register - validation failures (bad email, short password, empty name)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "J",
      email: "not-an-email",
      password: "123",
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors));
    assert.ok(res.body.errors.length >= 3);
  });

  it("POST /api/auth/login - successfully logs in existing user and sets cookie", async () => {
    await request(app).post("/api/auth/register").send(validUser);

    const res = await request(app).post("/api/auth/login").send({
      email: validUser.email,
      password: validUser.password,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, validUser.email);
    assert.ok(res.body.data.token);

    const cookies = res.headers["set-cookie"] || [];
    assert.ok(cookies.some((c: string) => c.includes("plantboard_token=")));
  });

  it("POST /api/auth/login - rejects incorrect password with 401 Unauthorized", async () => {
    await request(app).post("/api/auth/register").send(validUser);

    const res = await request(app).post("/api/auth/login").send({
      email: validUser.email,
      password: "WrongPassword999!",
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid email or password/i);
  });

  it("POST /api/auth/login - rejects non-existent email with 401 Unauthorized", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "unknown@plantboard.dev",
      password: "SomePassword123!",
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it("GET /api/auth/me - gets profile when authenticated via Bearer token or cookie", async () => {
    const regRes = await request(app).post("/api/auth/register").send(validUser);
    const token = regRes.body.data.token;
    const cookie = regRes.headers["set-cookie"];

    // 1. With Authorization Header
    const authHeaderRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(authHeaderRes.status, 200);
    assert.equal(authHeaderRes.body.data.user.email, validUser.email);

    // 2. With Cookie
    const cookieRes = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookie);
    assert.equal(cookieRes.status, 200);
    assert.equal(cookieRes.body.data.user.email, validUser.email);
  });

  it("GET /api/auth/me - rejects unauthenticated request with 401", async () => {
    const res = await request(app).get("/api/auth/me");
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it("POST /api/auth/logout - successfully clears auth cookie", async () => {
    const res = await request(app).post("/api/auth/logout");
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
