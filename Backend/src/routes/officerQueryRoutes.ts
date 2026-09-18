import { Router } from "express";
import {
  answerQuery,
  changeQueryStatus,
  getQueryDetail,
  listQueries,
} from "../controllers/officerQueryController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate, authorizeRoles("OFFICER"));

router.get("/queries", listQueries);
router.get("/queries/:id", getQueryDetail);
router.patch("/queries/:id/status", changeQueryStatus);
router.post("/queries/:id/respond", answerQuery);

export default router;
