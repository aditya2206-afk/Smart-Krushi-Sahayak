import { useMemo, useState } from "react";
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
import { useStore } from "@/lib/skl/store";
import { VoiceAdvisoryRecorder, type VoiceAdvisory } from "@/components/skl/VoiceAdvisory";
import {
  CHART_DATA,
  CROPS,
  DISTRICTS,
  PESTICIDES,
  PLATFORM_USERS,
  cropImages,
  type Query,
} from "@/lib/skl/data";
import { t } from "@/lib/skl/i18n";

const OFFICER = "Dr. S. K. Deshmukh";
const CHART_COLORS = ["#2E7D32", "#66BB6A", "#F9A825", "#26A69A", "#8D6E63", "#5C6BC0"];

export function OfficerDashboard() {
  const { queries } = useStore();
  const pending = queries.filter((q) => q.status === "Pending").length;
  const resolved = queries.filter((q) => q.status === "Resolved").length;

  return (
    <>
      <PageHeader
        title={t("Welcome, Dr. Deshmukh")}
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
            value={pending}
            hint={t("Awaiting first response")}
            tone="warning"
          />
        </Link>
        <Link to="/app/$" params={{ _splat: "officer/assigned" }}>
          <StatCard
            icon={ListChecks}
            label={t("Assigned to Me")}
            value={queries.filter((q) => q.officer === OFFICER).length}
            hint={t("Active consultations")}
          />
        </Link>
        <Link to="/app/$" params={{ _splat: "officer/reports" }}>
          <StatCard
            icon={CheckCircle2}
            label={t("Resolved This Month")}
            value={46 + resolved}
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
            {queries.slice(0, 4).map((q) => (
              <Link
                key={q.id}
                to="/app/$"
                params={{ _splat: "officer/queries" }}
                className="flex flex-wrap items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/60"
              >
                <img
                  src={q.images[0] ?? cropImages.leaf}
                  alt={q.crop}
                  loading="lazy"
                  width={64}
                  height={64}
                  className="size-12 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t(q.title)}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.farmer} • {q.crop} • {q.createdAt}
                  </p>
                </div>
                <StatusBadge status={q.status} />
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
  const { queries, assignOfficer } = useStore();
  const [q, setQ] = useState("");
  const [crop, setCrop] = useState("All");
  const [status, setStatus] = useState(initialStatus);
  const [district, setDistrict] = useState("All");
  const [open, setOpen] = useState<Query | null>(null);

  const list = useMemo(
    () =>
      queries.filter(
        (x) =>
          (!mine || x.officer === OFFICER) &&
          (crop === "All" || x.crop === crop) &&
          (status === "All" || x.status === status) &&
          (district === "All" || x.district === district) &&
          (x.title + x.farmer + x.id).toLowerCase().includes(q.toLowerCase()),
      ),
    [queries, mine, crop, status, district, q],
  );

  if (open) return <AnswerQuery query={open} onBack={() => setOpen(null)} />;

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
          <Select value={crop} onValueChange={setCrop}>
            <SelectTrigger>
              <SelectValue placeholder={t("Crop")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t("All Crops")}</SelectItem>
              {CROPS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                "Follow-up Required",
                "Resolved",
              ].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger>
              <SelectValue placeholder={t("District")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t("All Districts")}</SelectItem>
              {DISTRICTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {list.length === 0 ? (
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
                <img
                  src={x.images[0] ?? cropImages.leaf}
                  alt={x.crop}
                  loading="lazy"
                  width={96}
                  height={96}
                  className="size-20 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{x.id}</Badge>
                    <StatusBadge status={x.status} />
                    {x.officer && (
                      <Badge variant="outline" className="rounded-full">
                        {x.officer}
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-2 font-semibold">{t(x.title)}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{t(x.description)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {x.farmer} • {x.farmerVillage}, {x.district} • {x.crop} ({x.stage}) •{" "}
                    {x.createdAt}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {!x.officer && (
                    <Button
                      size="sm"
                      onClick={() => {
                        assignOfficer(x.id, OFFICER);
                        toast.success(t("Query assigned to you"));
                      }}
                    >
                      {t("Accept Query")}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setOpen(x)}>
                    {t("View")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOpen(x)}>
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

function AnswerQuery({ query, onBack }: { query: Query; onBack: () => void }) {
  const { answerQuery } = useStore();
  const [voice, setVoice] = useState<VoiceAdvisory | null>(null);
  const [f, setF] = useState({
    diagnosis: "",
    treatment: "",
    fertilizer: "",
    fertilizerDose: "",
    pesticide: PESTICIDES[0]?.name ?? "",
    pesticideDose: "",
    precautions: "Wear gloves and mask while spraying. Do not spray before rain.",
    followUp: "Share photos after 5 days.",
  });

  const submit = () => {
    if (f.diagnosis.trim().length < 5) {
      toast.error("Enter a diagnosis");
      return;
    }
    if (f.treatment.trim().length < 10) {
      toast.error("Describe the treatment plan");
      return;
    }
    answerQuery(query.id, {
      ...f,
      officer: OFFICER,
      date: "21 Aug 2026",
      ...(voice ? { voiceAdvisory: voice } : {}),
    });
    toast.success("Recommendation sent to farmer");
    onBack();
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="mb-3 gap-1.5" onClick={onBack}>
        <ArrowLeft className="size-4" /> {t("Back to queries")}
      </Button>
      <PageHeader
        title={t(query.title)}
        subtitle={`${query.farmer} • ${query.farmerVillage}, ${query.district} • ${query.crop}`}
        breadcrumb={["Queries", query.id]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <SectionCard title={t("Farmer Submission")}>
            <p className="text-sm">{t(query.description)}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {query.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Crop photo ${i + 1}`}
                  loading="lazy"
                  width={200}
                  height={150}
                  className="h-24 w-full rounded-lg object-cover"
                />
              ))}
            </div>
            {query.voiceNote && (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-pale/60 p-3 text-sm">
                🎙️ Voice note ({query.voiceNote}) —{" "}
                <button
                  className="text-primary underline"
                  onClick={() => toast.info("Playing voice note (demo)")}
                >
                  {t("Play")}
                </button>
              </div>
            )}
            {query.extra && (
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Irrigation")}</dt>
                  <dd>{query.extra.irrigation}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Soil")}</dt>
                  <dd>{query.extra.soil}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Last Fertilizer")}</dt>
                  <dd>{query.extra.lastFertilizer}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Last Pesticide")}</dt>
                  <dd>{query.extra.lastPesticide}</dd>
                </div>
              </dl>
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
          desc={t("This is sent instantly to the farmer's app and SMS.")}
        >
          <div className="grid gap-3">
            <div>
              <Label>{t("Diagnosis")}</Label>
              <Input
                className="mt-1.5"
                maxLength={120}
                value={f.diagnosis}
                onChange={(e) => setF({ ...f, diagnosis: e.target.value })}
                placeholder={t("e.g. Yellow Mosaic Virus with sulphur deficiency")}
              />
            </div>
            <div>
              <Label>{t("Treatment Plan")}</Label>
              <Textarea
                className="mt-1.5"
                rows={4}
                maxLength={800}
                value={f.treatment}
                onChange={(e) => setF({ ...f, treatment: e.target.value })}
                placeholder={t("Step-by-step action for the farmer")}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>{t("Fertilizer")}</Label>
                <Input
                  className="mt-1.5"
                  maxLength={80}
                  value={f.fertilizer}
                  onChange={(e) => setF({ ...f, fertilizer: e.target.value })}
                  placeholder={t("Bentonite Sulphur")}
                />
              </div>
              <div>
                <Label>{t("Dose")}</Label>
                <Input
                  className="mt-1.5"
                  maxLength={60}
                  value={f.fertilizerDose}
                  onChange={(e) => setF({ ...f, fertilizerDose: e.target.value })}
                  placeholder={t("10 kg/acre")}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>{t("Pesticide")}</Label>
                <Select value={f.pesticide} onValueChange={(v) => setF({ ...f, pesticide: v })}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PESTICIDES.map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("Dose")}</Label>
                <Input
                  className="mt-1.5"
                  maxLength={60}
                  value={f.pesticideDose}
                  onChange={(e) => setF({ ...f, pesticideDose: e.target.value })}
                  placeholder={t("0.3 ml/litre")}
                />
              </div>
            </div>
            <div>
              <Label>{t("Precautions")}</Label>
              <Textarea
                className="mt-1.5"
                rows={2}
                maxLength={400}
                value={f.precautions}
                onChange={(e) => setF({ ...f, precautions: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("Follow-up Instruction")}</Label>
              <Input
                className="mt-1.5"
                maxLength={160}
                value={f.followUp}
                onChange={(e) => setF({ ...f, followUp: e.target.value })}
              />
            </div>
            <VoiceAdvisoryRecorder value={voice} onChange={setVoice} />
            <div className="flex flex-wrap gap-2">
              <Button className="gap-2" onClick={submit}>
                <Send className="size-4" /> {t("Send Recommendation")}
              </Button>
              <Button variant="outline" onClick={() => toast.success("Saved as draft")}>
                {t("Save Draft")}
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info("Field visit scheduled for 24 Aug 2026")}
              >
                {t("Schedule Field Visit")}
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
  const { queries } = useStore();
  const [q, setQ] = useState("");
  const farmers = PLATFORM_USERS.filter((u) => u.role === "Farmer");
  const list = farmers.filter((f) =>
    `${f.name} ${f.district} ${f.mobile}`.toLowerCase().includes(q.toLowerCase()),
  );
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
                {queries.filter((x) => x.farmer === f.name).length} {t("Queries")}
              </Badge>
              <StatusBadge status={f.status} />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
