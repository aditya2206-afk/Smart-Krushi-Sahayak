import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  Bug,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  Filter,
  ListChecks,
  Search,
  Send,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/skl/common";
import {
  CHART_DATA,
  PLATFORM_USERS,
  cropImages,
} from "@/lib/skl/data";
import {
  fetchOfficerQueries,
  formatQueryDate,
  respondToOfficerQuery,
  updateOfficerQueryStatus,
  type BackendQuery,
  type OfficerQueryFilters,
} from "@/lib/skl/queries";
import { t } from "@/lib/skl/i18n";
import { useStore } from "@/lib/skl/store";

const CHART_COLORS = ["#2E7D32", "#66BB6A", "#F9A825", "#26A69A", "#8D6E63", "#5C6BC0"];

export function OfficerDashboard() {
  const { authUser } = useStore();
  const displayName = authUser?.name?.trim() ?? "";
  const [recent, setRecent] = useState<BackendQuery[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await fetchOfficerQueries({});
        if (cancelled) return;
        setRecent(all.slice(0, 4));
        setPendingCount(all.filter((x) => x.status === "PENDING").length);
        setAnsweredCount(all.filter((x) => x.status === "ANSWERED" || x.status === "CLOSED").length);
      } catch {
        if (!cancelled) {
          setRecent([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHeader
        title={displayName ? `Welcome, ${displayName}! 👋` : `Welcome! 👋`}
        subtitle={t(
          "Agriculture Officer \u2022 Solapur District \u2022 Soybean, Cotton & Pulses specialist",
        )}
        breadcrumb={["Krushi Adhikari", "Dashboard"]}
        action={
          <Button className="gap-2" onClick={() => toast.success("Availability set to Online")}>
            {t("Mark Available")}
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/app/$" params={{ _splat: "officer/pending" }}>
          <StatCard
            icon={ClipboardList}
            label={t("Pending Queries")}
            value={pendingCount}
            hint={t("Awaiting first response")}
            tone="warning"
          />
        </Link>
        <Link to="/app/$" params={{ _splat: "officer/queries" }}>
          <StatCard
            icon={ListChecks}
            label={t("All Queries")}
            value={recent.length}
            hint={t("Latest submissions")}
          />
        </Link>
        <Link to="/app/$" params={{ _splat: "officer/reports" }}>
          <StatCard
            icon={CheckCircle2}
            label={t("Resolved This Month")}
            value={46 + answeredCount}
            hint={t("+12% vs July")}
            tone="forest"
          />
        </Link>
        <Link to="/app/$" params={{ _splat: "officer/reports" }}>
          <StatCard
            icon={Clock}
            label={t("Avg Response Time")}
            value="18 min"
            hint={t("Target: under 30 min")}
            tone="harvest"
          />
        </Link>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard
          title={t("Queries & Resolutions")}
          desc={t("Last 6 months")}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={CHART_DATA.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="queries"
                stroke="#2E7D32"
                strokeWidth={2}
                name={t("Received")}
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke="#F9A825"
                strokeWidth={2}
                name={t("Resolved")}
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title={t("Queries by Crop")}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={CHART_DATA.queriesByCrop}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={85}
              >
                {CHART_DATA.queriesByCrop.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard
          title={t("Recent Farmer Queries")}
          desc={t("Newest submissions from your district")}
          action={
            <Link to="/app/$" params={{ _splat: "officer/queries" }}>
              <Button size="sm" variant="outline">
                {t("View all")}
              </Button>
            </Link>
          }
        >
          <div className="space-y-3">
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("No farmer queries yet.")}</p>
            )}
            {recent.map((x) => (
              <Link
                key={x.id}
                to="/app/$"
                params={{ _splat: "officer/queries" }}
                className="flex flex-wrap items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t(x.title)}</p>
                  <p className="text-xs text-muted-foreground">
                    {x.farmer?.name ?? "Farmer"} • {x.cropName} • {formatQueryDate(x.createdAt)}
                  </p>
                </div>
                <StatusBadge status={x.status} />
              </Link>
            ))}
          </div>
        </SectionCard>
        <SectionCard title={t("District Alerts")} desc={t("Solapur & nearby talukas")}>
          <div className="space-y-3 text-sm">
            {[
              [
                "Pest Outbreak",
                "Yellow mosaic virus reported in 9 villages of Malshiras taluka.",
                "warning",
              ],
              [
                "Weather",
                "Heavy rain alert for 22-23 Aug. Advise farmers to stop spraying.",
                "harvest",
              ],
              ["Advisory Due", "Onion storage advisory pending for Sangola cluster.", "primary"],
            ].map(([t, b]) => (
              <div key={t} className="rounded-xl bg-pale/60 p-3">
                <p className="font-medium text-forest">{t}</p>
                <p className="text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="mb-1 text-xs text-muted-foreground">{t("Monthly resolution target")}</p>
            <Progress value={78} />
            <p className="mt-1 text-xs text-muted-foreground">{t("78% of 60 queries resolved")}</p>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

export function OfficerQueriesPage({
  mine = false,
  initialStatus = "All",
}: {
  mine?: boolean;
  initialStatus?: string;
}) {
  void mine;
  const [backendQueries, setBackendQueries] = useState<BackendQuery[]>([]);
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [crop, setCrop] = useState("All");
  const [status, setStatus] = useState(initialStatus);
  const [district, setDistrict] = useState("All");
  void district;
  void setDistrict;
  const [priority, setPriority] = useState("All");
  const [openId, setOpenId] = useState<number | null>(null);

  const loadOfficerQueries = useCallback(async () => {
    setBackendLoading(true);
    setBackendError(null);
    try {
      const filters: OfficerQueryFilters = {};
      if (status === "Pending") filters.status = "PENDING";
      else if (status === "Under Review") filters.status = "IN_REVIEW";
      else if (status === "Expert Replied") filters.status = "ANSWERED";
      else if (status === "Resolved") filters.status = "CLOSED";
      if (priority === "LOW" || priority === "MEDIUM" || priority === "HIGH") filters.priority = priority;
      if (crop !== "All") filters.cropName = crop;
      setBackendQueries(await fetchOfficerQueries(filters));
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : "Failed to load farmer queries.");
    } finally {
      setBackendLoading(false);
    }
  }, [status, priority, crop]);

  useEffect(() => {
    void loadOfficerQueries();
  }, [loadOfficerQueries]);

  const open = useMemo(
    () => backendQueries.find((x) => x.id === openId) ?? null,
    [backendQueries, openId],
  );

  const markInReview = async (query: BackendQuery) => {
    try {
      const updated = await updateOfficerQueryStatus(query.id, "IN_REVIEW");
      setBackendQueries((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
      toast.success(`Query #${query.id} marked as In Review`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const list = useMemo(
    () =>
      backendQueries.filter((x) =>
        (x.title + (x.farmer?.name ?? "") + String(x.id)).toLowerCase().includes(q.toLowerCase()),
      ),
    [backendQueries, q],
  );

  if (open)
    return (
      <AnswerQuery
        query={open}
        onBack={() => setOpenId(null)}
        onChanged={(updated) => {
          setBackendQueries((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
          setOpenId(updated.id);
        }}
      />
    );

  return (
    <>
      <PageHeader
        title={t(
          mine
            ? "My Assigned Queries"
            : initialStatus === "Pending"
              ? "Pending Queries"
              : "Farmer Queries",
        )}
        subtitle={t(
          mine
            ? "Consultations you have accepted and are handling."
            : initialStatus === "Pending"
              ? "Queries waiting for a first expert response."
              : "All incoming queries from farmers in your district.",
        )}
        breadcrumb={[
          "Krushi Adhikari",
          mine ? "Assigned" : initialStatus === "Pending" ? "Pending" : "Queries",
        ]}
      />
      <Card className="mb-4 gap-3 p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Search by farmer, crop or query ID")}
            className="pl-9"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Input
            value={crop === "All" ? "" : crop}
            onChange={(e) => setCrop(e.target.value.trim() === "" ? "All" : e.target.value)}
            placeholder={t("Filter by crop name")}
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder={t("Status")} />
            </SelectTrigger>
            <SelectContent>
              {[
                "All",
                "Pending",
                "Under Review",
                "Expert Replied",
                "Resolved",
              ].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder={t("Priority")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t("All Priorities")}</SelectItem>
              <SelectItem value="LOW">{t("Low")}</SelectItem>
              <SelectItem value="MEDIUM">{t("Medium")}</SelectItem>
              <SelectItem value="HIGH">{t("High")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input value={district === "All" ? "" : district} disabled placeholder={t("District filter coming soon")} />
          <Button variant="outline" onClick={() => void loadOfficerQueries()}>
            {t("Refresh")}
          </Button>
        </div>
      </Card>

      {backendLoading ? (
        <Card className="gap-0 p-8 text-center text-sm text-muted-foreground">
          {t("Loading farmer queries...")}
        </Card>
      ) : backendError ? (
        <Card className="gap-0 p-6 text-center">
          <p className="text-sm text-destructive">{backendError}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void loadOfficerQueries()}>
            {t("Retry")}
          </Button>
        </Card>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={t(initialStatus === "Pending" ? "No pending queries." : "No queries match")}
          desc={t("Adjust the filters to see more farmer queries.")}
        />
      ) : (
        <div className="space-y-3">
          {list.map((x) => (
            <Card key={x.id} className="hover-lift gap-0 p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">#{x.id}</Badge>
                    <StatusBadge status={x.status} />
                    <Badge variant="outline">{x.priority}</Badge>
                  </div>
                  <h3 className="mt-2 font-semibold">{t(x.title)}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{t(x.description)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {x.farmer?.name ?? "Farmer"} • {x.cropName} • {x.category} •{" "}
                    {formatQueryDate(x.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {x.status === "PENDING" && (
                    <Button size="sm" variant="outline" onClick={() => void markInReview(x)}>
                      {t("Mark In Review")}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setOpenId(x.id)}>
                    {t("View")}
                  </Button>
                  <Button size="sm" onClick={() => setOpenId(x.id)}>
                    {t("Respond")}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function AnswerQuery({
  query,
  onBack,
  onChanged,
}: {
  query: BackendQuery;
  onBack: () => void;
  onChanged: (updated: BackendQuery) => void;
}) {
  const [f, setF] = useState({
    diagnosis: query.recommendation?.diagnosis ?? "",
    recommendation: query.recommendation?.recommendation ?? "",
    fertilizerAdvice: query.recommendation?.fertilizerAdvice ?? "",
    pesticideAdvice: query.recommendation?.pesticideAdvice ?? "",
    additionalNotes: query.recommendation?.additionalNotes ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  const markInReview = async () => {
    try {
      const updated = await updateOfficerQueryStatus(query.id, "IN_REVIEW");
      onChanged(updated);
      toast.success(`Query #${query.id} marked as In Review`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const submit = async () => {
    if (f.diagnosis.trim().length < 5) {
      toast.error("Enter a diagnosis");
      return;
    }
    if (f.recommendation.trim().length < 10) {
      toast.error("Describe the treatment plan");
      return;
    }
    setSubmitting(true);
    try {
      const result = await respondToOfficerQuery(query.id, {
        diagnosis: f.diagnosis.trim(),
        recommendation: f.recommendation.trim(),
        fertilizerAdvice: f.fertilizerAdvice.trim(),
        pesticideAdvice: f.pesticideAdvice.trim(),
        additionalNotes: f.additionalNotes.trim(),
      });
      onChanged(result.query);
      toast.success("Recommendation sent to farmer");
      onBack();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit recommendation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="mb-3 gap-1.5" onClick={onBack}>
        <ArrowLeft className="size-4" /> {t("Back to queries")}
      </Button>
      <PageHeader
        title={t(query.title)}
        subtitle={`#${query.id} • ${query.farmer?.name ?? "Farmer"} • ${query.cropName} • ${query.category}`}
        breadcrumb={["Queries", `#${query.id}`]}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={query.status} />
        <Badge variant="outline">{query.priority}</Badge>
        {query.status === "PENDING" && (
          <Button size="sm" variant="outline" onClick={() => void markInReview()}>
            {t("Mark In Review")}
          </Button>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <SectionCard title={t("Farmer Submission")}>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">{t("Farmer")}</dt>
                <dd className="font-medium">{query.farmer?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Crop")}</dt>
                <dd className="font-medium">{query.cropName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Category")}</dt>
                <dd className="font-medium">{query.category}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Submitted")}</dt>
                <dd className="font-medium">{formatQueryDate(query.createdAt)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm">{t(query.description)}</p>
            {query.recommendation && (
              <p className="mt-3 rounded-xl bg-warning/10 p-3 text-xs text-muted-foreground">
                {t("This query already has a recommendation. Submitting again is blocked by the server.")}
              </p>
            )}
          </SectionCard>
          <SectionCard title={t("Similar Past Cases")}>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                {t(
                  "\u2022 Soybean yellow mosaic \u2014 Malshiras, resolved in 4 days with Imidacloprid spray.",
                )}
              </li>
              <li>
                {t(
                  "\u2022 Iron chlorosis in soybean \u2014 Sangola, corrected with Ferrous Sulphate foliar spray.",
                )}
              </li>
              <li>
                {t(
                  "\u2022 Sulphur deficiency \u2014 Pandharpur, resolved with Bentonite Sulphur 10 kg/acre.",
                )}
              </li>
            </ul>
          </SectionCard>
        </div>

        <SectionCard
          title={t("Expert Recommendation")}
          desc={t("Saved to PostgreSQL and shown to the farmer immediately on refresh.")}
        >
          <div className="grid gap-3">
            <div>
              <Label>{t("Diagnosis")}</Label>
              <Input
                className="mt-1.5"
                maxLength={5000}
                value={f.diagnosis}
                onChange={(e) => setF({ ...f, diagnosis: e.target.value })}
                placeholder={t("e.g. Possible nitrogen deficiency")}
              />
            </div>
            <div>
              <Label>{t("Treatment Plan")}</Label>
              <Textarea
                className="mt-1.5"
                rows={4}
                maxLength={5000}
                value={f.recommendation}
                onChange={(e) => setF({ ...f, recommendation: e.target.value })}
                placeholder={t("Step-by-step action for the farmer")}
              />
            </div>
            <div>
              <Label>{t("Fertilizer Advice (optional)")}</Label>
              <Textarea
                className="mt-1.5"
                rows={2}
                maxLength={5000}
                value={f.fertilizerAdvice}
                onChange={(e) => setF({ ...f, fertilizerAdvice: e.target.value })}
                placeholder={t("Fertilizer guidance")}
              />
            </div>
            <div>
              <Label>{t("Pesticide Advice (optional)")}</Label>
              <Textarea
                className="mt-1.5"
                rows={2}
                maxLength={5000}
                value={f.pesticideAdvice}
                onChange={(e) => setF({ ...f, pesticideAdvice: e.target.value })}
                placeholder={t("Pesticide guidance")}
              />
            </div>
            <div>
              <Label>{t("Additional Notes (optional)")}</Label>
              <Textarea
                className="mt-1.5"
                rows={2}
                maxLength={5000}
                value={f.additionalNotes}
                onChange={(e) => setF({ ...f, additionalNotes: e.target.value })}
                placeholder={t("Irrigation, follow-up, safety notes")}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="gap-2" onClick={() => void submit()} disabled={submitting}>
                <Send className="size-4" /> {submitting ? t("Sending...") : t("Send Recommendation")}
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

export function OfficerReportsPage() {
  return (
    <>
      <PageHeader
        title={t("Reports & Insights")}
        subtitle={t("Performance, crop trends and district-level query analysis.")}
        breadcrumb={["Krushi Adhikari", "Reports"]}
        action={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast.success("Report exported as PDF (demo)")}
          >
            <Download className="size-4" /> {t("Export")}
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label={t("Total Queries Handled")}
          value="528"
          hint={t("Since March 2026")}
        />
        <StatCard
          icon={CheckCircle2}
          label={t("Resolution Rate")}
          value="87.5%"
          hint={t("+4.2% this quarter")}
          tone="forest"
        />
        <StatCard
          icon={Clock}
          label={t("Avg Response")}
          value="18 min"
          hint={t("Fastest in Solapur")}
          tone="harvest"
        />
        <StatCard
          icon={Star}
          label={t("Farmer Rating")}
          value="4.8 / 5"
          hint={t("Based on 412 ratings")}
          tone="harvest"
        />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title={t("Queries by Category")}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={CHART_DATA.queriesByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#2E7D32" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title={t("Average Response Time (minutes)")}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={CHART_DATA.responseTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="minutes" stroke="#F9A825" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title={t("District-wise Query Volume")} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={CHART_DATA.districtWise} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="name" type="category" fontSize={12} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#66BB6A" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </>
  );
}

const DISEASES = [
  {
    name: "Yellow Mosaic Virus",
    crop: "Soybean",
    symptom: "Yellow patches on leaves, stunted pods",
    cause: "Whitefly transmitted virus",
    control: "Imidacloprid 17.8% SL @ 0.3 ml/l, remove infected plants",
    severity: "High",
  },
  {
    name: "Pink Bollworm",
    crop: "Cotton",
    symptom: "Rosette flowers, damaged bolls",
    cause: "Pectinophora gossypiella larvae",
    control: "Pheromone traps + Emamectin Benzoate 5% SG",
    severity: "High",
  },
  {
    name: "Purple Blotch",
    crop: "Onion",
    symptom: "Purple lesions with concentric rings",
    cause: "Alternaria porri fungus",
    control: "Mancozeb 75% WP @ 2.5 g/l at 10-day interval",
    severity: "Medium",
  },
  {
    name: "Fruit Borer",
    crop: "Tomato",
    symptom: "Holes in fruits, larvae inside",
    cause: "Helicoverpa armigera",
    control: "Neem oil 5 ml/l or Spinosad 45% SC",
    severity: "Medium",
  },
  {
    name: "Red Rot",
    crop: "Sugarcane",
    symptom: "Reddish internal tissue, drying leaves",
    cause: "Colletotrichum falcatum",
    control: "Use resistant varieties, hot water seed treatment",
    severity: "High",
  },
  {
    name: "Rust",
    crop: "Wheat",
    symptom: "Orange-brown pustules on leaves",
    cause: "Puccinia species",
    control: "Propiconazole 25% EC @ 1 ml/l",
    severity: "Medium",
  },
];

export function DiseasesPage() {
  const [q, setQ] = useState("");
  const list = DISEASES.filter((d) =>
    (d.name + d.crop + d.symptom).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title={t("Disease & Pest Library")}
        subtitle={t("Reference guide used while preparing farmer recommendations.")}
        breadcrumb={["Krushi Adhikari", "Diseases"]}
      />
      <Card className="mb-4 gap-0 p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Search disease, crop or symptom")}
            className="pl-9"
          />
        </div>
      </Card>
      {list.length === 0 ? (
        <EmptyState
          icon={Bug}
          title={t("No matching disease")}
          desc={t("Try another crop or symptom keyword.")}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((d) => (
            <Card key={d.name} className="hover-lift gap-0 p-5">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{d.crop}</Badge>
                <Badge
                  variant="outline"
                  className={`rounded-full ${d.severity === "High" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-warning/30 bg-warning/15 text-warning"}`}
                >
                  {d.severity} severity
                </Badge>
              </div>
              <h3 className="mt-3 font-semibold">{d.name}</h3>
              <p className="mt-2 text-sm">
                <b>{t("Symptoms:")}</b> {d.symptom}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                <b>{t("Cause:")}</b> {d.cause}
              </p>
              <p className="mt-2 rounded-xl bg-pale/60 p-3 text-sm">
                <b>{t("Control:")}</b> {d.control}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export function OfficerCropsPage() {
  const [open, setOpen] = useState<string | null>(null);
  const CROP_INFO = [
    {
      name: "Soybean",
      season: "Kharif",
      duration: "95-105 days",
      varieties: "JS-335, MAUS-71",
      spacing: "45 x 5 cm",
      yield: "12-14 quintal/acre",
      image: cropImages.Soybean,
    },
    {
      name: "Cotton",
      season: "Kharif",
      duration: "160-180 days",
      varieties: "BT Cotton, Ajeet-155",
      spacing: "90 x 60 cm",
      yield: "8-10 quintal/acre",
      image: cropImages.Cotton,
    },
    {
      name: "Onion",
      season: "Rabi",
      duration: "120-130 days",
      varieties: "Nashik Red, N-53",
      spacing: "15 x 10 cm",
      yield: "100-120 quintal/acre",
      image: cropImages.Onion,
    },
  ];
  return (
    <>
      <PageHeader
        title={t("Crop Reference")}
        subtitle={t("Agronomy details for major crops of Western Maharashtra.")}
        breadcrumb={["Krushi Adhikari", "Crops"]}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CROP_INFO.map((c) => (
          <Card key={c.name} className="hover-lift gap-0 overflow-hidden p-0">
            <img
              src={c.image}
              alt={c.name}
              loading="lazy"
              width={800}
              height={600}
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold">{c.name}</h3>
              <p className="text-xs text-muted-foreground">
                {c.season} • {c.duration}
              </p>
              <p className="mt-2 text-sm">Varieties: {c.varieties}</p>
              <p className="text-sm">Expected yield: {c.yield}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => setOpen(c.name)}
              >
                {t("Package of Practices")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{open} — Package of Practices</DialogTitle>
          </DialogHeader>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>{t("Deep ploughing followed by two harrowings before sowing.")}</li>
            <li>{t("Seed treatment with Rhizobium and Trichoderma before sowing.")}</li>
            <li>{t("Basal dose of 20:40:20 NPK per acre at sowing.")}</li>
            <li>{t("First irrigation at 20-25 days, then at critical growth stages.")}</li>
            <li>{t("Weed management at 20 and 40 days after sowing.")}</li>
            <li>{t("Scout weekly for pest and disease incidence.")}</li>
          </ol>
        </DialogContent>
      </Dialog>
      <SectionCard title={t("District Cropping Pattern")} className="mt-4">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={CHART_DATA.queriesByCrop}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="value" fill="#26A69A" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </>
  );
}

export function OfficerFarmersPage() {
  return (
    <>
      <PageHeader
        title={t("Farmers in My District")}
        subtitle={t("Farmers you are supporting across Solapur talukas.")}
        breadcrumb={["Krushi Adhikari", "Farmers"]}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label={t("Registered Farmers")} value="3,120" tone="primary" />
        <StatCard icon={TrendingUp} label={t("Active This Month")} value="1,842" tone="forest" />
        <StatCard icon={ClipboardList} label={t("Queries Raised")} value="528" tone="harvest" />
        <StatCard icon={Star} label={t("Avg Satisfaction")} value="4.8" tone="harvest" />
      </div>
      <FarmerDirectory />
    </>
  );
}

function FarmerDirectory() {
  const [q, setQ] = useState("");
  const [queryCounts, setQueryCounts] = useState<Record<string, number>>({});
  const farmers = PLATFORM_USERS.filter((u) => u.role === "Farmer");
  const list = farmers.filter((f) =>
    `${f.name} ${f.district} ${f.mobile}`.toLowerCase().includes(q.toLowerCase()),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await fetchOfficerQueries({});
        if (cancelled) return;
        const counts: Record<string, number> = {};
        for (const item of all) {
          const name = item.farmer?.name ?? "";
          if (name) counts[name] = (counts[name] ?? 0) + 1;
        }
        setQueryCounts(counts);
      } catch {
        if (!cancelled) setQueryCounts({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <SectionCard title={t("Farmer Directory")} className="mt-4">
      <div className="relative mb-3">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("Search by name, mobile or district")}
          className="pl-9"
        />
      </div>
      {list.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("No farmers found")}
          desc={t("Try a different keyword.")}
        />
      ) : (
        <div className="space-y-2">
          {list.map((f) => (
            <div
              key={f.name}
              className="flex flex-wrap items-center gap-3 rounded-xl border p-3 text-sm"
            >
              <span className="font-medium">{f.name}</span>
              <span className="text-muted-foreground">
                {f.mobile} • {f.district}
              </span>
              <Badge variant="secondary" className="ml-auto">
                {queryCounts[f.name] ?? 0} {t("Queries")}
              </Badge>
              <StatusBadge status={f.status} />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
