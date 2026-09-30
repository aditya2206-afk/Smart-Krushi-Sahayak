import { prisma } from "../lib/prisma.js";
import { AppError } from "./authService.js";
import { REQUIRED_OFFICER_DOCUMENTS } from "../validators/officerVerificationValidator.js";

export const OFFICER_VERIFICATION_MESSAGES: Record<string, string> = {
  PENDING: "Your account is currently under review by the administrator.",
  VERIFIED: "Your account has been verified successfully.",
  REJECTED: "Your verification was rejected. Please review the administrator's note.",
  REUPLOAD_REQUIRED: "One or more documents must be uploaded again.",
};

export const DOCUMENT_LABELS: Record<string, string> = {
  DEGREE_CERTIFICATE: "Degree Certificate",
  APPOINTMENT_CERTIFICATE: "Appointment Certificate",
  OFFICER_ID: "Officer ID / Registration ID",
  EXPERIENCE_CERTIFICATE: "Experience Certificate",
  OTHER: "Other Supporting Document",
};

export async function ensureOfficerProfile(userId: number) {
  let profile = await prisma.officerProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await prisma.officerProfile.create({
      data: { userId, verificationStatus: "PENDING" },
    });
  }
  return profile;
}

export async function getOfficerVerification(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "OFFICER") throw new AppError("Officer account not found", 404);
  const profile = await ensureOfficerProfile(userId);
  const certificates = await prisma.officerCertificate.findMany({
    where: { officerProfileId: profile.id },
    orderBy: { uploadedAt: "desc" },
  });
  const checklist = [...REQUIRED_OFFICER_DOCUMENTS, "EXPERIENCE_CERTIFICATE"].map((t) => {
    const docs = certificates.filter((c) => c.documentType === t);
    const latest = docs[0] ?? null;
    return {
      documentType: t,
      label: DOCUMENT_LABELS[t] ?? t,
      required: REQUIRED_OFFICER_DOCUMENTS.includes(t),
      // Explicit NOT_UPLOADED keeps PENDING-with-no-docs distinct from failed loads.
      status: latest?.status ?? "NOT_UPLOADED",
      certificate: latest,
    };
  });
  return {
    success: true as const,
    data: {
      verificationStatus: profile.verificationStatus,
      verificationNote: profile.verificationNote,
      verifiedAt: profile.verifiedAt,
      message: OFFICER_VERIFICATION_MESSAGES[profile.verificationStatus] ?? "",
      profile: {
        id: profile.id,
        designation: profile.designation,
        qualification: profile.qualification,
        specialization: profile.specialization,
        department: profile.department,
        experienceYears: profile.experienceYears,
        officerId: profile.officerId,
        district: profile.district,
        state: profile.state,
        phone: profile.phone,
      },
      user: { id: user.id, name: user.name, email: user.email },
      checklist,
      certificates,
    },
    // TODO(notification): emit OFFICER_VERIFIED / OFFICER_REJECTED /
    // OFFICER_REUPLOAD_REQUIRED events here when the Notifications module lands.
  };
}

interface UploadInput {
  userId: number;
  documentType: "DEGREE_CERTIFICATE" | "APPOINTMENT_CERTIFICATE" | "OFFICER_ID" | "EXPERIENCE_CERTIFICATE" | "OTHER";
  fileUrl: string;
  originalFileName?: string | undefined;
  mimeType?: string | undefined;
  fileSize?: number | undefined;
}

export async function uploadOfficerCertificate(input: UploadInput) {
  const profile = await ensureOfficerProfile(input.userId);
  if (profile.verificationStatus === "VERIFIED") {
    // Allow keeping docs fresh, but a replaced required doc drops account back to review.
  }
  // Replacement semantics: one live row per documentType per officer.
  const existing = await prisma.officerCertificate.findFirst({
    where: { officerProfileId: profile.id, documentType: input.documentType },
    orderBy: { uploadedAt: "desc" },
  });
  let certificate;
  if (existing) {
    certificate = await prisma.officerCertificate.update({
      where: { id: existing.id },
      data: {
        fileUrl: input.fileUrl,
        originalFileName: input.originalFileName ?? existing.originalFileName,
        mimeType: input.mimeType ?? existing.mimeType,
        fileSize: input.fileSize ?? existing.fileSize,
        status: "PENDING",
        adminNote: null,
        uploadedAt: new Date(),
        reviewedAt: null,
        reviewedById: null,
      },
    });
  } else {
    certificate = await prisma.officerCertificate.create({
      data: {
        officerProfileId: profile.id,
        documentType: input.documentType,
        fileUrl: input.fileUrl,
        originalFileName: input.originalFileName ?? null,
        mimeType: input.mimeType ?? null,
        fileSize: input.fileSize ?? null,
        status: "PENDING",
      },
    });
  }
  // If the officer was VERIFIED and re-uploads a required doc, move back to review.
  if (profile.verificationStatus === "VERIFIED" && REQUIRED_OFFICER_DOCUMENTS.includes(input.documentType)) {
    await prisma.officerProfile.update({
      where: { id: profile.id },
      data: { verificationStatus: "REUPLOAD_REQUIRED", verificationNote: `${DOCUMENT_LABELS[input.documentType] ?? input.documentType} was replaced and needs re-verification.`, verifiedAt: null },
    });
  } else if (profile.verificationStatus === "REJECTED" || profile.verificationStatus === "REUPLOAD_REQUIRED") {
    // Officer acted on feedback: back to PENDING account review.
    await prisma.officerProfile.update({
      where: { id: profile.id },
      data: { verificationStatus: "PENDING", verificationNote: null },
    });
  }
  return certificate;
}
