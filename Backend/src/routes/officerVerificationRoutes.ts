import { Router } from "express";
import { getVerification, uploadCertificate } from "../controllers/officerVerificationController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { officerCertificateUpload } from "../utils/officerUpload.js";

const router = Router();

function uploadSingle(field: string) {
  return (req: unknown, res: unknown, next: () => void) => {
    officerCertificateUpload.single(field)(
      req as never,
      res as never,
      (err: unknown) => {
        if (err) {
          const message =
            err instanceof Error ? err.message : "File upload failed";
          const isLimit =
            typeof err === "object" && err !== null && "code" in err &&
            (err as { code?: string }).code === "LIMIT_FILE_SIZE";
          (res as { status: (c: number) => { json: (b: unknown) => void } })
            .status(400)
            .json({
              success: false,
              message: isLimit
                ? "File too large. Maximum size is 5MB."
                : message,
            });
          return;
        }
        next();
      },
    );
  };
}

// Officer self-service verification endpoints. Deliberately NOT behind
// requireVerifiedOfficer: pending officers must reach these.
router.use(authenticate, authorizeRoles("OFFICER"));

router.get("/verification", getVerification);
router.post("/certificates", uploadSingle("file"), uploadCertificate);
// Re-upload uses the same endpoint (replacement semantics per documentType).
router.post("/certificates/re-upload", uploadSingle("file"), uploadCertificate);

export default router;
