import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { asyncHandler } from "../utils/errors.js";
import {
  askQuestion,
  deleteQuestion,
  getHistory
} from "../controllers/queryController.js";

const router = Router();

router.use(requireAuth);
router.post("/ask", asyncHandler(askQuestion));
router.get("/history", asyncHandler(getHistory));
router.delete("/history/:id", asyncHandler(deleteQuestion));

export default router;

