import type { Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { AppError } from "../services/authService.js";
import {
  getOfficerVerificationDetail,
  listOfficerVerifications,
  reviewOfficerCertificate,
  setOfficerAccountStatus,
} from "../services/adminVerificationService.js";
import {
  officerVerificationFilterSchema,
  reviewCertificateSchema,
  verifyOfficerAccountSchema,
} from "../validators/officerVerificationValidator.js";

function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  console.error("Admin verification error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
}

function parseId(raw: unknown): number | null {
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (typeof first !== "string" && typeof first !== "number") return null;
  const id = Number(first);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function clean(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first !== "string") return undefined;
  const t = first.trim();
  return t === "" ? undefined : t;
}

export async function getOfficerVerifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = officerVerificationFilterSchema.safeParse({
      status: clean(req.query["status"])?.toUpperCase(),
      search: clean(req.query["search"]),
      page: req.query["page"],
      limit: req.query["limit"],
    });
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const result = await listOfficerVerifications(parsed.data);
    res.status(200).json({ success: true, ...result });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getOfficerVerificationById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseId(req.params["officerId"]);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid officer id" });
      return;
    }
    const officer = await getOfficerVerificationDetail(id);
    res.status(200).json({ success: true, officer });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function patchCertificateStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const id = parseId(req.params["certificateId"]);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid certificate id" });
      return;
    }
    const parsed = reviewCertificateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const certificate = await reviewOfficerCertificate(id, parsed.data.status, parsed.data.adminNote, req.user.userId);
    res.status(200).json({ success: true, message: "Document review saved", certificate });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function patchOfficerAccountStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const id = parseId(req.params["officerId"]);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid officer id" });
      return;
    }
    const parsed = verifyOfficerAccountSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const profile = await setOfficerAccountStatus(id, parsed.data.status, parsed.data.verificationNote, req.user.userId);
    res.status(200).json({ success: true, message: "Officer verification status updated", profile });
  } catch (error: unknown) {
    handleError(res, error);
  }
}
