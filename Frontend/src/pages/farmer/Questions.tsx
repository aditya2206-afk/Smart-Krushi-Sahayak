import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  ClipboardList,
  Download,
  FileText,
  MapPin,
  MessageSquare,
  Play,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceAdvisoryPlayer } from "@/components/skl/VoiceAdvisory";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, PageHeader, SectionCard, StatusBadge } from "@/components/skl/common";
import { useStore } from "@/lib/skl/store";
import { inputsForRecommendation, type Query } from "@/lib/skl/data";
import { t } from "@/lib/skl/i18n";

const TABS = ["All", "Pending", "Under Review", "Answered", "Resolved"];

export function MyQuestionsPage() {
  const { queries } = useStore();
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Query | null>(null);

  const mine = queries.filter((x) => x.farmer === "Ramesh Patil");
  const filtered = mine.filter((x) => {
    const t =
      tab === "All" || (tab === "Answered" ? x.status === "Expert Replied" : x.status === tab);
    return t && (x.title + x.crop + x.id).toLowerCase().includes(q.toLowerCase());
  });

  if (open) return <QueryDetail query={open} onBack={() => setOpen(null)} />;

  return (
    <>
      <PageHeader
        title={t("My Questions")}
        subtitle={t("Every consultation you have submitted, with live status.")}
        breadcrumb={["Dashboard", "My Questions"]}
        action={
          <Link to="/app/$" params={{ _splat: "farmer/ask" }}>
            <Button>{t("Ask New Question")}</Button>
          </Link>
        }
      />

      <Card className="mb-4 gap-0 p-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap">
            {TABS.map((t) => (
              <TabsTrigger key={t} value={t}>
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("Search by query ID, crop or problem")}
          className="mt-3"
        />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t("No questions here")}
          desc={t("Try another tab or ask a new question to your Krushi Adhikari.")}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((x) => (
            <Card
              key={x.id}
              className="hover-lift gap-0 cursor-pointer p-4"
              onClick={() => setOpen(x)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <img
                  src={x.images[0]}
                  alt={x.crop}
                  loading="lazy"
                  width={120}
                  height={120}
                  className="h-20 w-full rounded-xl object-cover sm:size-20"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-primary">{x.id}</span>
                    <Badge variant="secondary">{x.crop}</Badge>
                    <StatusBadge status={x.status} />
                  </div>
                  <p className="mt-1 font-semibold">{t(x.title)}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{t(x.description)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {x.createdAt} • Officer: {x.officer ?? "Awaiting assignment"} •
                    Updated {x.updatedAt}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t("View Details")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export function QueryDetail({ query, onBack }: { query: Query; onBack: () => void }) {
  const { updateQueryStatus } = useStore();
  return (
    <>
      <button
        onClick={onBack}
        className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {t("Back to My Questions")}
      </button>
      <PageHeader
        title={t(query.title)}
        subtitle={`${query.id} • ${query.crop} • ${query.stage} stage`}
        breadcrumb={["Dashboard", "My Questions", query.id]}
        action={<StatusBadge status={query.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title={t("Query Details")}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">{t("Crop")}</dt>
                <dd className="font-medium">{query.crop}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Crop Stage")}</dt>
                <dd className="font-medium">{query.stage}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Location")}</dt>
                <dd className="font-medium">
                  <MapPin className="mr-1 inline size-3.5 text-primary" />
                  {query.farmerVillage}, {query.district}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Submitted")}</dt>
                <dd className="font-medium">{query.createdAt}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">{t("Problem Description")}</dt>
                <dd className="mt-1 text-sm">{t(query.description)}</dd>
              </div>
            </dl>
            {query.voiceNote && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  aria-label={t("Play voice note")}
                >
                  <Play className="size-4" />
                </Button>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("Voice recording")}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-border">
                    <div className="h-1.5 w-1/3 rounded-full bg-primary" />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{query.voiceNote}</span>
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {query.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Uploaded crop photo ${i + 1}`}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="h-24 w-full rounded-xl border object-cover"
                />
              ))}
            </div>
          </SectionCard>

          {query.recommendation ? (
            <SectionCard
              title={t("Expert Recommendation")}
              desc={`Shared on ${query.recommendation.date}`}
            >
              <Badge className="rounded-full gap-1">
                <BadgeCheck className="size-3" /> {t("Provided by verified Krushi Adhikari")}
              </Badge>
              <div className="mt-4 space-y-4 text-sm">
                <Block label={t("Diagnosis")} value={query.recommendation.diagnosis} />
                <Block label={t("Recommended Treatment")} value={query.recommendation.treatment} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="gap-0 bg-pale/60 p-4">
                    <p className="text-xs text-muted-foreground">
                      {t("Fertilizer Recommendation")}
                    </p>
                    <p className="font-semibold">{query.recommendation.fertilizer}</p>
                    <p className="text-sm text-forest">
                      Dose: {query.recommendation.fertilizerDose}
                    </p>
                  </Card>
                  <Card className="gap-0 bg-pale/60 p-4">
                    <p className="text-xs text-muted-foreground">{t("Pesticide Recommendation")}</p>
                    <p className="font-semibold">{query.recommendation.pesticide}</p>
                    <p className="text-sm text-forest">
                      Dose: {query.recommendation.pesticideDose}
                    </p>
                  </Card>
                </div>
                {query.recommendation.voiceAdvisory && (
                  <div>
                    <p className="mb-1.5 text-xs text-muted-foreground">{t("Voice Advisory")}</p>
                    <VoiceAdvisoryPlayer advisory={query.recommendation.voiceAdvisory} />
                  </div>
                )}
                <Block label={t("Precautions")} value={query.recommendation.precautions} />
                <Block label={t("Follow-up")} value={query.recommendation.followUp} />
                <p className="text-xs text-muted-foreground">
                  — {query.recommendation.officer}, Krushi Adhikari
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/app/$" params={{ _splat: "farmer/chat" }}>
                  <Button className="gap-2">
                    <MessageSquare className="size-4" /> {t("Chat with Expert")}
                  </Button>
                </Link>
                {query.status !== "Resolved" && (
                  <Button variant="outline" onClick={() => updateQueryStatus(query.id, "Resolved")}>
                    {t("Mark as Resolved")}
                  </Button>
                )}
              </div>
              <PrescribedTreatmentPlan query={query} />
            </SectionCard>
          ) : (
            <Card className="gap-0 border-dashed p-8 text-center">
              <p className="font-medium">{t("Recommendation not received yet")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your query is with {query.officer ?? "the district Krushi Adhikari team"}. Average
                response time is 18 minutes.
              </p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <SectionCard title={t("Query Timeline")}>
            <ol className="relative space-y-5 border-l pl-5">
              {query.timeline.map((ev) => (
                <li key={t(ev.label)} className="relative">
                  <span
                    className={`absolute -left-[26px] grid size-4 place-items-center rounded-full ${ev.done ? "bg-primary" : "bg-border"}`}
                  >
                    <span className="size-1.5 rounded-full bg-card" />
                  </span>
                  <p className={`text-sm font-medium ${ev.done ? "" : "text-muted-foreground"}`}>
                    {t(ev.label)}
                  </p>
                  <p className="text-xs text-muted-foreground">{ev.date}</p>
                </li>
              ))}
            </ol>
          </SectionCard>
          <SectionCard title={t("Assigned Officer")}>
            {query.officer ? (
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-pale font-semibold text-forest">
                  {query.officer.split(" ").slice(-1)[0]?.[0]}
                </span>
                <div>
                  <p className="font-semibold">{query.officer}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("Krushi Adhikari \u2022 Solapur")}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("Awaiting officer assignment.")}</p>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function printPrescription() {
  window.print();
}

export function PrescribedTreatmentPlan({ query }: { query: Query }) {
  const [open, setOpen] = useState(false);
  const rec = query.recommendation;
  const stocked = inputsForRecommendation(rec);
  if (!rec) return null;

  // Items come straight from the officer's diagnosis so the dosages always match.
  const items = [
    { kind: t("Fertilizer"), name: rec.fertilizer, dose: rec.fertilizerDose },
    { kind: t("Pesticide"), name: rec.pesticide, dose: rec.pesticideDose },
  ].filter((i) => i.name);

  const kendraFor = (name: string) =>
    stocked.find((p) => p.name.toLowerCase().includes(name.toLowerCase().split(" ")[0] ?? ""));
  const primary = kendraFor(items[0]?.name ?? "") ?? stocked[0];

  return (
    <>
      <Card className="mt-5 gap-0 border-primary/40 bg-pale/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-semibold">
            <ClipboardList className="size-4 text-primary" /> {t("Prescribed Treatment Plan")}
          </h3>
          <Badge variant="outline" className="rounded-full">
            {query.id}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            "Collect the prescribed items offline from verified local Krushi Seva Kendras using a printed PDF prescription.",
          )}
        </p>

        <div className="mt-4 space-y-2">
          {items.map((i) => {
            const k = kendraFor(i.name);
            return (
              <div key={i.name} className="rounded-xl border bg-card p-3">
                <p className="text-sm font-semibold">
                  {i.name}{" "}
                  <span className="text-xs font-normal text-muted-foreground">• {i.kind}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("Dosage")}: {i.dose}
                  {k ? ` • ${k.kendra} (${k.distance})` : ""}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="lg" className="gap-2" onClick={() => setOpen(true)}>
            <FileText className="size-4" /> {t("Generate PDF Prescription")}
          </Button>
          <Link
            to="/app/$"
            params={{ _splat: "farmer/services" }}
            search={primary ? { use: primary.id } : {}}
          >
            <Button size="lg" variant="ghost" className="gap-2">
              <Store className="size-4" /> {t("Find In Stock at Nearby Kendras")}
            </Button>
          </Link>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {t(
            "Dosages shown match your Krushi Adhikari's diagnosis exactly. Pickup is offline at the Kendra counter.",
          )}
        </p>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("Digital Prescription")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[65vh] space-y-4 overflow-y-auto rounded-xl border bg-white p-5 text-black">
            <div className="flex items-start justify-between gap-3 border-b pb-3">
              <div>
                <p className="text-base font-bold">Smart Krushi Sahayak</p>
                <p className="text-xs text-neutral-600">
                  {t("Official Digital Prescription")} • {query.id}
                </p>
                <p className="text-xs text-neutral-600">
                  {t("Date")}: {rec.date}
                </p>
              </div>
              <Badge className="gap-1 rounded-full">
                <BadgeCheck className="size-3" /> {t("Verified")}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <PdfField label={t("Farmer")} value={`${query.farmer}`} />
              <PdfField
                label={t("Village / District")}
                value={`${query.farmerVillage}, ${query.district}`}
              />
              <PdfField label={t("Crop")} value={query.crop} />
              <PdfField label={t("Prescribed by")} value={`${rec.officer}, Krushi Adhikari`} />
            </div>

            <PdfField label={t("Diagnosis")} value={rec.diagnosis} />

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {t("Chemicals & Dosage")}
              </p>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-100 text-left">
                    <th className="border p-2 font-medium">{t("Type")}</th>
                    <th className="border p-2 font-medium">{t("Product")}</th>
                    <th className="border p-2 font-medium">{t("Dosage")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.name}>
                      <td className="border p-2">{i.kind}</td>
                      <td className="border p-2">{i.name}</td>
                      <td className="border p-2">{i.dose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PdfField label={t("Safety Instructions")} value={rec.precautions} />

            <div className="flex items-end justify-between border-t pt-4 text-xs text-neutral-600">
              <p>{t("Show this printed prescription at the Kendra counter for offline pickup.")}</p>
              <div className="text-center">
                <div className="mb-1 h-8 w-32 border-b border-dashed" />
                <p>{t("Officer Signature")}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("Close")}
            </Button>
            <Button className="gap-2" onClick={printPrescription}>
              <Download className="size-4" /> {t("Download PDF")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PdfField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
