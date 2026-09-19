import { Router } from "express";
import {
  cancelOrder,
  createOrder,
  getMyOrders,
  getOrderById,
} from "../controllers/orderController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/", authenticate, authorizeRoles("BUYER"), createOrder);
router.get("/my", authenticate, authorizeRoles("BUYER"), getMyOrders);
router.patch("/:id/cancel", authenticate, authorizeRoles("BUYER"), cancelOrder);
router.get("/:id", authenticate, authorizeRoles("BUYER"), getOrderById);

export default router;
