import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, CheckCircle2, Clock, FileText } from "lucide-react";
import { ShieldAlert, ShieldCheck, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent } from "@/components/ui/select";
import { SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, PageHeader } from "@/components/skl/common";
import { SectionCard, StatCard } from "@/components/skl/common";
import { useStore } from "@/lib/skl/store";
import { OFFICER_DOCUMENT_LABELS } from "@/lib/skl/officerVerification";
import { fetchOfficerVerification, officerFileUrl } from "@/lib/skl/officerVerification";
import { uploadOfficerDocument } from "@/lib/skl/officerVerification";
import type { OfficerDocumentType } from "@/lib/skl/officerVerification";
import type { OfficerVerificationDto } from "@/lib/skl/officerVerification";
import { t } from "@/lib/skl/i18n";

const STATUS_META: Record<string, { label: string; tone: string; icon: typeof Clock }> = {
  PENDING: { label: "Pending", tone: "warning", icon: Clock },
  VERIFIED: { label: "Verified", tone: "forest", icon: BadgeCheck },
  REJECTED: { label: "Rejected", tone: "harvest", icon: XCircle },
  REUPLOAD_REQUIRED: { label: "Re-upload Required", tone: "harvest", icon: ShieldAlert },
};

const ALL_TYPES: OfficerDocumentType[] = [
  "DEGREE_CERTIFICATE",
  "APPOINTMENT_CERTIFICATE",
  "OFFICER_ID",
  "EXPERIENCE_CERTIFICATE",
  "OTHER",
];
export function OfficerVerificationStatusPage() {
  const { authUser } = useStore();
  const [data, setData] = useState<OfficerVerificationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchOfficerVerification());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const onFile = async (file: File | undefined, type: OfficerDocumentType) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }
    setUploading(true);
    try {
      await uploadOfficerDocument(type, file);
      toast.success(`${file.name} — uploaded for verification`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };
  const status = data?.verificationStatus ?? authUser?.verificationStatus ?? "PENDING";
  const meta = STATUS_META[status] ?? STATUS_META["PENDING"]!;
  const StatusIcon = meta.icon;
  const displayName = authUser?.name?.trim() || data?.user.name || "";
  return (
    <>
      <PageHeader
        title="Krushi Adhikari Verification"
        subtitle={displayName ? `${displayName} • ${authUser?.email ?? data?.user.email ?? ""}` : "Track verification."}
        breadcrumb={["Krushi Adhikari", "Verification"]}
      />
      {loading ? (
        <Card className="mt-4 p-8 text-center text-sm text-muted-foreground">Loading verification status…</Card>
      ) : error ? (
        <EmptyState icon={ShieldCheck} title="Could not load verification status" desc={error}
          action={<Button variant="outline" onClick={() => void load()}>Retry</Button>} />
      ) : (
        data && <VerificationBody data={data} status={status} onFile={onFile} uploading={uploading} StatusIcon={StatusIcon} />
      )}
    </>
  );
}
const STATUS_MESSAGES: Record<string, string> = {
  PENDING: "Your account is currently under review by the administrator.",
  VERIFIED: "Your account has been verified successfully.",
  REJECTED: "Your verification was rejected. Please review the administrator's note.",
  REUPLOAD_REQUIRED: "One or more documents must be uploaded again.",
};

function VerificationBody(props: {
  data: OfficerVerificationDto;
  status: string;
  onFile: (file: File | undefined, type: OfficerDocumentType) => Promise<void>;
  uploading: boolean;
  StatusIcon: typeof Clock;
}) {
  const { data, status, onFile, uploading, StatusIcon } = props;
  const meta = STATUS_META[status] ?? STATUS_META["PENDING"]!;
  const [docType, setDocType] = useState<OfficerDocumentType>("DEGREE_CERTIFICATE");
  return (
    <>
      <Card className="mt-4 gap-0 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-pale text-forest">
            <StatusIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Current Status</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">{meta.label}</Badge>
              {data.verifiedAt && (
                <span className="text-xs text-muted-foreground">
                  Verified on {new Date(data.verifiedAt).toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm">{data.message || STATUS_MESSAGES[status]}</p>
          </div>
        </div>
        {data.verificationNote && (
          <p className="mt-4 rounded-lg bg-muted/60 p-3 text-xs">
            <span className="font-medium">Admin note: </span>
            <span className="text-muted-foreground">{data.verificationNote}</span>
          </p>
        )}
      </Card>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} label="Documents Uploaded" value={data.certificates.length} />
        <StatCard icon={CheckCircle2} label="Verified" value={data.certificates.filter((c) => c.status === "VERIFIED").length} tone="forest" />
        <StatCard icon={ShieldCheck} label="Account Status" value={meta.label} tone={status === "VERIFIED" ? "forest" : "warning"} />
      </div>
      <SectionCard title="Professional Details" desc="From your officer profile." className="mt-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {(
            [
              ["Designation", data.profile.designation],
              ["Qualification", data.profile.qualification],
              ["Specialization", data.profile.specialization],
              ["Department", data.profile.department],
              ["Experience (years)", data.profile.experienceYears != null ? String(data.profile.experienceYears) : ""],
              ["Officer ID", data.profile.officerId],
              ["District", data.profile.district],
              ["State", data.profile.state],
              ["Phone", data.profile.phone],
            ] as [string, string | null][]
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground">{t(k)}</dt>
              <dd className="mt-0.5 font-medium">{v?.trim() ? v : "—"}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>
      <SectionCard title="Document Checklist" desc="Upload each required document." className="mt-4">
        {status === "PENDING" && data.certificates.length === 0 && (
          <p className="mb-3 rounded-lg bg-muted/60 p-3 text-sm">
            Your account is awaiting verification. Upload the required documents below.
          </p>
        )}
        <div className="space-y-3">
          {data.checklist.map((item) => {
            const itemMeta = item.status === "NOT_UPLOADED" ? null : (STATUS_META[item.status] ?? null);
            const needsReupload = item.status === "REUPLOAD_REQUIRED";
            return (
              <ChecklistRow
                key={item.documentType}
                item={item}
                itemLabel={itemMeta?.label ?? null}
                highlightReupload={needsReupload}
                onFile={onFile}
                uploading={uploading}
              />
            );
          })}
        </div>
        <div className="mt-4 rounded-xl border p-4">
          <Label>Upload a document</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            <Select value={docType} onValueChange={(v) => setDocType(v as OfficerDocumentType)}>
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>{ALL_TYPES.map((tt) => <SelectItem key={tt} value={tt}>{OFFICER_DOCUMENT_LABELS[tt]}</SelectItem>)}</SelectContent>
            </Select>
            <FilePickButton onFile={(f) => void onFile(f, docType)} uploading={uploading} label={uploading ? "Uploading…" : "Choose File"} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Accepted formats: PDF, JPG, JPEG, PNG. Max 5MB.</p>
        </div>
      </SectionCard>
    </>
  );
}


function ChecklistRow(props: {
  item: OfficerVerificationDto["checklist"][number];
  itemLabel: string | null;
  highlightReupload: boolean;
  onFile: (file: File | undefined, type: OfficerDocumentType) => Promise<void>;
  uploading: boolean;
}) {
  const { item, itemLabel, highlightReupload, onFile, uploading } = props;
  const isReupload = highlightReupload || item.status === "REUPLOAD_REQUIRED";
  return (
    <div className="rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">
            {item.label}
            {item.required && <span className="ml-2 text-[10px] text-muted-foreground">Required</span>}
            {!item.required && <span className="ml-2 text-[10px] text-muted-foreground">(Optional)</span>}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.certificate?.originalFileName ?? "No file uploaded yet"}</p>
          {isReupload && (
            <p className="mt-1 text-xs font-medium text-destructive">Re-upload Required</p>
          )}
        </div>
        {itemLabel ? (
          <Badge variant="secondary" className="rounded-full">{itemLabel}</Badge>
        ) : (
          <Badge variant="outline" className="rounded-full">Not uploaded</Badge>
        )}
      </div>
      {(item.certificate?.adminNote || isReupload) && (
        <p className="mt-3 rounded-lg bg-muted/60 p-3 text-xs">
          <span className="font-medium">Admin note: </span>
          <span className="text-muted-foreground">{item.certificate?.adminNote || "Please choose a new file and re-upload below."}</span>
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {item.certificate && (
          <a href={officerFileUrl(item.certificate.fileUrl)} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline">View</Button>
          </a>
        )}
        <FilePickButton
          onFile={(f) => void onFile(f, item.documentType)}
          uploading={uploading}
          small
          label={isReupload ? "Re-upload" : item.certificate ? "Replace" : "Upload"}
        />
      </div>
    </div>
  );
}

function FilePickButton(props: {
  onFile: (f: File | undefined) => void;
  uploading: boolean;
  label: string;
  small?: boolean | undefined;
}) {
  return (
    <label className="inline-flex">
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        disabled={props.uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          props.onFile(f);
        }}
      />
      <Button size={props.small ? "sm" : "default"} className="gap-1.5" disabled={props.uploading} asChild>
        <span>
          <Upload className="size-4" />
          {props.label}
        </span>
      </Button>
    </label>
  );
}
