import { Router } from "express";
import { asyncHandler } from "../utils/errors.js";
import { login, me, register } from "../controllers/authController.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));

export default router;

