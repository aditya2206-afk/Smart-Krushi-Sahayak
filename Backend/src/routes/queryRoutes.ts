import { Router } from "express";
import { createQuery, getFarmerQueryById, getMyFarmerQueries } from "../controllers/queryController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/", authenticate, authorizeRoles("FARMER"), createQuery);
router.get("/my", authenticate, authorizeRoles("FARMER"), getMyFarmerQueries);
router.get("/:id", authenticate, authorizeRoles("FARMER", "OFFICER", "ADMIN"), getFarmerQueryById);

export default router;
