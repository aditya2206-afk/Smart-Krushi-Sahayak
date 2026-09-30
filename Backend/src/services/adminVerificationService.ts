import { prisma } from "../lib/prisma.js";
import { AppError } from "./authService.js";
import { REQUIRED_OFFICER_DOCUMENTS } from "../validators/officerVerificationValidator.js";
import type { OfficerVerificationFilterInput } from "../validators/officerVerificationValidator.js";

function paginationMeta(total: number, page: number, limit: number) {
  return { total, page, limit, totalPages: total === 0 ? 1 : Math.ceil(total / limit) };
}

export async function listOfficerVerifications(filters: OfficerVerificationFilterInput) {
  const where: Record<string, unknown> = { role: "OFFICER" };
  const and: Record<string, unknown>[] = [];
  if (filters.search) {
    and.push({
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }
  if (filters.status) and.push({ officerProfile: { verificationStatus: filters.status } });
  if (and.length > 0) (where as { AND: unknown }).AND = and;
  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where: where as never }),
    prisma.user.findMany({
      where: where as never,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      select: {
        id: true, name: true, email: true, role: true, isActive: true, createdAt: true,
        officerProfile: { include: { certificates: { orderBy: { uploadedAt: "desc" } } } },
      },
    }),
  ]);
  const officers = users.map((u) => {
    const certs = u.officerProfile?.certificates ?? [];
    const summary: Record<string, number> = { PENDING: 0, VERIFIED: 0, REJECTED: 0, REUPLOAD_REQUIRED: 0 };
    for (const c of certs) summary[c.status] = (summary[c.status] ?? 0) + 1;
    const { certificates: _omit, ...profileSafe } = u.officerProfile ?? ({} as Record<string, unknown>);
    void _omit;
    return {
      id: u.id, name: u.name, email: u.email, isActive: u.isActive, createdAt: u.createdAt,
      verificationStatus: u.officerProfile?.verificationStatus ?? "PENDING",
      officerProfile: u.officerProfile ? profileSafe : null,
      documentSummary: {
        total: certs.length, ...summary,
        required: REQUIRED_OFFICER_DOCUMENTS.map((t) => ({
          documentType: t, status: certs.find((c) => c.documentType === t)?.status ?? null,
        })),
      },
    };
  });
  return { officers, pagination: paginationMeta(total, filters.page, filters.limit) };
}

export async function getOfficerVerificationDetail(officerId: number) {
  const user = await prisma.user.findUnique({
    where: { id: officerId },
    select: {
      id: true, name: true, email: true, role: true, isActive: true, createdAt: true,
      officerProfile: { include: { certificates: { orderBy: { uploadedAt: "desc" } } } },
    },
  });
  if (!user || user.role !== "OFFICER") throw new AppError("Officer not found", 404);
  return {
    id: user.id, name: user.name, email: user.email,
    role: user.role, isActive: user.isActive, createdAt: user.createdAt,
    verificationStatus: user.officerProfile?.verificationStatus ?? "PENDING",
    verificationNote: user.officerProfile?.verificationNote ?? null,
    verifiedAt: user.officerProfile?.verifiedAt ?? null,
    verifiedById: user.officerProfile?.verifiedById ?? null,
    profile: user.officerProfile
      ? {
          id: user.officerProfile.id, phone: user.officerProfile.phone,
          designation: user.officerProfile.designation, qualification: user.officerProfile.qualification,
          specialization: user.officerProfile.specialization, department: user.officerProfile.department,
          experienceYears: user.officerProfile.experienceYears, officerId: user.officerProfile.officerId,
          district: user.officerProfile.district, state: user.officerProfile.state,
        }
      : null,
    certificates: user.officerProfile?.certificates ?? [],
  };
}

export async function reviewOfficerCertificate(
  certificateId: number,
  status: "PENDING" | "VERIFIED" | "REJECTED" | "REUPLOAD_REQUIRED",
  adminNote: string | undefined,
  adminId: number,
) {
  const existing = await prisma.officerCertificate.findUnique({
    where: { id: certificateId },
  });
  if (!existing) throw new AppError("Certificate not found", 404);
  const updated = await prisma.officerCertificate.update({
    where: { id: certificateId },
    data: {
      status, adminNote: adminNote?.trim() ? adminNote.trim() : null,
      reviewedAt: new Date(), reviewedById: adminId,
    },
  });
  if (status === "REUPLOAD_REQUIRED") {
    await prisma.officerProfile.update({
      where: { id: existing.officerProfileId },
      data: { verificationStatus: "REUPLOAD_REQUIRED" },
    });
    // TODO(notification): emit OFFICER_REUPLOAD_REQUIRED.
  }
  return updated;
}

export async function setOfficerAccountStatus(
  officerId: number,
  status: "PENDING" | "VERIFIED" | "REJECTED" | "REUPLOAD_REQUIRED",
  verificationNote: string | undefined,
  adminId: number,
) {
  const user = await prisma.user.findUnique({
    where: { id: officerId },
    include: { officerProfile: { include: { certificates: true } } },
  });
  if (!user || user.role !== "OFFICER") throw new AppError("Officer not found", 404);
  if (!user.officerProfile) {
    throw new AppError("Officer profile not found. Ask the officer to complete their profile first.", 400);
  }
  if (status === "VERIFIED") {
    const missing = REQUIRED_OFFICER_DOCUMENTS.filter(
      (t) => !user.officerProfile!.certificates.some((c) => c.documentType === t && c.status === "VERIFIED"),
    );
    if (missing.length > 0) {
      throw new AppError(
        `Cannot verify officer: required documents not verified (${missing.join(", ")}). Verify each required document first.`,
        400,
      );
    }
  }
  const updated = await prisma.officerProfile.update({
    where: { id: user.officerProfile.id },
    data: {
      verificationStatus: status,
      verificationNote: verificationNote?.trim() ? verificationNote.trim() : null,
      verifiedAt: status === "VERIFIED" ? new Date() : null,
      verifiedById: status === "VERIFIED" ? adminId : user.officerProfile.verifiedById,
    },
  });
  // TODO(notification): emit OFFICER_VERIFIED / OFFICER_REJECTED / OFFICER_REUPLOAD_REQUIRED.
  return updated;
}
