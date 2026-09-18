import { API_BASE_URL, authFetch } from "./auth";

export type BackendQueryStatus = "PENDING" | "IN_REVIEW" | "ANSWERED" | "CLOSED";
export type BackendQueryPriority = "LOW" | "MEDIUM" | "HIGH";

export interface BackendRecommendation {
  id: number;
  queryId: number;
  officerId: number;
  diagnosis: string;
  recommendation: string;
  fertilizerAdvice: string | null;
  pesticideAdvice: string | null;
  additionalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  officer?: { id: number; name: string; email: string };
}

export interface BackendFarmerInfo {
  id: number;
  name: string;
  email: string;
  farmerProfile?: { village: string | null; district: string | null } | null;
}

export interface BackendQuery {
  id: number;
  farmerId: number;
  title: string;
  cropName: string;
  category: string;
  description: string;
  status: BackendQueryStatus;
  priority: BackendQueryPriority;
  createdAt: string;
  updatedAt: string;
  answeredAt: string | null;
  recommendation: BackendRecommendation | null;
  farmer?: BackendFarmerInfo;
}

function errorMessage(status: number, body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const m = (body as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  if (status === 401) return "Session expired. Please login again.";
  if (status === 403) return "You do not have permission to access this resource.";
  return fallback;
}

async function parseBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export interface CreateQueryPayload {
  title: string;
  cropName: string;
  category: string;
  description: string;
  priority?: BackendQueryPriority;
}


export async function createFarmerQuery(payload: CreateQueryPayload): Promise<BackendQuery> {
  const res = await authFetch(`${API_BASE_URL}/api/queries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await parseBody(res)) as { success: boolean; query?: BackendQuery; message?: string };
  if (!res.ok || !body?.query) throw new Error(errorMessage(res.status, body, "Failed to submit query."));
  return body.query;
}

export async function fetchMyQueries(): Promise<BackendQuery[]> {
  const res = await authFetch(`${API_BASE_URL}/api/queries/my`, { method: "GET" });
  const body = (await parseBody(res)) as { success: boolean; queries?: BackendQuery[]; message?: string };
  if (!res.ok) throw new Error(errorMessage(res.status, body, "Failed to load your questions."));
  return body.queries ?? [];
}

export async function fetchFarmerQueryById(id: number): Promise<BackendQuery> {
  const res = await authFetch(`${API_BASE_URL}/api/queries/${id}`, { method: "GET" });
  const body = (await parseBody(res)) as { success: boolean; query?: BackendQuery; message?: string };
  if (!res.ok || !body?.query) throw new Error(errorMessage(res.status, body, "Failed to load query."));
  return body.query;
}

export interface OfficerQueryFilters {
  status?: BackendQueryStatus;
  priority?: BackendQueryPriority;
  cropName?: string;
}

export async function fetchOfficerQueries(filters: OfficerQueryFilters = {}): Promise<BackendQuery[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.cropName) params.set("cropName", filters.cropName);
  const qs = params.toString();
  const res = await authFetch(`${API_BASE_URL}/api/officer/queries${qs ? `?${qs}` : ""}`, { method: "GET" });
  const body = (await parseBody(res)) as { success: boolean; queries?: BackendQuery[]; message?: string };
  if (!res.ok) throw new Error(errorMessage(res.status, body, "Failed to load farmer queries."));
  return body.queries ?? [];
}

export async function fetchOfficerQueryById(id: number): Promise<BackendQuery> {
  const res = await authFetch(`${API_BASE_URL}/api/officer/queries/${id}`, { method: "GET" });
  const body = (await parseBody(res)) as { success: boolean; query?: BackendQuery; message?: string };
  if (!res.ok || !body?.query) throw new Error(errorMessage(res.status, body, "Failed to load query."));
  return body.query;
}

export async function updateOfficerQueryStatus(id: number, status: BackendQueryStatus): Promise<BackendQuery> {
  const res = await authFetch(`${API_BASE_URL}/api/officer/queries/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const body = (await parseBody(res)) as { success: boolean; query?: BackendQuery; message?: string };
  if (!res.ok || !body?.query) throw new Error(errorMessage(res.status, body, "Failed to update status."));
  return body.query;
}

export interface RespondPayload {
  diagnosis: string;
  recommendation: string;
  fertilizerAdvice?: string;
  pesticideAdvice?: string;
  additionalNotes?: string;
}

export async function respondToOfficerQuery(
  id: number,
  payload: RespondPayload,
): Promise<{ recommendation: BackendRecommendation; query: BackendQuery }> {
  const res = await authFetch(`${API_BASE_URL}/api/officer/queries/${id}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await parseBody(res)) as {
    success: boolean;
    recommendation?: BackendRecommendation;
    query?: BackendQuery;
    message?: string;
  };
  if (!res.ok || !body?.recommendation || !body?.query) {
    throw new Error(errorMessage(res.status, body, "Failed to submit recommendation."));
  }
  return { recommendation: body.recommendation, query: body.query };
}

export const QUERY_CATEGORIES = [
  "Crop Disease",
  "Pest Attack",
  "Nutrient Deficiency",
  "Irrigation",
  "Soil Health",
  "Seed Selection",
  "Fertilizer Guidance",
  "Weather Damage",
  "Other",
];

export function formatQueryDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
