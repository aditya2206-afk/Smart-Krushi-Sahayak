import type { Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { AppError } from "../services/authService.js";
import {
  getOfficerVerification,
  uploadOfficerCertificate,
} from "../services/officerVerificationService.js";
import { uploadCertificateSchema } from "../validators/officerVerificationValidator.js";
import { certificateFileUrl } from "../utils/officerUpload.js";

function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  console.error("Officer verification error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
}

export async function getVerification(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    // Service already returns { success: true, data: {...} }. Forward as-is so
    // the shape matches { success, data } exactly (no double-nesting).
    const result = await getOfficerVerification(req.user.userId);
    res.status(200).json(result);
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function uploadCertificate(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const parsed = uploadCertificateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const file = (req as AuthRequest & { file?: Express.Multer.File }).file;
    if (!file) {
      res.status(400).json({
        success: false,
        message: "A document file is required (PDF, JPG, JPEG or PNG, max 5MB).",
      });
      return;
    }
    const certificate = await uploadOfficerCertificate({
      userId: req.user.userId,
      documentType: parsed.data.documentType,
      fileUrl: certificateFileUrl(file.filename),
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    });
    res.status(201).json({
      success: true,
      message: "Document uploaded. It is now PENDING admin review.",
      certificate,
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}
