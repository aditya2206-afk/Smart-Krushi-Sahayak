import type { Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { AppError } from "../services/authService.js";
import { getMyProfile, updateMyProfile } from "../services/profileService.js";
import { buyerProfileSchema, farmerProfileSchema, officerProfileSchema, sellerProfileSchema } from "../validators/profileValidator.js";

function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  if (!first) return "Validation failed";
  if (first.code === "unrecognized_keys") return `Unknown field(s): ${String((first as { keys?: string[] }).keys?.join(", ") ?? "")}`;
  return first.message;
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  console.error("Profile error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required. Please provide a valid Bearer token." });
      return;
    }
    const result = await getMyProfile(req.user.userId, req.user.role);
    res.status(200).json({ success: true, ...result });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function updateMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required. Please provide a valid Bearer token." });
      return;
    }
    const role = req.user.role;
    let parsed;
    if (role === "FARMER") parsed = farmerProfileSchema.safeParse(req.body ?? {});
    else if (role === "SELLER") parsed = sellerProfileSchema.safeParse(req.body ?? {});
    else if (role === "BUYER") parsed = buyerProfileSchema.safeParse(req.body ?? {});
    else if (role === "OFFICER") parsed = officerProfileSchema.safeParse(req.body ?? {});
    else {
      const nameOnly = z.object({ name: z.string().trim().min(1).max(100).optional() }).strict().safeParse(req.body ?? {});
      if (!nameOnly.success) {
        res.status(400).json({ success: false, message: formatZodError(nameOnly.error) });
        return;
      }
      const result = await updateMyProfile(req.user.userId, role, nameOnly.data as { name?: string });
      res.status(200).json({ success: true, message: "Profile updated successfully", ...result });
      return;
    }
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const result = await updateMyProfile(req.user.userId, role, parsed.data);
    res.status(200).json({ success: true, message: "Profile updated successfully", ...result });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

