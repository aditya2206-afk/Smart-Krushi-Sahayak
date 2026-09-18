import { Router } from "express";
import {
  createListing,
  deleteListing,
  getListingById,
  getMarketplaceListings,
  getMyListings,
  updateListing,
} from "../controllers/productController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

// Public/read-only marketplace (ACTIVE listings only).
router.get("/", getMarketplaceListings);

// Seller inventory (all own statuses). Must be registered before "/:id".
router.get("/my", authenticate, authorizeRoles("SELLER"), getMyListings);

// Details: owner sellers may view own inactive listing; public sees ACTIVE only.
router.get("/:id", getListingById);

// Seller management (ownership enforced in service layer).
router.post("/", authenticate, authorizeRoles("SELLER"), createListing);
router.put("/:id", authenticate, authorizeRoles("SELLER"), updateListing);
router.delete("/:id", authenticate, authorizeRoles("SELLER"), deleteListing);

export default router;
