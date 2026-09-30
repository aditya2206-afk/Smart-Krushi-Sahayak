import { OFFICER_ACCEPT_ATTR } from "@/components/skl/OfficerRegisterForm";
import { OFFICER_DOC_SLOTS } from "@/components/skl/OfficerRegisterForm";
import type { OfficerDocKey } from "@/components/skl/OfficerRegisterForm";
import { OfficerDocRow } from "@/components/skl/OfficerRegisterWidgets";

export function OfficerRegisterDocuments(props: {
  files: Record<OfficerDocKey, File | null>;
  onPick: (key: OfficerDocKey, file: File | undefined) => void;
  onRemove: (key: OfficerDocKey) => void;
}) {
  return (
    <div className="grid gap-4">
      <h2 className="text-base font-semibold">Step 3 — Verification Documents</h2>
      <p className="text-xs text-muted-foreground">Accepted formats: PDF, JPG, JPEG, PNG. Max 5MB per file.</p>
      {OFFICER_DOC_SLOTS.map((slot) => (
        <OfficerDocRow
          key={slot.key}
          slotKey={slot.key}
          label={slot.label}
          required={slot.required}
          file={props.files[slot.key]}
          accept={OFFICER_ACCEPT_ATTR}
          onPick={props.onPick}
          onRemove={props.onRemove}
        />
      ))}
    </div>
  );
}
