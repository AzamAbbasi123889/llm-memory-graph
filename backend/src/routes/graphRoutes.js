import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { asyncHandler } from "../utils/errors.js";
import {
  graphNodes,
  graphRelated,
  graphStats
} from "../controllers/graphController.js";

const router = Router();

router.use(requireAuth);
router.get("/nodes", asyncHandler(graphNodes));
router.get("/stats", asyncHandler(graphStats));
router.get("/related/:id", asyncHandler(graphRelated));

export default router;

