import type { NextFunction, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthRequest } from "./authMiddleware.js";

/**
 * Blocks non-VERIFIED officers from real officer functionality.
 * Non-officer roles pass through (existing role rules decide).
 * Verification/status + certificate upload routes must NOT use this middleware.
 */
export async function requireVerifiedOfficer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid Bearer token.",
      });
      return;
    }
    if (req.user.role !== "OFFICER") {
      next();
      return;
    }
    const profile = await prisma.officerProfile.findUnique({
      where: { userId: req.user.userId },
      select: { verificationStatus: true },
    });
    // No profile yet => treat as PENDING (never auto-verify).
    const status = profile?.verificationStatus ?? "PENDING";
    if (status === "VERIFIED") {
      next();
      return;
    }
    const messages: Record<string, string> = {
      PENDING: "Your Krushi Adhikari account is awaiting admin verification.",
      REJECTED: "Your Krushi Adhikari verification was rejected. Please review the administrator's note.",
      REUPLOAD_REQUIRED: "One or more of your verification documents must be uploaded again.",
    };
    res.status(403).json({
      success: false,
      code: "OFFICER_NOT_VERIFIED",
      verificationStatus: status,
      message: messages[status] ?? "Your Krushi Adhikari account is not verified yet.",
    });
  } catch (error) {
    console.error("Officer verification check failed:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
