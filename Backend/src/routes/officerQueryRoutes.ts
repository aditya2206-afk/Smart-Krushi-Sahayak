import { Router } from "express";
import {
  answerQuery,
  changeQueryStatus,
  getQueryDetail,
  listQueries,
} from "../controllers/officerQueryController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { requireVerifiedOfficer } from "../middleware/officerVerificationMiddleware.js";

const router = Router();

// NOTE: authenticate + OFFICER role run for every officer path here, but
// requireVerifiedOfficer is applied PER-ROUTE only (never via router.use).
// A router-level use() would also run for /api/officer/verification and
// /api/officer/certificates on the sibling verification router (same
// /api/officer mount prefix) and wrongly 403 PENDING officers.
router.use(authenticate, authorizeRoles("OFFICER"));

// Real officer functionality: VERIFIED officers only.
router.get("/queries", requireVerifiedOfficer, listQueries);
router.get("/queries/:id", requireVerifiedOfficer, getQueryDetail);
router.patch("/queries/:id/status", requireVerifiedOfficer, changeQueryStatus);
router.post("/queries/:id/respond", requireVerifiedOfficer, answerQuery);

export default router;
