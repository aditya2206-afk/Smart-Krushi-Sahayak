import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";

// Load Backend/.env so this module works when imported by the server or run
// standalone. Cloudinary credentials are read only on the server and are
// never exported to the frontend.
dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Cloudinary credentials are not configured. Set CLOUDINARY_CLOUD_NAME, " +
      "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Backend/.env",
  );
}

// Signed uploads only: the SDK signs requests with the configured API secret.
// No unsigned upload presets are used anywhere in this module.
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export { cloudinary };

export type CloudinaryFolder =
  | "smart-krushi/farmer/crop-images"
  | "smart-krushi/farmer/voice-queries"
  | "smart-krushi/seller/products"
  | "smart-krushi/users/profiles"
  | "smart-krushi/officer/certificates";

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  mimeType: string;
  bytes: number;
  originalName?: string;
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * Upload a buffer to Cloudinary using a signed upload_stream.
 * resource_type is "image" for images and "video" for audio (Cloudinary treats
 * audio files as the video resource type).
 */
export function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: CloudinaryFolder;
    publicId: string;
    resourceType: "image" | "video";
    contentType: string;
    originalName?: string;
  },
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: options.resourceType,
        use_filename: false,
        unique_filename: false,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(
            error ?? new Error("Cloudinary upload returned no result"),
          );
          return;
        }
        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          mimeType: options.contentType,
          bytes: Number(result.bytes ?? 0),
          originalName: options.originalName,
          width: result.width,
          height: result.height,
          duration: result.duration,
        });
      },
    );
    Readable.from([buffer]).pipe(stream);
  });
}
