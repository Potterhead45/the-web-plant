import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";
import { setupTestDB } from "./setup.js";
import { Task } from "../src/models/task.model.js";

describe("Project Management API Endpoints & Ownership Isolation", () => {
  setupTestDB();

  const userA = {
    name: "Alice Developer",
    email: "alice@plantboard.dev",
    password: "Password123!",
  };

  const userB = {
    name: "Bob Intruder",
    email: "bob@plantboard.dev",
    password: "Password123!",
  };

  const registerUser = async (u: typeof userA) => {
    const res = await request(app).post("/api/auth/register").send(u);
    return res.body.data.token as string;
  };

  it("POST /api/projects - creates a new project", async () => {
    const token = await registerUser(userA);

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Website Redesign",
        description: "Revamp the customer-facing web presence",
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.project.title, "Website Redesign");
    assert.ok(res.body.data.project._id);
  });

  it("POST /api/projects - validation failure on missing title", async () => {
    const token = await registerUser(userA);

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "Missing title completely",
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it("GET /api/projects - lists user projects with computed task counts and progress", async () => {
    const token = await registerUser(userA);

    // Create 2 projects
    const p1 = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Alpha Project" });

    await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Beta Project" });

    // Add 2 tasks to Alpha Project: 1 done, 1 todo
    await request(app)
      .post(`/api/projects/${p1.body.data.project._id}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task 1", status: "done" });

    await request(app)
      .post(`/api/projects/${p1.body.data.project._id}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task 2", status: "todo" });

    const listRes = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(listRes.status, 200);
    assert.equal(listRes.body.data.total, 2);

    const alpha = listRes.body.data.projects.find(
      (p: any) => p._id === p1.body.data.project._id
    );
    assert.ok(alpha);
    assert.equal(alpha.taskCounts.total, 2);
    assert.equal(alpha.taskCounts.done, 1);
    assert.equal(alpha.taskCounts.todo, 1);
    assert.equal(alpha.progress, 50); // 1 of 2 = 50%
  });

  it("GET /api/projects - search filtering by title", async () => {
    const token = await registerUser(userA);

    await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Marketing Strategy" });

    await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Backend API" });

    const searchRes = await request(app)
      .get("/api/projects?search=marketing")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(searchRes.status, 200);
    assert.equal(searchRes.body.data.total, 1);
    assert.equal(searchRes.body.data.projects[0].title, "Marketing Strategy");
  });

  it("PUT /api/projects/:id - updates an existing project", async () => {
    const token = await registerUser(userA);

    const createRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Original Title", description: "Original Description" });

    const projId = createRes.body.data.project._id;

    const updateRes = await request(app)
      .put(`/api/projects/${projId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title", description: "Updated Description" });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.data.project.title, "Updated Title");
    assert.equal(updateRes.body.data.project.description, "Updated Description");
  });

  it("CRITICAL: Enforces strict project ownership isolation between users", async () => {
    const tokenA = await registerUser(userA);
    const tokenB = await registerUser(userB);

    // User A creates a private project
    const pA = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "User A Confidential Project" });

    const projId = pA.body.data.project._id;

    // User B tries to GET User A's project -> MUST BE FORBIDDEN (403)
    const getRes = await request(app)
      .get(`/api/projects/${projId}`)
      .set("Authorization", `Bearer ${tokenB}`);
    assert.equal(getRes.status, 403);
    assert.equal(getRes.body.success, false);

    // User B tries to PUT User A's project -> MUST BE FORBIDDEN (403)
    const putRes = await request(app)
      .put(`/api/projects/${projId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Hacked by User B" });
    assert.equal(putRes.status, 403);

    // User B tries to DELETE User A's project -> MUST BE FORBIDDEN (403)
    const delRes = await request(app)
      .delete(`/api/projects/${projId}`)
      .set("Authorization", `Bearer ${tokenB}`);
    assert.equal(delRes.status, 403);

    // User B listing projects must NOT contain User A's project
    const listResB = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${tokenB}`);
    assert.equal(listResB.body.data.total, 0);
  });

  it("DELETE /api/projects/:id - deletes project and cascades to associated tasks", async () => {
    const token = await registerUser(userA);

    const p = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Doomed Project" });

    const projId = p.body.data.project._id;

    // Add tasks
    await request(app)
      .post(`/api/projects/${projId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Doomed Task 1" });

    await request(app)
      .post(`/api/projects/${projId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Doomed Task 2" });

    // Verify tasks exist in database
    const tasksBefore = await Task.find({ project: projId });
    assert.equal(tasksBefore.length, 2);

    // Delete project
    const delRes = await request(app)
      .delete(`/api/projects/${projId}`)
      .set("Authorization", `Bearer ${token}`);
    assert.equal(delRes.status, 200);

    // Verify project is gone
    const getRes = await request(app)
      .get(`/api/projects/${projId}`)
      .set("Authorization", `Bearer ${token}`);
    assert.equal(getRes.status, 404);

    // Verify associated tasks were CASCADE DELETED
    const tasksAfter = await Task.find({ project: projId });
    assert.equal(tasksAfter.length, 0);
  });
});
