import { API_BASE_URL, authFetch } from "./auth";
import type { BackendRole } from "./auth";

export interface ProfileUser {
  id: number;
  name: string;
  email: string;
  role: BackendRole;
  isActive: boolean;
}

export interface ProfileResponse {
  success: boolean;
  user: ProfileUser;
  profile: Record<string, unknown> | null;
  profileCompleted: boolean;
  message?: string;
}

function errorMessage(status: number, body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body && typeof (body as { message?: unknown }).message === "string") {
    const m = ((body as { message: string }).message || "").trim();
    if (m) return m;
  }
  if (status === 401) return "Session expired. Please login again.";
  return fallback;
}

export async function fetchMyProfile(): Promise<ProfileResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/profile/me`, { method: "GET" });
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) throw new Error(errorMessage(res.status, body, "Failed to load profile."));
  return body as ProfileResponse;
}

export async function updateMyProfile(payload: Record<string, unknown>): Promise<ProfileResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/profile/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) throw new Error(errorMessage(res.status, body, "Failed to update profile."));
  return body as ProfileResponse;
}

export function str(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return "";
}

export function cropsToString(v: unknown): string {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string").join(", ");
  return "";
}

export function cropsFromString(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}
