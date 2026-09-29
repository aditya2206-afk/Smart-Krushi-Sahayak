import { API_BASE_URL, authFetch } from "./auth";

export interface AdminDashboardData {
  totalUsers: number;
  farmers: number;
  sellers: number;
  buyers: number;
  officers: number;
  admins: number;
  activeUsers: number;
  inactiveUsers: number;
  queries: { total: number; pending: number; answered: number };
  listings: { total: number; active: number };
  orders: { total: number; pending: number; completed: number };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "FARMER" | "SELLER" | "BUYER" | "OFFICER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  farmerProfile?: Record<string, unknown> | null;
  sellerProfile?: Record<string, unknown> | null;
  buyerProfile?: Record<string, unknown> | null;
  officerProfile?: Record<string, unknown> | null;
}

export function adminErrorMessage(status: number, body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const m = (body as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  if (status === 401) return "Session expired. Please login again.";
  if (status === 403) return "You do not have permission to access this resource.";
  return fallback;
}

export async function adminParseBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function adminGet<T>(path: string, fallback: string): Promise<T> {
  const res = await authFetch(`${API_BASE_URL}${path}`, { method: "GET" });
  const body = await adminParseBody(res);
  if (!res.ok) throw new Error(adminErrorMessage(res.status, body, fallback));
  return body as T;
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const body = await adminGet<{ success: boolean; data: AdminDashboardData }>(
    "/api/admin/dashboard",
    "Failed to load admin dashboard.",
  );
  return body.data;
}

export interface AdminUsersParams {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function fetchAdminUsers(
  params: AdminUsersParams = {},
): Promise<{ users: AdminUser[]; pagination: Pagination }> {
  const q = new URLSearchParams();
  if (params.role && params.role !== "All") q.set("role", params.role.toUpperCase());
  if (params.status && params.status !== "All") q.set("status", params.status.toLowerCase());
  if (params.search && params.search.trim()) q.set("search", params.search.trim());
  q.set("page", String(params.page ?? 1));
  q.set("limit", String(params.limit ?? 20));
  const body = await adminGet<{ success: boolean; users: AdminUser[]; pagination: Pagination }>(
    `/api/admin/users?${q.toString()}`,
    "Failed to load users.",
  );
  return { users: body.users ?? [], pagination: body.pagination };
}

export async function fetchAdminUserById(id: number): Promise<AdminUser> {
  const body = await adminGet<{ success: boolean; user: AdminUser }>(
    `/api/admin/users/${id}`,
    "Failed to load user.",
  );
  return body.user;
}

export async function updateAdminUserStatus(id: number, isActive: boolean): Promise<AdminUser> {
  const res = await authFetch(`${API_BASE_URL}/api/admin/users/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  const body = await adminParseBody(res);
  if (!res.ok) throw new Error(adminErrorMessage(res.status, body, "Failed to update user."));
  return (body as { user: AdminUser }).user;
}
