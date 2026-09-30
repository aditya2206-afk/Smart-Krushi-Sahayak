import { API_BASE_URL, authFetch } from "./auth";
import type { OfficerVerificationStatus } from "./auth";
import type { OfficerCertificateDto } from "./officerVerification";

export interface AdminOfficerRow {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  verificationStatus: OfficerVerificationStatus;
  officerProfile: Record<string, unknown> | null;
  documentSummary: {
    total: number;
    PENDING: number;
    VERIFIED: number;
    REJECTED: number;
    REUPLOAD_REQUIRED: number;
    required: { documentType: string; status: OfficerVerificationStatus | null }[];
  };
}

export interface AdminOfficerDetail {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  verificationStatus: OfficerVerificationStatus;
  verificationNote: string | null;
  verifiedAt: string | null;
  verifiedById: number | null;
  profile: Record<string, unknown> | null;
  certificates: OfficerCertificateDto[];
}

function errMsg(status: number, body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const m = (body as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  if (status === 401) return "Session expired. Please login again.";
  if (status === 403) return "You do not have permission to access this resource.";
  return fallback;
}

async function parse(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function adminFetchOfficers(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ officers: AdminOfficerRow[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const q = new URLSearchParams();
  if (params.status && params.status !== "All") q.set("status", params.status.toUpperCase().replace(/ /g, "_"));
  if (params.search?.trim()) q.set("search", params.search.trim());
  q.set("page", String(params.page ?? 1));
  q.set("limit", String(params.limit ?? 20));
  const res = await authFetch(`${API_BASE_URL}/api/admin/officer-verifications?${q.toString()}`, { method: "GET" });
  const body = (await parse(res)) as {
    success: boolean;
    officers?: AdminOfficerRow[];
    pagination?: { total: number; page: number; limit: number; totalPages: number };
    message?: string;
  } | null;
  if (!res.ok || !body?.officers) throw new Error(errMsg(res.status, body, "Failed to load officers."));
  return {
    officers: body.officers,
    pagination: body.pagination ?? { total: body.officers.length, page: 1, limit: 20, totalPages: 1 },
  };
}

export async function adminFetchOfficerDetail(officerId: number): Promise<AdminOfficerDetail> {
  const res = await authFetch(`${API_BASE_URL}/api/admin/officer-verifications/${officerId}`, { method: "GET" });
  const body = (await parse(res)) as { success: boolean; officer?: AdminOfficerDetail; message?: string } | null;
  if (!res.ok || !body?.officer) throw new Error(errMsg(res.status, body, "Failed to load officer."));
  return body.officer;
}

export async function adminReviewCertificate(
  certificateId: number,
  status: OfficerVerificationStatus,
  adminNote?: string,
): Promise<OfficerCertificateDto> {
  const res = await authFetch(`${API_BASE_URL}/api/admin/officer-certificates/${certificateId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, ...(adminNote !== undefined ? { adminNote } : {}) }),
  });
  const body = (await parse(res)) as {
    success: boolean;
    certificate?: OfficerCertificateDto;
    message?: string;
  } | null;
  if (!res.ok || !body?.certificate) throw new Error(errMsg(res.status, body, "Failed to save review."));
  return body.certificate;
}

export async function adminSetOfficerStatus(
  officerId: number,
  status: OfficerVerificationStatus,
  verificationNote?: string,
): Promise<unknown> {
  const res = await authFetch(`${API_BASE_URL}/api/admin/officer-verifications/${officerId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, ...(verificationNote !== undefined ? { verificationNote } : {}) }),
  });
  const body = (await parse(res)) as { success: boolean; profile?: unknown; message?: string } | null;
  if (!res.ok) throw new Error(errMsg(res.status, body, "Failed to update officer status."));
  return (body as { profile?: unknown }).profile ?? null;
}
