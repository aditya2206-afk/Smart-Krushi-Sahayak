import { Router } from "express";
import {
  getDashboard,
  getUserById,
  getUsers,
  patchUserStatus,
} from "../controllers/adminController.js";
import {
  getOfficerVerificationById,
  getOfficerVerifications,
  patchCertificateStatus,
  patchOfficerAccountStatus,
} from "../controllers/adminVerificationController.js";
import {
  getListings,
  getOrders,
  getQueries,
  patchListingStatus,
} from "../controllers/adminMonitorController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("ADMIN"));

router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", patchUserStatus);
// Krushi Adhikari verification review (ADMIN only, enforced by router guard above).
router.get("/officer-verifications", getOfficerVerifications);
router.get("/officer-verifications/:officerId", getOfficerVerificationById);
router.patch("/officer-verifications/:officerId/status", patchOfficerAccountStatus);
router.patch("/officer-certificates/:certificateId/status", patchCertificateStatus);
router.get("/listings", getListings);
router.patch("/listings/:id/status", patchListingStatus);
router.get("/orders", getOrders);
router.get("/queries", getQueries);

export default router;
