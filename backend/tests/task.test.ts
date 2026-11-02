import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";
import { setupTestDB } from "./setup.js";

describe("Task Management API Endpoints & Ownership Isolation", () => {
  setupTestDB();

  const userA = {
    name: "Charlie",
    email: "charlie@plantboard.dev",
    password: "Password123!",
  };

  const userB = {
    name: "Dave",
    email: "dave@plantboard.dev",
    password: "Password123!",
  };

  const registerUser = async (u: typeof userA) => {
    const res = await request(app).post("/api/auth/register").send(u);
    return res.body.data.token as string;
  };

  it("POST /api/projects/:projectId/tasks - creates task with status and dueDate", async () => {
    const token = await registerUser(userA);

    const p = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Product Launch" });

    const projId = p.body.data.project._id;
    const futureDate = new Date(Date.now() + 86400000 * 3).toISOString();

    const res = await request(app)
      .post(`/api/projects/${projId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Write Press Release",
        description: "Draft announcement for launch date",
        status: "in-progress",
        dueDate: futureDate,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.task.title, "Write Press Release");
    assert.equal(res.body.data.task.status, "in-progress");
    assert.equal(res.body.data.task.project, projId);
    assert.ok(res.body.data.task.dueDate);
  });

  it("PUT /api/tasks/:id - updates task status, title, and handles clearing due date", async () => {
    const token = await registerUser(userA);

    const p = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Ops" });

    const projId = p.body.data.project._id;

    const taskRes = await request(app)
      .post(`/api/projects/${projId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Initial Task", status: "todo", dueDate: new Date().toISOString() });

    const taskId = taskRes.body.data.task._id;

    // Update status to done and clear dueDate
    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "done",
        dueDate: null,
      });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.data.task.status, "done");
    assert.equal(updateRes.body.data.task.dueDate, null);
  });

  it("DELETE /api/tasks/:id - removes a task", async () => {
    const token = await registerUser(userA);

    const p = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Ops" });

    const projId = p.body.data.project._id;

    const taskRes = await request(app)
      .post(`/api/projects/${projId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "To Delete" });

    const taskId = taskRes.body.data.task._id;

    const delRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    assert.equal(delRes.status, 200);

    const getRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    assert.equal(getRes.status, 404);
  });

  it("CRITICAL: Task ownership isolation between users", async () => {
    const tokenA = await registerUser(userA);
    const tokenB = await registerUser(userB);

    const pA = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "User A Project" });

    const projAId = pA.body.data.project._id;

    const tA = await request(app)
      .post(`/api/projects/${projAId}/tasks`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "User A Secret Task" });

    const taskAId = tA.body.data.task._id;

    // User B cannot create task in User A's project
    const createInOtherProject = await request(app)
      .post(`/api/projects/${projAId}/tasks`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Injected Task" });
    assert.equal(createInOtherProject.status, 403);

    // User B cannot GET User A's task
    const getOtherTask = await request(app)
      .get(`/api/tasks/${taskAId}`)
      .set("Authorization", `Bearer ${tokenB}`);
    assert.equal(getOtherTask.status, 403);

    // User B cannot UPDATE User A's task
    const putOtherTask = await request(app)
      .put(`/api/tasks/${taskAId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Hijacked Task" });
    assert.equal(putOtherTask.status, 403);

    // User B cannot DELETE User A's task
    const delOtherTask = await request(app)
      .delete(`/api/tasks/${taskAId}`)
      .set("Authorization", `Bearer ${tokenB}`);
    assert.equal(delOtherTask.status, 403);
  });

  it("GET /api/tasks - status, due date filtering and sorting", async () => {
    const token = await registerUser(userA);

    const p = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Filter Test Project" });

    const projId = p.body.data.project._id;

    const pastDate = new Date(Date.now() - 86400000 * 5).toISOString(); // 5 days ago
    const futureDate = new Date(Date.now() + 86400000 * 5).toISOString(); // 5 days ahead

    // Create 3 tasks: overdue todo, future in-progress, completed done
    await request(app)
      .post(`/api/projects/${projId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Overdue Task", status: "todo", dueDate: pastDate });

    await request(app)
      .post(`/api/projects/${projId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Upcoming Task", status: "in-progress", dueDate: futureDate });

    await request(app)
      .post(`/api/projects/${projId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Finished Task", status: "done", dueDate: pastDate });

    // 1. Filter by status=todo
    const todoRes = await request(app)
      .get("/api/tasks?status=todo")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(todoRes.body.data.total, 1);
    assert.equal(todoRes.body.data.tasks[0].title, "Overdue Task");

    // 2. Filter by status=done
    const doneRes = await request(app)
      .get("/api/tasks?status=done")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(doneRes.body.data.total, 1);
    assert.equal(doneRes.body.data.tasks[0].title, "Finished Task");

    // 3. Filter by dueDate=overdue (only uncompleted tasks with past due dates)
    const overdueRes = await request(app)
      .get("/api/tasks?dueDate=overdue")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(overdueRes.body.data.total, 1);
    assert.equal(overdueRes.body.data.tasks[0].title, "Overdue Task");
    assert.equal(overdueRes.body.data.tasks[0].isOverdue, true);

    // 4. Filter by dueDate=upcoming
    const upcomingRes = await request(app)
      .get("/api/tasks?dueDate=upcoming")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(upcomingRes.body.data.total, 1);
    assert.equal(upcomingRes.body.data.tasks[0].title, "Upcoming Task");

    // 5. Sorting by title asc
    const sortRes = await request(app)
      .get("/api/tasks?sortBy=title&order=asc")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(sortRes.body.data.tasks[0].title, "Finished Task");
  });

  it("GET /api/tasks/dashboard-stats - returns accurate real statistics", async () => {
    const token = await registerUser(userA);

    const p = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Stats Project" });

    const projId = p.body.data.project._id;

    const pastDate = new Date(Date.now() - 86400000 * 2).toISOString();
    const futureDate = new Date(Date.now() + 86400000 * 2).toISOString();

    await request(app)
      .post(`/api/projects/${projId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task 1", status: "todo", dueDate: pastDate }); // overdue

    await request(app)
      .post(`/api/projects/${projId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task 2", status: "in-progress", dueDate: futureDate }); // upcoming

    await request(app)
      .post(`/api/projects/${projId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task 3", status: "done" });

    const statsRes = await request(app)
      .get("/api/tasks/dashboard-stats")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(statsRes.status, 200);
    const stats = statsRes.body.data;
    assert.equal(stats.totalProjects, 1);
    assert.equal(stats.totalTasks, 3);
    assert.equal(stats.completedTasks, 1);
    assert.equal(stats.inProgressTasks, 1);
    assert.equal(stats.pendingTasks, 1);
    assert.equal(stats.overdueTasks, 1);
    assert.equal(stats.upcomingDeadlines.length, 1);
  });
});
