import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  RotateCcw,
  Search,
  ShieldCheck,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/skl/common";
import { useStore } from "@/lib/skl/store";
import {
  REJECT_REASONS,
  SUSPEND_REASONS,
  certProgress,
  officerVerification,
  requiredCertsVerified,
  type OfficerCertificate,
  type OfficerRecord,
} from "@/lib/skl/data";
import { t } from "@/lib/skl/i18n";

/* --------------------------- Certificate preview -------------------------- */

export function CertificatePreview({
  cert,
  officer,
}: {
  cert: OfficerCertificate;
  officer: OfficerRecord;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 text-center shadow-sm">
      <p className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
        {t("Government of Maharashtra")}
      </p>
      <p className="mt-2 text-sm font-bold text-forest">{cert.authority}</p>
      <div className="mx-auto my-3 h-px w-24 bg-primary/40" />
      <p className="text-xs text-muted-foreground">{t("This is to certify that")}</p>
      <p className="mt-1 text-base font-semibold">{officer.name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{cert.name}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-left text-[11px]">
        <p>
          <span className="text-muted-foreground">{t("Certificate No.")}:</span> {cert.number}
        </p>
        <p>
          <span className="text-muted-foreground">{t("Issue Date")}:</span> {cert.issueDate}
        </p>
        <p>
          <span className="text-muted-foreground">{t("Validity")}:</span> {cert.validity}
        </p>
        <p>
          <span className="text-muted-foreground">{t("File")}:</span> {cert.file}
        </p>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <span className="grid size-12 place-items-center rounded-full border-2 border-dashed border-primary/40 text-[8px] leading-tight text-primary">
          {t("OFFICIAL SEAL")}
        </span>
        <span className="text-[10px] text-muted-foreground">{t("Authorised Signatory")}</span>
      </div>
    </div>
  );
}

/* ------------------------------ Officer list ------------------------------ */

export function AdminOfficersPage() {
  const { officers } = useStore();
  const [q, setQ] = useState("");
  const [verification, setVerification] = useState("All");
  const [status, setStatus] = useState("All");

  const list = officers.filter((o) => {
    const hay = `${o.name} ${o.mobile} ${o.district} ${o.officerId}`.toLowerCase();
    const v = officerVerification(o);
    return (
      hay.includes(q.toLowerCase().trim()) &&
      (verification === "All" || v === verification) &&
      (status === "All" || o.status === status)
    );
  });

  const verifiedCount = officers.filter((o) => officerVerification(o) === "Verified").length;
  const pendingCount = officers.filter(
    (o) => officerVerification(o) === "Pending Verification",
  ).length;
  const actionCount = officers.filter((o) => officerVerification(o) === "Action Required").length;

  return (
    <>
      <PageHeader
        title={t("Krushi Adhikaris")}
        subtitle={t(
          "Search, verify and manage every Krushi Adhikari account and their professional certificates.",
        )}
        breadcrumb={["Admin", "Krushi Adhikaris"]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label={t("Krushi Adhikaris")} value={officers.length} />
        <StatCard icon={BadgeCheck} label={t("Verified")} value={verifiedCount} tone="forest" />
        <StatCard
          icon={ShieldCheck}
          label={t("Pending Verification")}
          value={pendingCount}
          tone="warning"
        />
        <StatCard icon={XCircle} label={t("Action Required")} value={actionCount} tone="harvest" />
      </div>

      <Card className="my-4 gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Search by name, mobile, district or Officer ID")}
            className="pl-9"
          />
        </div>
        <Select value={verification} onValueChange={setVerification}>
          <SelectTrigger className="lg:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["All", "Verified", "Pending Verification", "Action Required"].map((v) => (
              <SelectItem key={v} value={v}>
                {t(v)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="lg:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["All", "Active", "Suspended"].map((v) => (
              <SelectItem key={v} value={v}>
                {t(v)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {list.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("No Krushi Adhikaris found")}
          desc={t("Try a different keyword or filter.")}
        />
      ) : (
        <SectionCard title={`${list.length} ${t("Krushi Adhikaris")}`}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Name")}</TableHead>
                  <TableHead>{t("Officer ID")}</TableHead>
                  <TableHead>{t("Mobile")}</TableHead>
                  <TableHead>{t("District")}</TableHead>
                  <TableHead>{t("Joined")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead>{t("Verification")}</TableHead>
                  <TableHead className="text-right">{t("Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">
                      {o.name}
                      <span className="block text-xs font-normal text-muted-foreground">
                        {t("Krushi Adhikari")}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{o.officerId}</TableCell>
                    <TableCell className="text-muted-foreground">{o.mobile}</TableCell>
                    <TableCell>{t(o.district)}</TableCell>
                    <TableCell className="text-muted-foreground">{o.joiningDate}</TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={officerVerification(o)} />
                    </TableCell>
                    <TableCell className="space-x-2 text-right whitespace-nowrap">
                      <Link to="/app/$" params={{ _splat: `admin/officers/${o.id}` }}>
                        <Button size="sm" variant="outline">
                          {t("View")}
                        </Button>
                      </Link>
                      <SuspendButton officer={o} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
    </>
  );
}

function SuspendButton({
  officer,
  size = "sm",
}: {
  officer: OfficerRecord;
  size?: "sm" | "default";
}) {
  const { suspendOfficer, restoreOfficer } = useStore();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(SUSPEND_REASONS[0]!);
  const [note, setNote] = useState("");

  if (officer.status === "Suspended") {
    return (
      <Button
        size={size}
        variant="outline"
        className="gap-1.5"
        onClick={() => {
          restoreOfficer(officer.id);
          toast.success(t("Account reactivated"));
        }}
      >
        <RotateCcw className="size-4" /> {t("Reactivate")}
      </Button>
    );
  }

  return (
    <>
      <Button
        size={size}
        variant="outline"
        className="gap-1.5 text-destructive"
        onClick={() => setOpen(true)}
      >
        <Ban className="size-4" /> {t("Suspend")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Suspend Account")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t(
              "Suspending blocks this Krushi Adhikari from replying to farmers. Verification status stays visible.",
            )}
          </p>
          <div>
            <Label>{t("Reason")}</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUSPEND_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("Details (optional)")}</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                suspendOfficer(officer.id, note.trim() ? `${reason} — ${note.trim()}` : reason);
                setOpen(false);
                toast.success(`${officer.name} — ${t("account suspended")}`);
              }}
            >
              {t("Suspend Account")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ----------------------------- Officer details ---------------------------- */

export function OfficerDetailPage({ officerId, tab }: { officerId: string; tab?: string }) {
  const { officers, verifyOfficerAccount, markAllCertsVerified, saveOfficerNote } = useStore();
  const navigate = useNavigate();
  const officer = officers.find((o) => o.id === officerId);
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState(officer?.adminNote ?? "");
  const [confirmVerify, setConfirmVerify] = useState(false);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const progress = useMemo(() => (officer ? certProgress(officer) : null), [officer]);

  if (!officer || !progress) {
    return (
      <>
        <PageHeader
          title={t("Krushi Adhikari Details")}
          breadcrumb={["Admin", "Krushi Adhikaris"]}
        />
        <EmptyState
          icon={Users}
          title={t("Krushi Adhikari not found")}
          desc={t("This account may have been removed.")}
          action={
            <Link to="/app/$" params={{ _splat: "admin/officers" }}>
              <Button variant="outline">{t("Back to List")}</Button>
            </Link>
          }
        />
      </>
    );
  }

  const verification = officerVerification(officer);
  const canVerify = requiredCertsVerified(officer);
  const cert = officer.certificates.find((c) => c.id === selected) ?? null;

  return (
    <>
      <PageHeader
        title={t("Krushi Adhikari Details")}
        subtitle={t("Review professional information, qualifications and uploaded certificates.")}
        breadcrumb={["Admin", "Krushi Adhikaris", officer.name]}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => navigate({ to: "/app/$", params: { _splat: "admin/officers" } })}
            >
              <ArrowLeft className="size-4" /> {t("Back to List")}
            </Button>
            <SuspendButton officer={officer} size="default" />
            <Button
              className="gap-1.5"
              disabled={officer.accountVerified}
              onClick={() => {
                if (!canVerify) {
                  toast.error(
                    t("Required certificates must be verified before approving this account."),
                  );
                  return;
                }
                setConfirmVerify(true);
              }}
            >
              <BadgeCheck className="size-4" />
              {officer.accountVerified ? t("Verified") : t("Approve / Verify")}
            </Button>
          </div>
        }
      />

      <Card className="mb-4 gap-0 p-5 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-pale text-xl font-bold text-forest">
            {officer.initials}
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">{officer.name}</h2>
            <p className="text-sm text-muted-foreground">
              {t("Krushi Adhikari")} • {t(officer.district)} • {officer.officerId}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={officer.status} />
              <StatusBadge status={verification} />
              <Badge variant="secondary">
                {progress.verified}/{progress.total} {t("certificates verified")}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {officer.status === "Suspended" && officer.suspendReason && (
        <Card className="mb-4 gap-0 border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">{t("Account suspended")}</p>
          <p className="text-muted-foreground">{officer.suspendReason}</p>
        </Card>
      )}

      <Tabs defaultValue={tab === "profile" || tab === "activity" ? tab : "certifications"}>
        <TabsList>
          <TabsTrigger value="profile">{t("Profile")}</TabsTrigger>
          <TabsTrigger value="certifications">{t("Certifications")}</TabsTrigger>
          <TabsTrigger value="activity">{t("Activity")}</TabsTrigger>
        </TabsList>

        {/* ------------------------------ Profile ----------------------------- */}
        <TabsContent value="profile" className="mt-4">
          <SectionCard
            title={t("Professional Information")}
            desc={t("Submitted during Krushi Adhikari registration.")}
          >
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ["Qualification", officer.qualification],
                  ["Designation", officer.designation],
                  ["Department", officer.department],
                  ["Specialization", officer.specialization],
                  ["Experience", officer.experience],
                  ["Employee / Officer ID", officer.officerId],
                  ["Registration Number", officer.registrationNo],
                  ["Mobile", officer.mobile],
                  ["Email", officer.email],
                  ["District", officer.district],
                  ["Taluka", officer.taluka],
                  ["State", officer.state],
                  ["Joining Date", officer.joiningDate],
                  ["Office / Workplace", officer.office],
                  ["Office Address", officer.address],
                  ["Verification Status", verification],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted-foreground">{t(k)}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{t(v)}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>
        </TabsContent>

        {/* --------------------------- Certifications -------------------------- */}
        <TabsContent value="certifications" className="mt-4">
          <div className="grid gap-4 xl:grid-cols-3">
            <SectionCard
              title={t("Certificates & Verification")}
              desc={t("All certificates submitted by this Krushi Adhikari.")}
              className="xl:col-span-2"
            >
              <p className="mb-3 text-xs text-muted-foreground">
                {progress.total} {t("documents uploaded")} • {progress.verified} {t("verified")} •{" "}
                {officer.certificates.filter((c) => c.status !== "Verified").length}{" "}
                {t("awaiting action")}
              </p>

              {/* Desktop / tablet table */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("Certificate / Document")}</TableHead>
                      <TableHead>{t("Certificate No.")}</TableHead>
                      <TableHead>{t("Issuing Authority")}</TableHead>
                      <TableHead>{t("Issue Date")}</TableHead>
                      <TableHead>{t("Expiry / Validity")}</TableHead>
                      <TableHead>{t("Status")}</TableHead>
                      <TableHead className="text-right">{t("Action")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {officer.certificates.map((c) => (
                      <TableRow key={c.id} className={selected === c.id ? "bg-pale/60" : ""}>
                        <TableCell className="font-medium">
                          {t(c.name)}
                          {c.required && (
                            <span className="block text-xs font-normal text-muted-foreground">
                              {t("Required document")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{c.number}</TableCell>
                        <TableCell>{c.authority}</TableCell>
                        <TableCell className="text-muted-foreground">{c.issueDate}</TableCell>
                        <TableCell className="text-muted-foreground">{t(c.validity)}</TableCell>
                        <TableCell>
                          <StatusBadge status={c.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => setSelected(c.id)}>
                            {t("View")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {officer.certificates.map((c) => (
                  <div key={c.id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold">{t(c.name)}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.number} • {c.authority}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("Issued")} {c.issueDate} • {t(c.validity)}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full"
                      onClick={() => setSelected(c.id)}
                    >
                      {t("View")}
                    </Button>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Desktop preview panel */}
            <div className="hidden xl:block">
              {cert ? (
                <CertificatePanel officer={officer} cert={cert} onClose={() => setSelected(null)} />
              ) : (
                <SectionCard
                  title={t("Document Preview")}
                  desc={t("Select a certificate to review it here.")}
                >
                  <div className="grid place-items-center rounded-xl border border-dashed py-14 text-center">
                    <FileText className="size-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t("No document selected")}
                    </p>
                  </div>
                </SectionCard>
              )}
            </div>
          </div>

          {/* Admin verification notes */}
          <SectionCard title={t("Admin Verification")} className="mt-4">
            <Textarea
              rows={3}
              maxLength={500}
              placeholder={t("Enter verification notes...")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  saveOfficerNote(officer.id, note);
                  toast.success(t("Verification note saved."));
                }}
              >
                {t("Save Note")}
              </Button>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  markAllCertsVerified(officer.id);
                  toast.success(t("All certificates verified."));
                }}
              >
                <CheckCircle2 className="size-4" /> {t("Mark All Verified")}
              </Button>
              <SuspendButton officer={officer} size="default" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("Last reviewed by")} {officer.lastReviewedBy ?? t("Not reviewed yet")}
              {officer.lastReviewedOn ? ` • ${officer.lastReviewedOn}` : ""}
            </p>
          </SectionCard>
        </TabsContent>

        {/* ------------------------------ Activity ---------------------------- */}
        <TabsContent value="activity" className="mt-4">
          <SectionCard
            title={t("Account Activity")}
            desc={t("Timeline of registration, certificate and verification events.")}
          >
            <ol className="relative space-y-4 border-l pl-6">
              {officer.activity.map((a, i) => (
                <li key={i}>
                  <span className="absolute -left-[7px] mt-1.5 size-3 rounded-full bg-primary" />
                  <p className="text-sm font-medium">{t(a.text)}</p>
                  <p className="text-xs text-muted-foreground">{a.date}</p>
                </li>
              ))}
            </ol>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Mobile / tablet full-screen preview */}
      <Dialog open={!!cert && !wide} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{cert && t(cert.name)}</DialogTitle>
          </DialogHeader>
          {cert && (
            <CertificatePanel
              officer={officer}
              cert={cert}
              onClose={() => setSelected(null)}
              bare
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmVerify} onOpenChange={setConfirmVerify}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Verify Krushi Adhikari")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("Verify")} {officer.name} {t("as a Krushi Adhikari?")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmVerify(false)}>
              {t("Cancel")}
            </Button>
            <Button
              onClick={() => {
                verifyOfficerAccount(officer.id);
                setConfirmVerify(false);
                toast.success(t("Krushi Adhikari verified successfully."));
              }}
            >
              {t("Verify Account")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* --------------------------- Certificate actions -------------------------- */

function CertificatePanel({
  officer,
  cert,
  onClose,
  bare = false,
}: {
  officer: OfficerRecord;
  cert: OfficerCertificate;
  onClose: () => void;
  bare?: boolean;
}) {
  const { setCertStatus } = useStore();
  const [action, setAction] = useState<null | "verify" | "reject" | "reupload">(null);
  const [reason, setReason] = useState(REJECT_REASONS[0]!);
  const [detail, setDetail] = useState("");

  const body = (
    <>
      <CertificatePreview cert={cert} officer={officer} />
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{t("Certificate No.")}</dt>
          <dd className="font-medium">{cert.number}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t("Issuing Authority")}</dt>
          <dd className="font-medium">{cert.authority}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t("Issue Date")}</dt>
          <dd className="font-medium">{cert.issueDate}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t("Validity")}</dt>
          <dd className="font-medium">{t(cert.validity)}</dd>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <dt className="text-xs text-muted-foreground">{t("Current Status")}</dt>
          <dd>
            <StatusBadge status={cert.status} />
          </dd>
        </div>
      </dl>
      {cert.adminNote && (
        <p className="mt-3 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{t("Admin note")}: </span>
          {t(cert.adminNote)}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => toast.info(`${cert.file} — ${t("opened in document viewer (demo)")}`)}
        >
          <ExternalLink className="size-4" /> {t("Open Full Document")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => toast.success(`${cert.file} — ${t("download started (demo)")}`)}
        >
          <Download className="size-4" /> {t("Download")}
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          size="sm"
          className="gap-1.5"
          disabled={cert.status === "Verified"}
          onClick={() => setAction("verify")}
        >
          <CheckCircle2 className="size-4" /> {t("Verify Certificate")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-destructive"
          onClick={() => setAction("reject")}
        >
          <XCircle className="size-4" /> {t("Reject")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setAction("reupload")}
        >
          <Upload className="size-4" /> {t("Request Re-upload")}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          {t("Close")}
        </Button>
      </div>

      {/* Verify confirmation */}
      <Dialog open={action === "verify"} onOpenChange={() => setAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Verify this certificate?")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t(cert.name)} • {cert.number}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              {t("Cancel")}
            </Button>
            <Button
              onClick={() => {
                setCertStatus(officer.id, cert.id, "Verified");
                setAction(null);
                toast.success(t("Certificate verified successfully."));
              }}
            >
              {t("Verify Certificate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject */}
      <Dialog open={action === "reject"} onOpenChange={() => setAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Reject Certificate")}</DialogTitle>
          </DialogHeader>
          <div>
            <Label>{t("Reason for rejection")}</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REJECT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("Details shared with the Krushi Adhikari")}</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              maxLength={300}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              {t("Cancel")}
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setCertStatus(
                  officer.id,
                  cert.id,
                  "Rejected",
                  detail.trim() ? `${reason} — ${detail.trim()}` : reason,
                );
                setAction(null);
                setDetail("");
                toast.error(t("Certificate rejected."));
              }}
            >
              {t("Reject Certificate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-upload */}
      <Dialog open={action === "reupload"} onOpenChange={() => setAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Request a new copy of this certificate.")}</DialogTitle>
          </DialogHeader>
          <div>
            <Label>{t("Reason")}</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              maxLength={300}
              placeholder={t("Uploaded scan is blurred. Please upload a clear PDF or image.")}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              {t("Cancel")}
            </Button>
            <Button
              onClick={() => {
                setCertStatus(
                  officer.id,
                  cert.id,
                  "Re-upload Required",
                  detail.trim() || "Uploaded scan is blurred. Please upload a clear PDF or image.",
                );
                setAction(null);
                setDetail("");
                toast.success(t("Re-upload requested."));
              }}
            >
              {t("Request Re-upload")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  if (bare) return <div>{body}</div>;
  return (
    <SectionCard title={t("Document Preview")} desc={t(cert.name)}>
      {body}
    </SectionCard>
  );
}
