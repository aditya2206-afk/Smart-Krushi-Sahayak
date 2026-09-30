import { Router } from "express";
import { login, me, register } from "../controllers/authController.js";
import { registerOfficer } from "../controllers/officerRegistrationController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { officerRegistrationUpload } from "../utils/officerUpload.js";
import { OFFICER_REGISTRATION_FILE_FIELDS } from "../validators/officerVerificationValidator.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);

function registerOfficerUploadFields() {
  return (req: unknown, res: unknown, next: () => void) => {
    officerRegistrationUpload.fields(
      Object.keys(OFFICER_REGISTRATION_FILE_FIELDS).map((name) => ({ name, maxCount: 1 })),
    )(
      req as never,
      res as never,
      (err: unknown) => {
        if (err) {
          const message = err instanceof Error ? err.message : "File upload failed";
          const isLimit =
            typeof err === "object" && err !== null && "code" in err &&
            (err as { code?: string }).code === "LIMIT_FILE_SIZE";
          (res as { status: (c: number) => { json: (b: unknown) => void } })
            .status(400)
            .json({
              success: false,
              message: isLimit
                ? "File too large. Maximum size is 5MB per file."
                : message,
            });
          return;
        }
        next();
      },
    );
  };
}

// Dedicated one-shot Krushi Adhikari registration (multipart/form-data).
// Normal JSON registration for FARMER/SELLER/BUYER is unchanged.
router.post("/register-officer", registerOfficerUploadFields(), registerOfficer);

export default router;

