import { Router } from "express";
import { TaskController } from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody, validateQuery } from "../middleware/validate.middleware.js";
import { updateTaskSchema, taskQuerySchema } from "../validations/task.validation.js";

const router = Router();

router.use(authenticate);

router.get("/dashboard-stats", TaskController.getDashboardStats);
router.get("/", validateQuery(taskQuerySchema), TaskController.getAllTasks);

router
  .route("/:id")
  .get(TaskController.getTaskById)
  .put(validateBody(updateTaskSchema), TaskController.updateTask)
  .delete(TaskController.deleteTask);

export default router;
