import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, ClipboardList, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  fetchMyQueries,
  formatQueryDate,
  type BackendQuery,
  type BackendQueryStatus,
} from "@/lib/skl/queries";
import { t } from "@/lib/skl/i18n";

const TABS: { label: string; value: BackendQueryStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Under Review", value: "IN_REVIEW" },
  { label: "Answered", value: "ANSWERED" },
  { label: "Resolved", value: "CLOSED" },
];

export function MyQuestionsPage() {
  const [queries, setQueries] = useState<BackendQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<BackendQueryStatus | "ALL">("ALL");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQueries(await fetchMyQueries());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your questions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open = useMemo(() => queries.find((x) => x.id === openId) ?? null, [queries, openId]);

  const filtered = queries.filter((x) => {
    const matchesTab = tab === "ALL" || x.status === tab;
    return (
      matchesTab &&
      `${x.title} ${x.cropName} ${x.category} #${x.id}`.toLowerCase().includes(q.toLowerCase())
    );
  });

  if (open) return <QueryDetail query={open} onBack={() => setOpenId(null)} />;

  return (
    <>
      <PageHeader
        title={t("My Questions")}
        subtitle={t("Every consultation you have submitted, with live status.")}
        breadcrumb={["Dashboard", "My Questions"]}
        action={
          <Link to="/app/$" params={{ _splat: "farmer/crop-help" }} search={{ tab: "ask" }}>
            <Button>{t("Ask New Question")}</Button>
          </Link>
        }
      />

      <Card className="mb-4 gap-0 p-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as BackendQueryStatus | "ALL")}>
          <TabsList className="flex-wrap">
            {TABS.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
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

      {loading ? (
        <Card className="gap-0 p-8 text-center text-sm text-muted-foreground">
          {t("Loading your questions...")}
        </Card>
      ) : error ? (
        <Card className="gap-0 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void load()}>
            {t("Retry")}
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
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
              onClick={() => setOpenId(x.id)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-primary">#{x.id}</span>
                    <Badge variant="secondary">{x.cropName}</Badge>
                    <Badge variant="outline">{x.category}</Badge>
                    <Badge variant="outline">{x.priority}</Badge>
                    <StatusBadge status={x.status} />
                  </div>
                  <p className="mt-1 font-semibold">{t(x.title)}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{t(x.description)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {formatQueryDate(x.createdAt)}
                    {x.answeredAt ? ` • Answered ${formatQueryDate(x.answeredAt)}` : ""}
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

export function QueryDetail({ query, onBack }: { query: BackendQuery; onBack: () => void }) {
  const rec = query.recommendation;
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
        subtitle={`#${query.id} • ${query.cropName} • ${query.category}`}
        breadcrumb={["Dashboard", "My Questions", `#${query.id}`]}
        action={<StatusBadge status={query.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title={t("Query Details")}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">{t("Crop")}</dt>
                <dd className="font-medium">{query.cropName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Category")}</dt>
                <dd className="font-medium">{query.category}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Priority")}</dt>
                <dd className="font-medium">{query.priority}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Submitted")}</dt>
                <dd className="font-medium">{formatQueryDate(query.createdAt)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">{t("Problem Description")}</dt>
                <dd className="mt-1 text-sm">{t(query.description)}</dd>
              </div>
            </dl>
          </SectionCard>

          {rec ? (
            <SectionCard
              title={t("Expert Recommendation")}
              desc={`Shared on ${formatQueryDate(rec.createdAt)}`}
            >
              <Badge className="rounded-full gap-1">
                <BadgeCheck className="size-3" /> {t("Provided by verified Krushi Adhikari")}
              </Badge>
              <div className="mt-4 space-y-4 text-sm">
                <Block label={t("Diagnosis")} value={rec.diagnosis} />
                <Block label={t("Recommended Treatment")} value={rec.recommendation} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="gap-0 bg-pale/60 p-4">
                    <p className="text-xs text-muted-foreground">
                      {t("Fertilizer Recommendation")}
                    </p>
                    <p className="font-semibold">{rec.fertilizerAdvice || t("Not specified")}</p>
                  </Card>
                  <Card className="gap-0 bg-pale/60 p-4">
                    <p className="text-xs text-muted-foreground">{t("Pesticide Recommendation")}</p>
                    <p className="font-semibold">{rec.pesticideAdvice || t("Not specified")}</p>
                  </Card>
                </div>
                {rec.additionalNotes && (
                  <Block label={t("Additional Notes")} value={rec.additionalNotes} />
                )}
                <p className="text-xs text-muted-foreground">
                  — {rec.officer?.name ?? "Krushi Adhikari"}, Krushi Adhikari
                </p>
              </div>
            </SectionCard>
          ) : (
            <Card className="gap-0 border-dashed p-8 text-center">
              <p className="font-medium">{t("Recommendation not received yet")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your query is with the district Krushi Adhikari team.
              </p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <SectionCard title={t("Responding Officer")}>
            {rec?.officer ? (
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-pale font-semibold text-forest">
                  {rec.officer.name.slice(0, 1)}
                </span>
                <div>
                  <p className="font-semibold">{rec.officer.name}</p>
                  <p className="text-xs text-muted-foreground">{t("Krushi Adhikari")}</p>
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

export function PrescribedTreatmentPlan({ query }: { query: BackendQuery }) {
  void query;
  return null;
}
