import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { mediaUpload } from "../lib/mediaUpload.js";
import {
  uploadMediaAsset,
  listMyMediaAssets,
  deleteMediaAsset,
} from "../services/mediaService.js";
import { mediaUploadSchema } from "../validators/mediaValidator.js";
import { z } from "zod";

function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Validation failed";
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof Error && "statusCode" in error) {
    res.status((error as { statusCode: number }).statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }
  console.error("Media error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
}

/**
 * POST /api/media/upload
 * multipart/form-data with field "file" + fields mediaType and purpose.
 */
export async function uploadMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const parsed = mediaUploadSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }

    const file = (req as AuthRequest & { file?: Express.Multer.File }).file;
    if (!file) {
      res.status(400).json({ success: false, message: "A file is required (field name: file)." });
      return;
    }

    const asset = await uploadMediaAsset({
      userId: req.user.userId,
      input: parsed.data,
      file,
    });

    res.status(201).json({ success: true, message: "File uploaded successfully.", media: asset });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

/**
 * GET /api/media/my-files — list the authenticated user's own media assets.
 */
export async function listMyMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const assets = await listMyMediaAssets(req.user.userId);
    res.status(200).json({ success: true, media: assets });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

/**
 * DELETE /api/media/:id — delete a media asset (owner or admin only).
 */
export async function deleteMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ success: false, message: "Invalid media id." });
      return;
    }

    await deleteMediaAsset({ assetId: id, userId: req.user.userId, role: req.user.role });
    res.status(200).json({ success: true, message: "File deleted successfully." });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export const uploadSingle = mediaUpload.single("file");
