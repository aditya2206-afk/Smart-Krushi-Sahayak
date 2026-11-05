import type { Response } from "express";
import { AppError } from "./authService.js";
import { prisma } from "../lib/prisma.js";
import {
  cloudinary,
  type CloudinaryUploadResult,
  uploadToCloudinary,
} from "../lib/cloudinary.js";
import {
  mediaUpload,
  maxBytesForMediaType,
  mimeTypeAllowedForMediaType,
  folderForPurpose,
  makePublicId,
  type MediaPurpose,
} from "../lib/mediaUpload.js";
import type { MediaUploadInput } from "../validators/mediaValidator.js";

export interface UploadFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * Upload a single file to Cloudinary and persist its metadata in PostgreSQL.
 * Folder and public id are derived server-side; client-supplied purpose must
 * match an allowlisted purpose and the file must match the declared mediaType.
 */
export async function uploadMediaAsset({
  userId,
  input,
  file,
}: {
  userId: number;
  input: MediaUploadInput;
  file: UploadFile;
}) {
  const mediaType = input.mediaType;
  const purpose = input.purpose as MediaPurpose;

  // Folder must come from the server-side allowlist, never from the client.
  const folder = folderForPurpose(purpose);
  if (!folder) {
    throw new AppError("Invalid upload purpose.", 400);
  }

  // MIME type must match the declared mediaType.
  if (!mimeTypeAllowedForMediaType(mediaType, file.mimetype)) {
    throw new AppError(
      `File type ${file.mimetype} is not allowed for ${mediaType.toLowerCase()} uploads.`,
      400,
    );
  }

  // Size limit per media type.
  const maxBytes = maxBytesForMediaType(mediaType);
  if (maxBytes === null || file.size > maxBytes) {
    throw new AppError(
      `File too large. Maximum size for ${mediaType.toLowerCase()} is ${
        maxBytes === null ? "unknown" : Math.floor(maxBytes / (1024 * 1024))
      }MB.`,
      400,
    );
  }

  const resourceType = mediaType === "IMAGE" ? "image" : "video";
  const publicId = makePublicId(purpose);

  let result: CloudinaryUploadResult;
  try {
    result = await uploadToCloudinary(file.buffer, {
      folder,
      publicId,
      resourceType,
      contentType: file.mimetype,
      originalName: file.originalname,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new AppError("Cloudinary upload failed.", 502);
  }

  const mediaAsset = await prisma.mediaAsset.create({
    data: {
      userId,
      mediaType,
      purpose,
      secureUrl: result.secureUrl,
      publicId: result.publicId,
      resourceType: result.resourceType,
      format: result.format,
      mimeType: result.mimeType,
      originalName: file.originalname,
      bytes: result.bytes,
    },
  });

  return {
    id: mediaAsset.id,
    mediaType: mediaAsset.mediaType,
    purpose: mediaAsset.purpose,
    secureUrl: mediaAsset.secureUrl,
    publicId: mediaAsset.publicId,
    resourceType: mediaAsset.resourceType,
    format: mediaAsset.format,
    mimeType: mediaAsset.mimeType,
    originalName: mediaAsset.originalName,
    bytes: mediaAsset.bytes,
    createdAt: mediaAsset.createdAt,
  };
}

/** List the authenticated user's own media assets. */
export async function listMyMediaAssets(userId: number) {
  return prisma.mediaAsset.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      mediaType: true,
      purpose: true,
      secureUrl: true,
      publicId: true,
      resourceType: true,
      format: true,
      mimeType: true,
      originalName: true,
      bytes: true,
      createdAt: true,
    },
  });
}

/**
 * Delete a media asset: verify ownership (or admin), remove from Cloudinary,
 * then delete the DB record only after successful Cloudinary deletion.
 * Returns the deleted asset.
 */
export async function deleteMediaAsset({
  assetId,
  userId,
  role,
}: {
  assetId: number;
  userId: number;
  role: string;
}) {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id: assetId },
    select: { id: true, userId: true, publicId: true, resourceType: true },
  });

  if (!asset) {
    throw new AppError("Media asset not found.", 404);
  }

  const isOwner = asset.userId === userId;
  const isAdmin = role === "ADMIN";
  if (!isOwner && !isAdmin) {
    throw new AppError(
      "You do not have permission to delete this file.",
      403,
    );
  }

  // Delete from Cloudinary first using the correct resource_type.
  let cloudinaryError: unknown = null;
  try {
    await cloudinary.uploader.destroy(asset.publicId, {
      resource_type: asset.resourceType === "video" ? "video" : "image",
      type: "upload",
    });
  } catch (error) {
    cloudinaryError = error;
    console.error("Cloudinary delete error:", error);
  }

  // Only delete the DB record after Cloudinary deletion succeeded.
  if (cloudinaryError !== null) {
    throw new AppError("Failed to delete file from storage.", 502);
  }

  await prisma.mediaAsset.delete({ where: { id: assetId } });
  return { id: assetId };
}
