import { FileText, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export const OFFICER_MAX_FILE_BYTES = 5 * 1024 * 1024;
export const OFFICER_ACCEPT_ATTR = ".pdf,.jpg,.jpeg,.png";
const ACCEPTED_EXT = [".pdf", ".jpg", ".jpeg", ".png"];

export type OfficerDocKey =
  | "degreeCertificate"
  | "appointmentCertificate"
  | "officerIdDocument"
  | "experienceCertificate"
  | "otherDocument";

export const OFFICER_DOC_SLOTS: { key: OfficerDocKey; label: string; required: boolean }[] = [
  { key: "degreeCertificate", label: "Degree Certificate", required: true },
  { key: "appointmentCertificate", label: "Appointment Certificate", required: true },
  { key: "officerIdDocument", label: "Officer ID / Registration ID", required: true },
  { key: "experienceCertificate", label: "Experience Certificate", required: false },
  { key: "otherDocument", label: "Other Supporting Document", required: false },
];

export function officerValidFile(file: File): string | null {
  const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (!ACCEPTED_EXT.includes(ext)) return "Only PDF, JPG, JPEG and PNG files are allowed.";
  if (file.size > OFFICER_MAX_FILE_BYTES) return "File too large. Maximum size is 5MB per file.";
  if (file.size <= 0) return "Selected file is empty. Please choose a valid file.";
  return null;
}

export const OFFICER_STEP_LABELS = [
  "Account Details",
  "Professional Details",
  "Verification Documents",
  "Review & Submit",
];

