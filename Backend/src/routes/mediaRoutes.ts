import { Router } from "express";
import {
  uploadMedia,
  listMyMedia,
  deleteMedia,
  uploadSingle,
} from "../controllers/mediaController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// All media routes require an authenticated user. Credentials are never
// exposed to the frontend and unsigned uploads are not used.
router.use(authenticate);

router.post("/upload", uploadSingle, uploadMedia);
router.get("/my-files", listMyMedia);
router.delete("/:id", deleteMedia);

export default router;
