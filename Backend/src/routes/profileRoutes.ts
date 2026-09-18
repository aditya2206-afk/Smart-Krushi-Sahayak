import { Router } from "express";
import { getMe, updateMe } from "../controllers/profileController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);

export default router;
