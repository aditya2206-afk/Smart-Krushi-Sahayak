import { z } from "zod";

export const officerDocumentTypes = [
  "DEGREE_CERTIFICATE",
  "APPOINTMENT_CERTIFICATE",
  "OFFICER_ID",
  "EXPERIENCE_CERTIFICATE",
  "OTHER",
] as const;

export const officerDocumentStatuses = [
  "PENDING",
  "VERIFIED",
  "REJECTED",
  "REUPLOAD_REQUIRED",
] as const;

export const officerVerificationStatuses = [
  "PENDING",
  "VERIFIED",
  "REJECTED",
  "REUPLOAD_REQUIRED",
] as const;

/** Required before an officer account itself can be VERIFIED. */
export const REQUIRED_OFFICER_DOCUMENTS: readonly string[] = [
  "DEGREE_CERTIFICATE",
  "APPOINTMENT_CERTIFICATE",
  "OFFICER_ID",
];

/**
 * Multer field names used by POST /api/auth/register-officer
 * (multipart/form-data) mapped to OfficerDocumentType values.
 */
export const OFFICER_REGISTRATION_FILE_FIELDS = {
  degreeCertificate: "DEGREE_CERTIFICATE",
  appointmentCertificate: "APPOINTMENT_CERTIFICATE",
  officerIdDocument: "OFFICER_ID",
  experienceCertificate: "EXPERIENCE_CERTIFICATE",
  otherDocument: "OTHER",
} as const;

export type OfficerRegistrationFileField = keyof typeof OFFICER_REGISTRATION_FILE_FIELDS;

/** Multipart text fields for one-shot officer registration. Files arrive via multer. */
export const registerOfficerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email address").max(255),
  phone: z.string().trim().min(1, "Phone Number is required").max(20),
  password: z.string().min(8, "Password must be at least 8 characters long").max(64),
  qualification: z.string().trim().min(1, "Qualification is required").max(120),
  designation: z.string().trim().min(1, "Designation is required").max(120),
  department: z.string().trim().min(1, "Department / Organization is required").max(120),
  specialization: z.string().trim().min(1, "Specialization is required").max(120),
  experienceYears: z.coerce.number().int("Years of Experience must be a whole number").min(0).max(60),
  officerId: z.string().trim().min(1, "Officer ID / Registration ID is required").max(60),
  district: z.string().trim().max(120).optional(),
  state: z.string().trim().max(120).optional(),
});

export type RegisterOfficerInput = z.infer<typeof registerOfficerSchema>;

export const uploadCertificateSchema = z
  .object({
    documentType: z.enum(officerDocumentTypes, {
      error: "documentType must be one of: DEGREE_CERTIFICATE, APPOINTMENT_CERTIFICATE, OFFICER_ID, EXPERIENCE_CERTIFICATE, OTHER",
    }),
  })
  .strict();


export const reviewCertificateSchema = z
  .object({
    status: z.enum(officerDocumentStatuses, {
      error: "status must be one of: PENDING, VERIFIED, REJECTED, REUPLOAD_REQUIRED",
    }),
    adminNote: z.string().trim().max(1000).optional(),
  })
  .strict();

export const verifyOfficerAccountSchema = z
  .object({
    status: z.enum(officerVerificationStatuses, {
      error: "status must be one of: PENDING, VERIFIED, REJECTED, REUPLOAD_REQUIRED",
    }),
    verificationNote: z.string().trim().max(1000).optional(),
  })
  .strict();

export const officerVerificationFilterSchema = z.object({
  status: z
    .enum(officerVerificationStatuses, { error: "Invalid verification status" })
    .optional(),
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type UploadCertificateInput = z.infer<typeof uploadCertificateSchema>;
export type ReviewCertificateInput = z.infer<typeof reviewCertificateSchema>;
export type VerifyOfficerAccountInput = z.infer<typeof verifyOfficerAccountSchema>;
export type OfficerVerificationFilterInput = z.infer<typeof officerVerificationFilterSchema>;
