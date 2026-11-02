import { Router } from "express";
import { ProjectController } from "../controllers/project.controller.js";
import { TaskController } from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody, validateQuery } from "../middleware/validate.middleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
} from "../validations/project.validation.js";
import { createTaskSchema, taskQuerySchema } from "../validations/task.validation.js";

const router = Router();

// All project routes require authentication
router.use(authenticate);

router
  .route("/")
  .get(validateQuery(projectQuerySchema), ProjectController.getProjects)
  .post(validateBody(createProjectSchema), ProjectController.createProject);

router
  .route("/:id")
  .get(ProjectController.getProjectById)
  .put(validateBody(updateProjectSchema), ProjectController.updateProject)
  .delete(ProjectController.deleteProject);

// Nested routes for project tasks
router
  .route("/:projectId/tasks")
  .get(validateQuery(taskQuerySchema), TaskController.getForProject)
  .post(validateBody(createTaskSchema), TaskController.createForProject);

export default router;
