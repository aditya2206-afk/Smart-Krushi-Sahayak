import { API_BASE_URL, authFetch } from "./auth";

export type MediaType = "IMAGE" | "AUDIO";
export type MediaPurpose =
  | "crop-images"
  | "voice-queries"
  | "products"
  | "profiles"
  | "certificates";

export interface MediaAsset {
  id: number;
  mediaType: MediaType;
  purpose: MediaPurpose;
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  mimeType: string;
  originalName: string;
  bytes: number;
  createdAt: string;
}

interface UploadMediaResponse {
  success: boolean;
  message?: string;
  media: MediaAsset;
}

interface ListMyMediaResponse {
  success: boolean;
  media: MediaAsset[];
}

interface DeleteMediaResponse {
  success: boolean;
  message?: string;
}

function errorMessage(status: number, body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const m = (body as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  if (status === 401) return "Session expired. Please login again.";
  if (status === 403) return "You do not have permission to do that.";
  return fallback;
}

async function parseBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** Upload a single file to the backend (signed, server-side). */
export async function uploadMediaFile({
  file,
  mediaType,
  purpose,
  onProgress,
}: {
  file: File;
  mediaType: MediaType;
  purpose: MediaPurpose;
  onProgress?: (percent: number) => void;
}): Promise<MediaAsset> {
  const form = new FormData();
  form.set("file", file);
  form.set("mediaType", mediaType);
  form.set("purpose", purpose);

  const xhr = new XMLHttpRequest();
  const promise = new Promise<MediaAsset>((resolve, reject) => {
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const body = JSON.parse(xhr.responseText) as UploadMediaResponse;
          if (body?.success && body.media) {
            resolve(body.media);
          } else {
            reject(new Error(body?.message || "Upload failed."));
          }
        } catch {
          reject(new Error("Upload failed: invalid server response."));
        }
      } else {
        const body = parseBodyFromText(xhr.responseText);
        reject(new Error(errorMessage(xhr.status, body, "Upload failed.")));
      }
    });
    xhr.addEventListener("error", () => {
      reject(new Error("Network error while uploading."));
    });
    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was cancelled."));
    });
  });

  xhr.open("POST", `${API_BASE_URL}/api/media/upload`);
  const token = localStorage.getItem("authToken");
  if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
  // Do NOT set Content-Type: multipart/form-data boundary must be set by the browser.
  xhr.send(form);

  return promise;
}

function parseBodyFromText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** List the authenticated user's own media assets. */
export async function fetchMyMedia(): Promise<MediaAsset[]> {
  const res = await authFetch(`${API_BASE_URL}/api/media/my-files`, {
    method: "GET",
  });
  const body = (await parseBody(res)) as ListMyMediaResponse | null;
  if (!res.ok || !body?.media) {
    throw new Error(errorMessage(res.status, body, "Failed to load your files."));
  }
  return body.media;
}

/** Delete a media asset (owner or admin only). */
export async function deleteMediaFile(id: number): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/api/media/${id}`, {
    method: "DELETE",
  });
  const body = (await parseBody(res)) as DeleteMediaResponse | null;
  if (!res.ok) {
    throw new Error(errorMessage(res.status, body, "Failed to delete file."));
  }
}

export function mediaTypeFromMime(mimeType: string): MediaType {
  const m = mimeType.toLowerCase();
  if (m.startsWith("image/")) return "IMAGE";
  if (m.startsWith("audio/")) return "AUDIO";
  return "IMAGE";
}

export function acceptForMediaType(mediaType: MediaType): string {
  if (mediaType === "IMAGE") return "image/jpeg,image/png,image/webp";
  if (mediaType === "AUDIO") return "audio/mpeg,audio/wav,audio/mp4,audio/ogg,audio/webm";
  return "*/*";
}

export function maxSizeForMediaType(mediaType: MediaType): number {
  if (mediaType === "IMAGE") return 5 * 1024 * 1024; // 5 MB
  if (mediaType === "AUDIO") return 15 * 1024 * 1024; // 15 MB
  return 5 * 1024 * 1024;
}
