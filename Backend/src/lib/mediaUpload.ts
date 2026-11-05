import crypto from "node:crypto";
import multer from "multer";
import type { CloudinaryFolder } from "./cloudinary.js";

/** Maximum upload sizes enforced on the backend. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15 MB

export const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const AUDIO_MIME_TYPES = new Set([
  "audio/mpeg", // MP3
  "audio/wav", // WAV
  "audio/mp4", // M4A
  "audio/ogg", // OGG
  "audio/webm", // WEBM
]);

export const ALLOWED_MIME_TYPES = new Set([...IMAGE_MIME_TYPES, ...AUDIO_MIME_TYPES]);

/** Client-supplied values are never trusted for storage location. The folder
 * is derived server-side from the validated purpose only. */
export const PURPOSE_FOLDERS: Record<string, CloudinaryFolder> = {
  "crop-images": "smart-krushi/farmer/crop-images",
  "voice-queries": "smart-krushi/farmer/voice-queries",
  products: "smart-krushi/seller/products",
  profiles: "smart-krushi/users/profiles",
  certificates: "smart-krushi/officer/certificates",
};

export type MediaPurpose = keyof typeof PURPOSE_FOLDERS;

/** Look up the server-side Cloudinary folder for a purpose. Returns null for
 * any purpose the client is not allowed to request. */
export function folderForPurpose(purpose: unknown): CloudinaryFolder | null {
  if (typeof purpose !== "string") return null;
  return PURPOSE_FOLDERS[purpose] ?? null;
}

export function resourceTypeForMediaType(mediaType: string): "image" | "video" | null {
  if (mediaType === "IMAGE") return "image";
  if (mediaType === "AUDIO") return "video"; // Cloudinary serves audio as video
  return null;
}

export function mimeTypeAllowedForMediaType(mediaType: string, mimeType: string): boolean {
  const normalized = mimeType.toLowerCase();
  if (mediaType === "IMAGE") return IMAGE_MIME_TYPES.has(normalized);
  if (mediaType === "AUDIO") return AUDIO_MIME_TYPES.has(normalized);
  return false;
}

export function maxBytesForMediaType(mediaType: string): number | null {
  if (mediaType === "IMAGE") return MAX_IMAGE_BYTES;
  if (mediaType === "AUDIO") return MAX_AUDIO_BYTES;
  return null;
}

function uniquePublicId(prefix: string): string {
  const safePrefix = String(prefix)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "media";
  return `${safePrefix}-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
}

/** Memory storage: files are kept in RAM and streamed straight to Cloudinary.
 * Nothing is written to the local disk. */
const storage = multer.memoryStorage();

function fileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  const mime = file.mimetype.toLowerCase();
  // Accept any supported image or audio MIME type. The precise MIME/size
  // match for the declared mediaType is enforced in the upload service.
  if (ALLOWED_MIME_TYPES.has(mime)) {
    cb(null, true);
    return;
  }
  cb(new Error(`Unsupported file type: ${file.mimetype}`));
}

/** 15 MB ceiling matches the largest allowed category (audio). Image size is
 * enforced per-category in mediaUpload.limits checks downstream. */
export const mediaUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_AUDIO_BYTES, files: 1 },
});

/** Generate a unique, non-predictable public id. Folder names and user ids
 * supplied by clients are never embedded in it. */
export function makePublicId(purpose: MediaPurpose): string {
  return uniquePublicId(`smart-krushi/${purpose}`);
}
