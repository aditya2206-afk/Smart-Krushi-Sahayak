export const API_BASE_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5000";

export const TOKEN_KEY = "authToken";
export const USER_KEY = "authUser";

export type BackendRole = "FARMER" | "SELLER" | "BUYER" | "OFFICER" | "ADMIN";
export type FrontendRole = "farmer" | "seller" | "buyer" | "officer" | "admin";

export interface SafeAuthUser {
  id: number;
  name: string;
  email: string;
  role: BackendRole;
  isActive?: boolean;
  createdAt?: string;
}

export interface LoginSuccess {
  success: true;
  message?: string | undefined;
  token: string;
  user: SafeAuthUser;
}

interface ApiErrorBody {
  success?: boolean;
  message?: string;
}

const PUBLIC_ROLES: BackendRole[] = ["FARMER", "SELLER", "BUYER", "OFFICER"];

export function isPublicRegisterRole(role: string): boolean {
  return (PUBLIC_ROLES as string[]).includes(role);
}

export function toFrontendRole(role: BackendRole): FrontendRole {
  return role.toLowerCase() as FrontendRole;
}

export function toBackendRole(role: string): BackendRole | null {
  const upper = role.trim().toUpperCase();
  if (upper === "FARMER" || upper === "SELLER" || upper === "BUYER") return upper;
  if (upper === "OFFICER" || upper === "ADMIN") return upper;
  return null;
}

export function dashboardPathForRole(role: BackendRole): string {
  switch (role) {
    case "FARMER":
      return "farmer/dashboard";
    case "SELLER":
      return "seller/dashboard";
    case "BUYER":
      return "buyer/dashboard";
    case "OFFICER":
      return "officer/dashboard";
    case "ADMIN":
      return "admin/dashboard";
  }
}

export function roleSegment(role: BackendRole): string {
  return role.toLowerCase();
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): SafeAuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SafeAuthUser;
    if (!parsed || typeof parsed.email !== "string") return null;
    if (!toBackendRole(String(parsed.role ?? ""))) return null;
    return parsed;
  } catch {
    return null;
  }
}

function toSafeUser(raw: unknown): SafeAuthUser {
  const u = raw as Record<string, unknown>;
  const isActive = u["isActive"];
  const createdAt = u["createdAt"];
  return {
    id: Number(u["id"]),
    name: String(u["name"] ?? ""),
    email: String(u["email"] ?? ""),
    role: toBackendRole(String(u["role"] ?? "")) ?? "FARMER",
    ...(typeof isActive === "boolean" ? { isActive } : {}),
    ...(typeof createdAt === "string" ? { createdAt } : {}),
  };
}

export function persistSession(token: string, user: SafeAuthUser): void {
  const safe: SafeAuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...(typeof user.isActive === "boolean" ? { isActive: user.isActive } : {}),
    ...(typeof user.createdAt === "string" ? { createdAt: user.createdAt } : {}),
  };
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(safe));
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* storage unavailable */
  }
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    if (body && typeof body.message === "string" && body.message.trim()) return body.message;
  } catch {
    /* non-JSON body */
  }
  return fallback;
}

export async function loginRequest(email: string, password: string): Promise<LoginSuccess> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Login failed. Please try again."));
  }
  const body = (await res.json()) as { success: boolean; token: string; user: unknown; message?: string };
  if (!body?.success || typeof body.token !== "string" || !body.user) {
    throw new Error("Login failed. Please try again.");
  }
  return { success: true, message: body.message, token: body.token, user: toSafeUser(body.user) };
}

export async function registerRequest(input: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<SafeAuthUser> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name.trim(),
      email: input.email.trim(),
      password: input.password,
      role: input.role.trim().toUpperCase(),
    }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Registration failed. Please try again."));
  }
  const body = (await res.json()) as { success: boolean; user: unknown; message?: string };
  if (!body?.success || !body.user) {
    throw new Error(body?.message || "Registration failed. Please try again.");
  }
  return toSafeUser(body.user);
}

export async function fetchCurrentUser(token: string): Promise<SafeAuthUser> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Invalid or expired token"));
  }
  const body = (await res.json()) as { success: boolean; user: unknown };
  if (!body?.success || !body.user) {
    throw new Error("Invalid or expired token");
  }
  return toSafeUser(body.user);
}

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const url = input.startsWith("http") ? input : `${API_BASE_URL}${input}`;
  return fetch(url, { ...init, headers });
}

export function friendlyAuthError(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (/invalid email or password/i.test(msg)) return "Invalid email or password";
  if (/email already registered/i.test(msg)) return "Email already registered";
  if (/invalid email address/i.test(msg)) return "Please enter a valid email address.";
  if (/password .*at least 8/i.test(msg)) return "Password must be at least 8 characters long.";
  if (/name is required/i.test(msg)) return "Please enter your full name.";
  if (/role must be one of/i.test(msg)) return "Choose Farmer, Seller, Buyer or Officer.";
  if (/invalid or expired token/i.test(msg)) return "Session expired. Please login again.";
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return "Cannot reach the server at http://localhost:5000. Is the backend running?";
  }
  return msg || fallback;
}
