import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), AuthController.register);
router.post("/login", authLimiter, validateBody(loginSchema), AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", authenticate, AuthController.getMe);

// Google OAuth 2.0 endpoints
router.get("/google", AuthController.getGoogleAuthUrl);
router.get("/google/callback", AuthController.googleCallback);

export default router;
