import { useRef, useState } from "react";
import { BadgeCheck, FileText, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, SectionCard, StatCard, StatusBadge } from "@/components/skl/common";
import { CertificatePreview } from "@/pages/admin/Officers";
import { useStore } from "@/lib/skl/store";
import { certProgress, officerVerification, type OfficerCertificate } from "@/lib/skl/data";
import { t } from "@/lib/skl/i18n";

/** Krushi Adhikari view of their own certificates — read-only except re-uploads. */
export function OfficerCertificationsPage() {
  const { officers, uploadCertificate } = useStore();
  const officer = officers.find((o) => o.id === "OF1") ?? officers[0];
  const fileRef = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<OfficerCertificate | null>(null);
  const [preview, setPreview] = useState<OfficerCertificate | null>(null);
  const [confirmReplace, setConfirmReplace] = useState<OfficerCertificate | null>(null);

  if (!officer) return null;
  const progress = certProgress(officer);
  const verification = officerVerification(officer);

  const pickFile = (cert: OfficerCertificate) => {
    setTarget(cert);
    fileRef.current?.click();
  };

  return (
    <>
      <PageHeader
        title={t("My Certifications")}
        subtitle={t(
          "Your professional certificates and their verification status with the Admin team.",
        )}
        breadcrumb={["Krushi Adhikari", "Certifications"]}
      />

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && target) {
            uploadCertificate(officer.id, target.id, file.name);
            toast.success(`${file.name} — ${t("uploaded for verification")}`);
          }
          e.target.value = "";
          setTarget(null);
        }}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} label={t("Documents Uploaded")} value={progress.total} />
        <StatCard icon={BadgeCheck} label={t("Verified")} value={progress.verified} tone="forest" />
        <StatCard
          icon={ShieldCheck}
          label={t("Account Status")}
          value={t(verification)}
          tone={verification === "Verified" ? "forest" : "warning"}
        />
      </div>

      <Card className="mt-4 gap-0 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">{t("Profile Verification")}</h2>
            <p className="text-xs text-muted-foreground">
              {progress.verified} {t("of")} {progress.total} {t("documents verified")}
            </p>
          </div>
          <StatusBadge status={verification} />
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${Math.round((progress.verified / Math.max(1, progress.total)) * 100)}%`,
            }}
          />
        </div>
      </Card>

      <SectionCard
        title={t("Professional Certifications")}
        desc={t(
          "Only the Admin team can verify documents. You can re-upload when a new copy is requested.",
        )}
        className="mt-4"
      >
        <div className="space-y-3">
          {officer.certificates.map((c) => (
            <div key={c.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{t(c.name)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(c.type)} • {c.number} • {t("Uploaded")} {c.uploadedAt}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.file}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              {c.adminNote && (
                <p className="mt-3 rounded-lg bg-muted/60 p-3 text-xs">
                  <span className="font-medium">{t("Admin comment")}: </span>
                  <span className="text-muted-foreground">{t(c.adminNote)}</span>
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setPreview(c)}>
                  {t("View")}
                </Button>
                {c.status === "Verified" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => setConfirmReplace(c)}
                  >
                    <Upload className="size-4" /> {t("Replace Document")}
                  </Button>
                ) : (
                  <Button size="sm" className="gap-1.5" onClick={() => pickFile(c)}>
                    <Upload className="size-4" /> {t("Upload New Document")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {t("Accepted formats: PDF, JPG, JPEG, PNG.")}
        </p>
      </SectionCard>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{preview && t(preview.name)}</DialogTitle>
          </DialogHeader>
          {preview && <CertificatePreview cert={preview} officer={officer} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmReplace} onOpenChange={() => setConfirmReplace(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Replace a verified document?")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t(
              "This certificate is already verified. Uploading a new copy will send it back for Admin verification.",
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReplace(null)}>
              {t("Cancel")}
            </Button>
            <Button
              onClick={() => {
                const c = confirmReplace;
                setConfirmReplace(null);
                if (c) pickFile(c);
              }}
            >
              {t("Choose File")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
