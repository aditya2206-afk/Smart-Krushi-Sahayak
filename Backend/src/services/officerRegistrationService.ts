import bcrypt from "bcryptjs";
import type { OfficerDocumentType } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { certificateFileUrl } from "../utils/officerUpload.js";
import { AppError, type SafeUser } from "./authService.js";
import { DOCUMENT_LABELS } from "./officerVerificationService.js";
import { REQUIRED_OFFICER_DOCUMENTS } from "../validators/officerVerificationValidator.js";
import type { RegisterOfficerInput } from "../validators/officerVerificationValidator.js";

const SALT_ROUNDS = 12;

export interface OfficerRegistrationFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
}

export type OfficerRegistrationFiles = Partial<Record<OfficerDocumentType, OfficerRegistrationFile>>;

export interface OfficerRegistrationResult {
  user: SafeUser;
  verificationStatus: "PENDING";
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

function requiredLabel(documentType: string): string {
  return DOCUMENT_LABELS[documentType] ?? documentType;
}

/**
 * One-shot Krushi Adhikari registration.
 * Creates User (OFFICER) + OfficerProfile (PENDING) + OfficerCertificate rows
 * (each PENDING) inside a single Prisma transaction. Throws AppError on any
 * validation failure; callers must delete already-stored files on failure.
 */
export async function registerOfficerWithDocuments(
  input: RegisterOfficerInput,
  files: OfficerRegistrationFiles,
): Promise<OfficerRegistrationResult> {
  for (const required of REQUIRED_OFFICER_DOCUMENTS) {
    if (!files[required as OfficerDocumentType]) {
      throw new AppError(`${requiredLabel(required)} is required.`, 400);
    }
  }

  const email = input.email.trim().toLowerCase();
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new AppError("Email already registered", 409);
  }

  const officerId = input.officerId.trim();
  const existingOfficerId = await prisma.officerProfile.findFirst({
    where: { officerId },
    select: { id: true },
  });
  if (existingOfficerId) {
    throw new AppError("Officer ID already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const certificateRows = (Object.entries(files) as Array<[OfficerDocumentType, OfficerRegistrationFile | undefined]>)
    .filter((entry): entry is [OfficerDocumentType, OfficerRegistrationFile] => Boolean(entry[1]))
    .map(([documentType, file]) => ({
      documentType,
      fileUrl: certificateFileUrl(file.filename),
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      status: "PENDING" as const,
    }));

  try {
    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name.trim(),
          email,
          password: hashedPassword,
          role: "OFFICER",
          officerProfile: {
            create: {
              phone: input.phone.trim(),
              designation: input.designation.trim(),
              qualification: input.qualification.trim(),
              specialization: input.specialization.trim(),
              department: input.department.trim(),
              experienceYears: input.experienceYears,
              officerId,
              district: input.district?.trim() ? input.district.trim() : null,
              state: input.state?.trim() ? input.state.trim() : null,
              verificationStatus: "PENDING",
            },
          },
        },
        include: { officerProfile: { select: { id: true, verificationStatus: true } } },
      });

      const profileId = user.officerProfile?.id;
      if (!profileId) throw new AppError("Failed to create officer profile", 500);

      for (const row of certificateRows) {
        await tx.officerCertificate.create({
          data: {
            officerProfileId: profileId,
            documentType: row.documentType,
            fileUrl: row.fileUrl,
            originalFileName: row.originalFileName,
            mimeType: row.mimeType,
            fileSize: row.fileSize,
            status: row.status,
          },
        });
      }

      return user;
    });

    const user: SafeUser = {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      isActive: created.isActive,
      verificationStatus: "PENDING",
    };
    return { user, verificationStatus: "PENDING" };
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    if (isUniqueConstraintError(error)) {
      throw new AppError("Email already registered", 409);
    }
    throw error;
  }
}
