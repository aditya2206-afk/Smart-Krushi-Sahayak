import { API_BASE_URL, authFetch } from "./auth";
import type { OfficerVerificationStatus } from "./auth";

export type OfficerDocumentType =
  | "DEGREE_CERTIFICATE"
  | "APPOINTMENT_CERTIFICATE"
  | "OFFICER_ID"
  | "EXPERIENCE_CERTIFICATE"
  | "OTHER";

export interface OfficerCertificateDto {
  id: number;
  officerProfileId: number;
  documentType: OfficerDocumentType;
  fileUrl: string;
  originalFileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  status: OfficerVerificationStatus;
  adminNote: string | null;
  uploadedAt: string;
  reviewedAt: string | null;
  reviewedById: number | null;
}

export type OfficerChecklistStatus =
  | OfficerVerificationStatus
  | "NOT_UPLOADED";

export interface OfficerChecklistItem {
  documentType: OfficerDocumentType;
  label: string;
  required: boolean;
  status: OfficerChecklistStatus;
  certificate: OfficerCertificateDto | null;
}

export interface OfficerVerificationDto {
  verificationStatus: OfficerVerificationStatus;
  verificationNote: string | null;
  verifiedAt: string | null;
  message: string;
  profile: {
    id: number;
    designation: string | null;
    qualification: string | null;
    specialization: string | null;
    department: string | null;
    experienceYears: number | null;
    officerId: string | null;
    district: string | null;
    state: string | null;
    phone: string | null;
  };
  user: { id: number; name: string; email: string };
  checklist: OfficerChecklistItem[];
  certificates: OfficerCertificateDto[];
}

export const OFFICER_DOCUMENT_LABELS: Record<OfficerDocumentType, string> = {
  DEGREE_CERTIFICATE: "Degree Certificate",
  APPOINTMENT_CERTIFICATE: "Appointment Certificate",
  OFFICER_ID: "Officer ID / Registration ID",
  EXPERIENCE_CERTIFICATE: "Experience Certificate",
  OTHER: "Other Supporting Document",
};

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

export function officerFileUrl(fileUrl: string): string {
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${API_BASE_URL}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
}

export async function fetchOfficerVerification(): Promise<OfficerVerificationDto> {
  const res = await authFetch(`${API_BASE_URL}/api/officer/verification`, { method: "GET" });
  const body = (await parse(res)) as
    | { success: boolean; data?: OfficerVerificationDto; message?: string }
    | (OfficerVerificationDto & { success: boolean })
    | null;
  if (!res.ok || !body || body.success === false) {
    throw new Error(errMsg(res.status, body, "Failed to load verification status."));
  }
  // Backend returns { success: true, data: {...} }. Accept a legacy flat shape too.
  if (body && typeof body === "object" && "data" in body && body.data) {
    return body.data as OfficerVerificationDto;
  }
  return body as OfficerVerificationDto;
}

export async function uploadOfficerDocument(
  documentType: OfficerDocumentType,
  file: File,
): Promise<OfficerCertificateDto> {
  const form = new FormData();
  form.set("documentType", documentType);
  form.set("file", file, file.name);
  const res = await authFetch(`${API_BASE_URL}/api/officer/certificates`, {
    method: "POST",
    body: form,
  });
  const body = (await parse(res)) as {
    success: boolean;
    certificate?: OfficerCertificateDto;
    message?: string;
  } | null;
  if (!res.ok || !body?.certificate) {
    throw new Error(errMsg(res.status, body, "Failed to upload document."));
  }
  return body.certificate;
}
