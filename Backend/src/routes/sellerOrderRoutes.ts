import { Router } from "express";
import {
  getSellerOrderDetail,
  getSellerOrders,
  patchSellerOrderStatus,
} from "../controllers/sellerOrderController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", authenticate, authorizeRoles("SELLER"), getSellerOrders);
router.get("/:id", authenticate, authorizeRoles("SELLER"), getSellerOrderDetail);
router.patch("/:id/status", authenticate, authorizeRoles("SELLER"), patchSellerOrderStatus);

export default router;
