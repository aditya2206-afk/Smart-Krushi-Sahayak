import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent } from "@/components/ui/select";
import { SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, PageHeader, SectionCard } from "@/components/skl/common";
import { adminFetchOfficerDetail } from "@/lib/skl/adminVerification";
import { adminReviewCertificate, adminSetOfficerStatus } from "@/lib/skl/adminVerification";
import type { AdminOfficerDetail } from "@/lib/skl/adminVerification";
import type { OfficerVerificationStatus } from "@/lib/skl/auth";
import { officerFileUrl } from "@/lib/skl/officerVerification";
import { t } from "@/lib/skl/i18n";

const DOC_STATUS: OfficerVerificationStatus[] = ["PENDING", "VERIFIED", "REJECTED", "REUPLOAD_REQUIRED"];
const ACCOUNT_STATUS: OfficerVerificationStatus[] = ["PENDING", "VERIFIED", "REJECTED", "REUPLOAD_REQUIRED"];

const fmt = (v: unknown): string => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v.trim() ? v : "—";
  return "—";
};

export function AdminOfficerDetailPage(props: { officerId: string }) {
  const id = Number(props.officerId);
  const [data, setData] = useState<AdminOfficerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [accountStatus, setAccountStatus] = useState<OfficerVerificationStatus>("VERIFIED");
  const [saving, setSaving] = useState(false);
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [reviewStatus, setReviewStatus] = useState<OfficerVerificationStatus>("VERIFIED");
  const [reviewNote, setReviewNote] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await adminFetchOfficerDetail(id);
      setData(detail);
      setNote(typeof detail.verificationNote === "string" ? detail.verificationNote : "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load officer.");
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);
  if (!Number.isInteger(id) || id <= 0) {
    return <EmptyState icon={BadgeCheck} title="Invalid officer id" desc="Check the URL and try again." />;
  }
  return (
    <>
      <PageHeader
        title={t("Krushi Adhikari Details")}
        subtitle={data ? `${data.name} • ${data.email}` : t("Review professional information and documents.")}
        breadcrumb={["Admin", "Krushi Adhikaris"]}
        action={
          <Link to="/app/$" params={{ _splat: "admin/officers" }}>
            <Button variant="outline" className="gap-1.5"><ArrowLeft className="size-4" /> {t("Back to List")}</Button>
          </Link>
        }
      />
      {loading ? (
        <Card className="mt-4 p-8 text-center text-sm text-muted-foreground">Loading officer…</Card>
      ) : error ? (
        <EmptyState icon={BadgeCheck} title="Could not load officer" desc={error}
          action={<Button variant="outline" onClick={() => void load()}>Retry</Button>} />
      ) : (
        data && (
          <DetailBody
            data={data}
            note={note}
            setNote={setNote}
            accountStatus={accountStatus}
            setAccountStatus={setAccountStatus}
            saving={saving}
            setSaving={setSaving}
            reload={load}
            reviewId={reviewId}
            setReviewId={setReviewId}
            reviewStatus={reviewStatus}
            setReviewStatus={setReviewStatus}
            reviewNote={reviewNote}
            setReviewNote={setReviewNote}
          />
        )
      )}
    </>
  );
}
function DetailBody(props: {
  data: AdminOfficerDetail;
  note: string;
  setNote: (v: string) => void;
  accountStatus: OfficerVerificationStatus;
  setAccountStatus: (v: OfficerVerificationStatus) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
  reload: () => Promise<void>;
  reviewId: number | null;
  setReviewId: (v: number | null) => void;
  reviewStatus: OfficerVerificationStatus;
  setReviewStatus: (v: OfficerVerificationStatus) => void;
  reviewNote: string;
  setReviewNote: (v: string) => void;
}) {
  const { data } = props;
  const profile = (data.profile ?? {}) as Record<string, unknown>;
  return (
    <>
      <Card className="mb-4 gap-0 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-pale font-bold text-forest">
            {data.name.trim().charAt(0).toUpperCase() || "O"}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">{data.name}</h2>
            <p className="text-sm text-muted-foreground">{data.email}</p>
          </div>
          <Badge variant="secondary" className="rounded-full">{data.verificationStatus}</Badge>
        </div>
      </Card>
      <DetailTabs data={data} profile={profile} setReviewId={props.setReviewId} setReviewStatus={props.setReviewStatus} setReviewNote={props.setReviewNote} />
      <AccountBox data={data} note={props.note} setNote={props.setNote} accountStatus={props.accountStatus} setAccountStatus={props.setAccountStatus} saving={props.saving} setSaving={props.setSaving} reload={props.reload} />
      <ReviewBox reviewId={props.reviewId} setReviewId={props.setReviewId} reviewStatus={props.reviewStatus} setReviewStatus={props.setReviewStatus} reviewNote={props.reviewNote} setReviewNote={props.setReviewNote} saving={props.saving} setSaving={props.setSaving} reload={props.reload} />
    </>
  );
}

function DetailTabs(props: {
  data: AdminOfficerDetail;
  profile: Record<string, unknown>;
  setReviewId: (v: number | null) => void;
  setReviewStatus: (v: OfficerVerificationStatus) => void;
  setReviewNote: (v: string) => void;
}) {
  const { data, profile } = props;
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="professional">Professional Information</TabsTrigger>
        <TabsTrigger value="certs">Certifications / Documents</TabsTrigger>
        <TabsTrigger value="activity">Verification Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-4">
        <SectionCard title="Profile">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-muted-foreground">Name</dt><dd className="font-medium">{data.name}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="font-medium">{data.email}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Account Active</dt><dd className="font-medium">{data.isActive ? "Yes" : "No"}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Joined</dt><dd className="font-medium">{new Date(data.createdAt).toLocaleString("en-IN")}</dd></div>
          </dl>
        </SectionCard>
      </TabsContent>
      <TabsContent value="professional" className="mt-4">
        <SectionCard title="Professional Information">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[["Designation", profile["designation"]], ["Qualification", profile["qualification"]], ["Specialization", profile["specialization"]], ["Department", profile["department"]], ["Experience Years", profile["experienceYears"]], ["Officer ID", profile["officerId"]], ["District", profile["district"]], ["State", profile["state"]], ["Phone", profile["phone"]]].map(([k, v]) => (
              <div key={String(k)}><dt className="text-xs text-muted-foreground">{t(String(k))}</dt><dd className="font-medium">{fmt(v)}</dd></div>
            ))}
          </dl>
        </SectionCard>
      </TabsContent>
      <TabsContent value="certs" className="mt-4">
        <SectionCard title="Certifications / Documents" desc="Preview uploads, then verify, reject or request re-upload.">
          {data.certificates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.certificates.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.documentType}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <a className="underline" href={officerFileUrl(c.fileUrl)} target="_blank" rel="noreferrer">
                          {c.originalFileName ?? "View file"}
                        </a>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="rounded-full">{c.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => { props.setReviewId(c.id); props.setReviewStatus("VERIFIED"); props.setReviewNote(c.adminNote ?? ""); }}>
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionCard>
      </TabsContent>
      <TabsContent value="activity" className="mt-4">
        <SectionCard title="Verification Activity">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-muted-foreground">Status</dt><dd className="font-medium">{data.verificationStatus}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Admin Note</dt><dd className="font-medium">{fmt(data.verificationNote)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Verified At</dt><dd className="font-medium">{data.verifiedAt ? new Date(data.verifiedAt).toLocaleString("en-IN") : "—"}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Verified By (admin id)</dt><dd className="font-medium">{data.verifiedById ?? "—"}</dd></div>
          </dl>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {data.certificates.map((c) => (
              <p key={c.id}>{c.documentType}: {c.status}{c.reviewedAt ? ` • reviewed ${new Date(c.reviewedAt).toLocaleString("en-IN")}` : ""}{c.adminNote ? ` • ${c.adminNote}` : ""}</p>
            ))}
          </div>
        </SectionCard>
      </TabsContent>
    </Tabs>
  );
}

function AccountBox(props: {
  data: AdminOfficerDetail;
  note: string;
  setNote: (v: string) => void;
  accountStatus: OfficerVerificationStatus;
  setAccountStatus: (v: OfficerVerificationStatus) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
  reload: () => Promise<void>;
}) {
  const save = async () => {
    if (props.accountStatus === "VERIFIED") {
      const required = ["DEGREE_CERTIFICATE", "APPOINTMENT_CERTIFICATE", "OFFICER_ID"];
      const missing = required.filter(
        (req) => !props.data.certificates.some((c) => c.documentType === req && c.status === "VERIFIED"),
      );
      if (missing.length > 0) {
        toast.error(`Required documents not verified: ${missing.join(", ")}`);
        return;
      }
      if (!window.confirm(`Verify ${props.data.name} as Krushi Adhikari?`)) return;
    } else if (!window.confirm(`Set ${props.data.name} status to ${props.accountStatus}?`)) {
      return;
    }
    props.setSaving(true);
    try {
      await adminSetOfficerStatus(props.data.id, props.accountStatus, props.note);
      toast.success("Officer verification status updated.");
      await props.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status.");
    } finally {
      props.setSaving(false);
    }
  };
  return (
    <SectionCard title="Verify Officer Account" desc="Required docs must all be VERIFIED first." className="mt-4">
      <div className="flex flex-wrap gap-2">
        <Select value={props.accountStatus} onValueChange={(v) => props.setAccountStatus(v as OfficerVerificationStatus)}>
          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
          <SelectContent>{ACCOUNT_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Button disabled={props.saving} onClick={() => void save()}>
          {props.saving ? "Saving…" : "Save Account Status"}
        </Button>
      </div>
      <div className="mt-3">
        <Label>Add note</Label>
        <Textarea className="mt-1.5" rows={3} maxLength={1000} value={props.note} onChange={(e) => props.setNote(e.target.value)} placeholder="Note shared with the officer…" />
      </div>
    </SectionCard>
  );
}

function ReviewBox(props: {
  reviewId: number | null;
  setReviewId: (v: number | null) => void;
  reviewStatus: OfficerVerificationStatus;
  setReviewStatus: (v: OfficerVerificationStatus) => void;
  reviewNote: string;
  setReviewNote: (v: string) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
  reload: () => Promise<void>;
}) {
  const save = async () => {
    if (props.reviewId == null) return;
    props.setSaving(true);
    try {
      await adminReviewCertificate(props.reviewId, props.reviewStatus, props.reviewNote);
      toast.success("Document review saved.");
      props.setReviewId(null);
      props.setReviewNote("");
      await props.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save review.");
    } finally {
      props.setSaving(false);
    }
  };
  return (
    <Dialog open={props.reviewId != null} onOpenChange={() => props.setReviewId(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Review document</DialogTitle></DialogHeader>
        <div>
          <Label>Status</Label>
          <Select value={props.reviewStatus} onValueChange={(v) => props.setReviewStatus(v as OfficerVerificationStatus)}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>{DOC_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Admin note</Label>
          <Textarea className="mt-1.5" rows={3} maxLength={1000} value={props.reviewNote} onChange={(e) => props.setReviewNote(e.target.value)} placeholder="e.g. Degree certificate verified." />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => props.setReviewId(null)}>Cancel</Button>
          <Button disabled={props.saving} onClick={() => void save()}>Save Review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

