import type { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../services/authService.js";
import { registerOfficerWithDocuments } from "../services/officerRegistrationService.js";
import type { OfficerRegistrationFiles } from "../services/officerRegistrationService.js";
import type { OfficerDocumentType } from "../generated/prisma/client.js";
import {
  OFFICER_REGISTRATION_FILE_FIELDS,
  registerOfficerSchema,
} from "../validators/officerVerificationValidator.js";
import { deleteUploadedFiles } from "../utils/officerUpload.js";

function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  console.error("Officer registration error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
}

function multerFilesToMap(req: Request): OfficerRegistrationFiles {
  const raw = (req as Request & { files?: Record<string, Express.Multer.File[]> }).files ?? {};
  const mapped: OfficerRegistrationFiles = {};
  for (const [field, documentType] of Object.entries(OFFICER_REGISTRATION_FILE_FIELDS)) {
    const arr = raw[field];
    const first = Array.isArray(arr) ? arr[0] : undefined;
    if (first) {
      mapped[documentType as OfficerDocumentType] = {
        filename: first.filename,
        originalname: first.originalname,
        mimetype: first.mimetype,
        size: first.size,
      };
    }
  }
  return mapped;
}

function allStoredFiles(req: Request): Array<{ path?: string; filename?: string }> {
  const raw = (req as Request & { files?: Record<string, Express.Multer.File[]> }).files ?? {};
  const out: Array<{ path?: string; filename?: string }> = [];
  for (const arr of Object.values(raw)) {
    if (Array.isArray(arr)) {
      for (const f of arr) out.push({ path: (f as Express.Multer.File).path, filename: (f as Express.Multer.File).filename });
    }
  }
  const single = (req as Request & { file?: Express.Multer.File }).file;
  if (single) out.push({ path: single.path, filename: single.filename });
  return out;
}

/**
 * POST /api/auth/register-officer (multipart/form-data).
 * Creates User + OfficerProfile (PENDING) + OfficerCertificate rows (PENDING)
 * in one transaction. Required documents are enforced before any DB write.
 */
export async function registerOfficer(req: Request, res: Response): Promise<void> {
  try {
    const parsed = registerOfficerSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      deleteUploadedFiles(allStoredFiles(req));
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }

    const files = multerFilesToMap(req);
    const result = await registerOfficerWithDocuments(parsed.data, files);

    res.status(201).json({
      success: true,
      message: "Registration submitted successfully. Your account is awaiting admin verification.",
      verificationStatus: result.verificationStatus,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error: unknown) {
    deleteUploadedFiles(allStoredFiles(req));
    handleError(res, error);
  }
}
