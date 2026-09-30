import { OFFICER_DOC_SLOTS } from "@/components/skl/OfficerRegisterForm";
import type { OfficerDocKey } from "@/components/skl/OfficerRegisterForm";

export function OfficerRegisterSummary(props: {
  name: string;
  email: string;
  phone: string;
  qualification: string;
  designation: string;
  department: string;
  specialization: string;
  experienceYears: string;
  officerId: string;
  files: Record<OfficerDocKey, File | null>;
}) {
  return (
    <div className="grid gap-4">
      <h2 className="text-base font-semibold">Step 4 — Review & Submit</h2>
      <div className="rounded-xl border p-4 text-sm">
        <p><span className="font-semibold">Name:</span> {props.name.trim() || "—"}</p>
        <p><span className="font-semibold">Email:</span> {props.email.trim() || "—"}</p>
        <p><span className="font-semibold">Phone:</span> {props.phone.trim() || "—"}</p>
        <p><span className="font-semibold">Qualification:</span> {props.qualification.trim() || "—"}</p>
        <p><span className="font-semibold">Designation:</span> {props.designation.trim() || "—"}</p>
        <p><span className="font-semibold">Department:</span> {props.department.trim() || "—"}</p>
        <p><span className="font-semibold">Specialization:</span> {props.specialization.trim() || "—"}</p>
        <p><span className="font-semibold">Experience:</span> {props.experienceYears.trim() ? `${props.experienceYears} year(s)` : "—"}</p>
        <p><span className="font-semibold">Officer ID:</span> {props.officerId.trim() || "—"}</p>
      </div>
      <div className="rounded-xl border p-4 text-sm">
        {OFFICER_DOC_SLOTS.map((slot) => (
          <p key={slot.key} className="flex items-center justify-between gap-2 py-0.5">
            <span>{slot.label}{slot.required ? " *" : ""}</span>
            <span className={props.files[slot.key] ? "font-medium text-primary" : "text-muted-foreground"}>
              {props.files[slot.key]?.name ?? "Not attached"}
            </span>
          </p>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        On submit, your User, OfficerProfile and certificate records are created together with verificationStatus PENDING for admin review.
      </p>
    </div>
  );
}
