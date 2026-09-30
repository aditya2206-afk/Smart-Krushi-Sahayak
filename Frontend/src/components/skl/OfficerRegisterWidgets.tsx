import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OFFICER_STEP_LABELS } from "@/components/skl/OfficerRegisterForm";
import type { OfficerDocKey } from "@/components/skl/OfficerRegisterForm";

export function OfficerStepDots({ step }: { step: number }) {
  return (
    <ol className="mt-5 grid gap-2 sm:grid-cols-4">
      {OFFICER_STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const doneStep = step > n;
        return (
          <li
            key={label}
            className={`rounded-xl border px-3 py-2 text-xs font-medium ${active ? "border-primary bg-primary/5 text-primary" : doneStep ? "border-primary/40 text-primary" : "text-muted-foreground"}`}
          >
            <span className="mr-1.5 inline-grid size-5 place-items-center rounded-full border text-[11px]">
              {doneStep ? "✓" : n}
            </span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}

export function OfficerDocRow(props: {
  slotKey: OfficerDocKey;
  label: string;
  required: boolean;
  file: File | null;
  accept: string;
  onPick: (key: OfficerDocKey, file: File | undefined) => void;
  onRemove: (key: OfficerDocKey) => void;
}) {
  const { slotKey, label, required, file } = props;
  return (
    <div className="rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          {label} {required ? "*" : <span className="ml-1 font-normal text-muted-foreground">Optional</span>}
        </p>
        {file ? (
          <Badge variant="secondary" className="rounded-full">{file.name}</Badge>
        ) : (
          <Badge variant="outline" className="rounded-full">{required ? "Required" : "Optional"}</Badge>
        )}
      </div>
      {file && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="size-3.5" />
          <span className="truncate">{file.name} — {(file.size / 1024).toFixed(1)} KB</span>
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer">
          <input
            type="file"
            accept={props.accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              props.onPick(slotKey, f);
            }}
          />
          <span className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            <Upload className="size-4" />
            {file ? "Replace File" : "Choose File"}
          </span>
        </label>
        {file && (
          <Button type="button" variant="outline" size="sm" onClick={() => props.onRemove(slotKey)}>
            <X className="size-4" /> Remove
          </Button>
        )}
      </div>
    </div>
  );
}
