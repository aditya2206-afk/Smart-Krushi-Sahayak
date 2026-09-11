import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
  Activity,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  IndianRupee,
  Landmark,
  MapPin,
  Package,
  Receipt,
  Search,
  ShieldCheck,
  Sprout,
  Store,
  Users,
  XCircle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/skl/common";
import { inr, useStore } from "@/lib/skl/store";
import { Link } from "@tanstack/react-router";
import {
  ACTIVITY_LOG,
  ARTICLES,
  CHART_DATA,
  PENDING_BUYERS,
  PENDING_SELLERS,
  certProgress,
  officerVerification,
  PLATFORM_USERS,
  SCHEMES,
  SERVICES,
} from "@/lib/skl/data";
import { t } from "@/lib/skl/i18n";

const COLORS = ["#2E7D32", "#66BB6A", "#F9A825", "#26A69A", "#8D6E63", "#5C6BC0"];

export function AdminDashboard() {
  const {
    queries,
    orders,
    officers,
    approvedBuyers,
    rejectedBuyers,
    approvedSellers,
    rejectedSellers,
  } = useStore();
  const pendingApprovals =
    officers.filter((o) => !o.accountVerified).length +
    PENDING_BUYERS.filter((s) => !approvedBuyers.includes(s.id) && !rejectedBuyers.includes(s.id))
      .length +
    PENDING_SELLERS.filter(
      (s) => !approvedSellers.includes(s.id) && !rejectedSellers.includes(s.id),
    ).length;

  return (
    <>
      <PageHeader
        title={t("Platform Overview")}
        subtitle={t("Smart Krushi Sahayak \u2022 Maharashtra deployment \u2022 Live demo data")}
        breadcrumb={["Admin", "Dashboard"]}
        action={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast.success("Snapshot exported (demo)")}
          >
            <Download className="size-4" /> {t("Export")}
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label={t("Total Users")}
          value="12,486"
          hint={t("+1,436 this month")}
        />
        <StatCard
          icon={Sprout}
          label={t("Farmers")}
          value="11,204"
          hint={t("Across 12 districts")}
          tone="forest"
        />
        <StatCard
          icon={BadgeCheck}
          label={t("Krushi Adhikaris")}
          value="182"
          hint={t("Verified experts")}
          tone="harvest"
        />
        <StatCard
          icon={ShieldCheck}
          label={t("Pending Approvals")}
          value={pendingApprovals}
          hint={t("Officers, sellers & buyers")}
          tone="warning"
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label={t("Total Queries")}
          value={2221 + queries.length}
          hint={t("87% resolved")}
        />
        <StatCard
          icon={Receipt}
          label={t("Marketplace Orders")}
          value={688 + orders.length}
          tone="forest"
        />
        <StatCard icon={IndianRupee} label={t("GMV (Aug)")} value={inr(402000)} tone="harvest" />
        <StatCard icon={Store} label={t("Buyers")} value="1,100" hint={t("642 verified")} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard
          title={t("User Growth")}
          desc={t("Cumulative registered users")}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={CHART_DATA.monthly}>
              <defs>
                <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2E7D32" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#2E7D32" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#2E7D32"
                strokeWidth={2}
                fill="url(#ug)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title={t("Queries by Category")}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={CHART_DATA.queriesByCategory}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={90}
              >
                {CHART_DATA.queriesByCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title={t("District-wise Adoption")}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={CHART_DATA.districtWise}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#26A69A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title={t("Recent System Activity")}>
          <div className="space-y-3 text-sm">
            {ACTIVITY_LOG.slice(0, 6).map((a, i) => (
              <div key={i} className="flex gap-3 rounded-xl bg-pale/50 p-3">
                <Activity className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">{a.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.actor} • {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

export function AdminUsersPage({ filter }: { filter?: string }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState(filter ?? "All");
  const list = PLATFORM_USERS.filter(
    (u) =>
      (role === "All" || u.role === role) &&
      (u.name + u.district + u.mobile).toLowerCase().includes(q.toLowerCase()),
  );
  const title = filter ? `${filter}s` : "User Management";

  return (
    <>
      <PageHeader
        title={title}
        subtitle={t("Search, verify and manage every account on the platform.")}
        breadcrumb={["Admin", title]}
      />
      <Card className="mb-4 gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Search by name, mobile or district")}
            className="pl-9"
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["All", "Farmer", "Seller", "Krushi Adhikari", "Buyer"].map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>
      {list.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("No users found")}
          desc={t("Try a different keyword or role filter.")}
        />
      ) : (
        <SectionCard title={`${list.length} Users`}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Name")}</TableHead>
                  <TableHead>{t("Role")}</TableHead>
                  <TableHead>{t("Mobile")}</TableHead>
                  <TableHead>{t("District")}</TableHead>
                  <TableHead>{t("Joined")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead className="text-right">{t("Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((u) => (
                  <TableRow key={u.name}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell className="text-muted-foreground">{u.mobile}</TableCell>
                    <TableCell>{u.district}</TableCell>
                    <TableCell className="text-muted-foreground">{u.joined}</TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} />
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info(`Viewing ${u.name} (demo)`)}
                      >
                        {t("View")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => toast.success(`${u.name} suspended (demo)`)}
                      >
                        {t("Suspend")}
                      </Button>
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

export function ApprovalsPage() {
  const {
    officers: allOfficers,
    approveBuyer,
    rejectBuyer,
    approvedBuyers,
    rejectedBuyers,
    approveSeller,
    rejectSeller,
    approvedSellers,
    rejectedSellers,
  } = useStore();
  const officers = allOfficers.filter((o) => !o.accountVerified);
  const buyers = PENDING_BUYERS.filter(
    (s) => !approvedBuyers.includes(s.id) && !rejectedBuyers.includes(s.id),
  );
  const sellers = PENDING_SELLERS.filter(
    (s) => !approvedSellers.includes(s.id) && !rejectedSellers.includes(s.id),
  );

  return (
    <>
      <PageHeader
        title={t("Pending Approvals")}
        subtitle={t("Verify Krushi Adhikari and Buyer applications before granting access.")}
        breadcrumb={["Admin", "Approvals"]}
      />
      <Tabs defaultValue="officers">
        <TabsList>
          <TabsTrigger value="officers">Krushi Adhikaris ({officers.length})</TabsTrigger>
          <TabsTrigger value="sellers">Sellers ({sellers.length})</TabsTrigger>
          <TabsTrigger value="buyers">Buyers ({buyers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="officers" className="mt-4">
          {officers.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={t("All officer applications reviewed")}
              desc={t("New applications will appear here for verification.")}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {officers.map((o) => {
                const p = certProgress(o);
                return (
                  <Card key={o.id} className="gap-0 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{o.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {o.designation} • {t(o.district)}
                        </p>
                      </div>
                      <StatusBadge status={officerVerification(o)} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">{t("Officer ID")}</dt>
                        <dd>{o.officerId}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">{t("Submitted Date")}</dt>
                        <dd>{o.joiningDate}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">{t("Documents")}</dt>
                        <dd>
                          {p.uploaded} / {p.requiredTotal} {t("Uploaded")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          {t("Verification Progress")}
                        </dt>
                        <dd>
                          {p.verified} / {p.total} {t("Verified")}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-muted-foreground">{t("Department")}</dt>
                        <dd>{o.department}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-muted-foreground">{t("Specialization")}</dt>
                        <dd>{o.specialization}</dd>
                      </div>
                    </dl>
                    <div className="mt-4">
                      <Link to="/app/$" params={{ _splat: `admin/officers/${o.id}` }}>
                        <Button size="sm" className="w-full gap-1.5">
                          <ShieldCheck className="size-4" /> {t("Review")}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sellers" className="mt-4">
          {sellers.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={t("All seller applications reviewed")}
              desc={t("New seller applications will appear here for verification.")}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sellers.map((seller) => (
                <Card key={seller.id} className="gap-0 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{seller.business}</h3>
                      <p className="text-xs text-muted-foreground">
                        {seller.name} • {seller.district}
                      </p>
                    </div>
                    <StatusBadge status={seller.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">{t("Mobile")}</dt>
                      <dd>{seller.mobile}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">{t("Joined")}</dt>
                      <dd>{seller.joined}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-muted-foreground">{t("Produce Categories")}</dt>
                      <dd>{seller.categories}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        approveSeller(seller.id, seller.business);
                        toast.success(`${seller.business} is now a Verified Seller`);
                      }}
                    >
                      {t("Approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-destructive"
                      onClick={() => {
                        rejectSeller(seller.id);
                        toast.error(t("Application rejected"));
                      }}
                    >
                      {t("Reject")}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="buyers" className="mt-4">
          {buyers.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={t("All buyer applications reviewed")}
              desc={t("New buyer applications will appear here for licence verification.")}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {buyers.map((s) => (
                <Card key={s.id} className="gap-0 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{s.shop}</h3>
                      <p className="text-xs text-muted-foreground">
                        {s.name} • {s.location}
                      </p>
                    </div>
                    <Badge variant="secondary">Applied {s.applied}</Badge>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">{t("Licence")}</dt>
                      <dd>{s.license}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">{t("GST")}</dt>
                      <dd>{s.gst}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-muted-foreground">{t("Categories")}</dt>
                      <dd>{s.categories}</dd>
                    </div>
                  </dl>
                  <button
                    className="mt-3 w-fit text-sm text-primary underline"
                    onClick={() => toast.info(`Opening ${s.docs} (demo)`)}
                  >
                    📄 {s.docs}
                  </button>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => {
                        approveBuyer(s.id, s.shop);
                        toast.success(`${s.shop} is now a Verified Buyer`);
                      }}
                    >
                      <CheckCircle2 className="size-4" /> {t("Approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-destructive"
                      onClick={() => {
                        rejectBuyer(s.id);
                        toast.error("Application rejected");
                      }}
                    >
                      <XCircle className="size-4" /> {t("Reject")}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

export function AdminQueriesPage() {
  const { queries } = useStore();
  return (
    <>
      <PageHeader
        title={t("All Queries")}
        subtitle={t("Monitor consultation volume and expert response quality.")}
        breadcrumb={["Admin", "Queries"]}
      />
      <SectionCard title={`${queries.length} Queries`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("ID")}</TableHead>
                <TableHead>{t("Farmer")}</TableHead>
                <TableHead>{t("Crop")}</TableHead>
                <TableHead>{t("District")}</TableHead>
                <TableHead>{t("Officer")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queries.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.id}</TableCell>
                  <TableCell>{q.farmer}</TableCell>
                  <TableCell>{q.crop}</TableCell>
                  <TableCell className="text-muted-foreground">{q.district}</TableCell>
                  <TableCell>{q.officer ?? "Unassigned"}</TableCell>
                  <TableCell>
                    <StatusBadge status={q.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </>
  );
}

export function AdminProductsPage() {
  const { products, updateProduct } = useStore();
  const [detail, setDetail] = useState<(typeof products)[number] | null>(null);
  const [q, setQ] = useState("");
  const list = products.filter((p) =>
    `${p.name} ${p.seller} ${p.category} ${p.market}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title={t("Produce Listings")}
        subtitle={t("Moderate agricultural produce listings and verify seller authenticity.")}
        breadcrumb={["Admin", "Produce Listings"]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Package} label={t("Produce Listings")} value={products.length} />
        <StatCard
          icon={BadgeCheck}
          label={t("Verified Listings")}
          value={products.filter((p) => p.verified).length}
          tone="forest"
        />
        <StatCard
          icon={Store}
          label={t("Active Sellers")}
          value={new Set(products.map((p) => p.seller)).size}
          tone="harvest"
        />
      </div>
      <Card className="mt-4 gap-0 p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Search produce, seller or market")}
            className="pl-9"
          />
        </div>
      </Card>
      {list.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Package}
            title={t("No produce listings found.")}
            desc={t("Try a different keyword.")}
          />
        </div>
      ) : (
        <SectionCard title={t("All Listings")} className="mt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Product")}</TableHead>
                  <TableHead>{t("Seller")}</TableHead>
                  <TableHead>{t("Category")}</TableHead>
                  <TableHead>{t("Selling Price")}</TableHead>
                  <TableHead>{t("Market Price")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead className="text-right">{t("Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{t(p.name)}</TableCell>
                    <TableCell className="text-muted-foreground">{p.seller}</TableCell>
                    <TableCell>{t(p.category)}</TableCell>
                    <TableCell className="font-semibold text-forest">
                      {inr(p.price)}/{t(p.unit)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {inr(p.marketPrice)}/{t(p.unit)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={!p.active ? "Suspended" : p.verified ? "Verified" : "Pending"}
                      />
                    </TableCell>
                    <TableCell className="space-x-2 text-right whitespace-nowrap">
                      <Button size="sm" variant="outline" onClick={() => setDetail(p)}>
                        {t("View")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateProduct(p.id, { verified: true, active: true });
                          toast.success(`${t(p.name)} — ${t("listing approved")}`);
                        }}
                      >
                        {t("Approve")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => {
                          updateProduct(p.id, { verified: false, active: false });
                          toast.error(`${t(p.name)} — ${t("listing rejected")}`);
                        }}
                      >
                        {t("Reject")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateProduct(p.id, { active: !p.active });
                          toast.success(p.active ? t("Listing suspended") : t("Listing restored"));
                        }}
                      >
                        {p.active ? t("Suspend") : t("Restore")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail && t(detail.name)}</DialogTitle>
          </DialogHeader>
          {detail && (
            <>
              <img
                src={detail.image}
                alt={t(detail.name)}
                className="h-40 w-full rounded-xl object-cover"
              />
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Seller")}</dt>
                  <dd className="font-medium">{detail.seller}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Category")}</dt>
                  <dd className="font-medium">{t(detail.category)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Grade")}</dt>
                  <dd className="font-medium">{detail.grade}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Available Qty")}</dt>
                  <dd className="font-medium">
                    {detail.stock} {t(detail.unit)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Selling Price")}</dt>
                  <dd className="font-medium">
                    {inr(detail.price)}/{t(detail.unit)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Market Price")}</dt>
                  <dd className="font-medium">
                    {inr(detail.marketPrice)}/{t(detail.unit)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Market / Mandi")}</dt>
                  <dd className="font-medium">{t(detail.market)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("Location")}</dt>
                  <dd className="font-medium">{t(detail.location)}</dd>
                </div>
              </dl>
              <p className="text-sm text-muted-foreground">{t(detail.description)}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AdminOrdersPage() {
  const { orders } = useStore();
  const revenue = useMemo(() => orders.reduce((a, o) => a + o.total, 0), [orders]);
  return (
    <>
      <PageHeader
        title={t("Produce Orders")}
        subtitle={t("Produce order flow between sellers and buyers.")}
        breadcrumb={["Admin", "Orders"]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Receipt} label={t("Orders")} value={orders.length} />
        <StatCard icon={IndianRupee} label={t("Order Value")} value={inr(revenue)} tone="forest" />
        <StatCard
          icon={CheckCircle2}
          label={t("Completed")}
          value={orders.filter((o) => o.status === "Completed").length}
          tone="harvest"
        />
      </div>
      <SectionCard title={t("Order Register")} className="mt-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Order")}</TableHead>
                <TableHead>{t("Seller")}</TableHead>
                <TableHead>{t("Buyer Name")}</TableHead>
                <TableHead>{t("Total")}</TableHead>
                <TableHead>{t("Payment")}</TableHead>
                <TableHead>{t("Date")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.seller}</TableCell>
                  <TableCell>{o.buyer}</TableCell>
                  <TableCell className="font-semibold text-forest">{inr(o.total)}</TableCell>
                  <TableCell className="text-muted-foreground">{o.payment}</TableCell>
                  <TableCell className="text-muted-foreground">{o.date}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </>
  );
}

export function AdminSchemesPage() {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", desc: "", benefit: "", deadline: "" });
  return (
    <>
      <PageHeader
        title={t("Government Schemes")}
        subtitle={t("Publish and update scheme information shown to farmers.")}
        breadcrumb={["Admin", "Schemes"]}
        action={<Button onClick={() => setOpen(true)}>{t("Add Scheme")}</Button>}
      />
      <SectionCard title={`${SCHEMES.length} Published Schemes`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Scheme")}</TableHead>
                <TableHead>{t("Government")}</TableHead>
                <TableHead>{t("Benefit")}</TableHead>
                <TableHead>{t("Deadline")}</TableHead>
                <TableHead className="text-right">{t("Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SCHEMES.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.gov}</TableCell>
                  <TableCell>{s.benefit}</TableCell>
                  <TableCell className="text-muted-foreground">{s.deadline}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info("Edit scheme (demo)")}
                    >
                      {t("Edit")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Add Government Scheme")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>{t("Scheme Name")}</Label>
              <Input
                className="mt-1.5"
                maxLength={100}
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("Description")}</Label>
              <Textarea
                className="mt-1.5"
                rows={3}
                maxLength={400}
                value={t(f.desc)}
                onChange={(e) => setF({ ...f, desc: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("Benefit")}</Label>
              <Input
                className="mt-1.5"
                maxLength={100}
                value={f.benefit}
                onChange={(e) => setF({ ...f, benefit: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("Deadline")}</Label>
              <Input
                className="mt-1.5"
                maxLength={40}
                value={f.deadline}
                onChange={(e) => setF({ ...f, deadline: e.target.value })}
              />
            </div>
            <Button
              onClick={() => {
                if (f.name.trim().length < 3) {
                  toast.error("Enter a scheme name");
                  return;
                }
                setOpen(false);
                toast.success("Scheme published to farmers");
                setF({ name: "", desc: "", benefit: "", deadline: "" });
              }}
            >
              {t("Publish Scheme")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AdminServicesPage() {
  return (
    <>
      <PageHeader
        title={t("Agriculture Services")}
        subtitle={t("Directory of Krushi Seva Kendras, labs and offices.")}
        breadcrumb={["Admin", "Services"]}
        action={
          <Button onClick={() => toast.success("Service added (demo)")}>{t("Add Service")}</Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={MapPin} label={t("Listed Services")} value={SERVICES.length} />
        <StatCard
          icon={BadgeCheck}
          label={t("Verified")}
          value={SERVICES.length - 1}
          tone="forest"
        />
        <StatCard icon={Landmark} label={t("Districts Covered")} value="12" tone="harvest" />
      </div>
      <SectionCard title={t("Service Directory")} className="mt-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Name")}</TableHead>
                <TableHead>{t("Category")}</TableHead>
                <TableHead>{t("Address")}</TableHead>
                <TableHead>{t("Phone")}</TableHead>
                <TableHead className="text-right">{t("Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SERVICES.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.category}</TableCell>
                  <TableCell className="text-muted-foreground">{s.address}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info("Edit service (demo)")}
                    >
                      {t("Edit")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </>
  );
}

export function AdminContentPage() {
  return (
    <>
      <PageHeader
        title={t("Content Management")}
        subtitle={t("Knowledge library articles, advisories and videos.")}
        breadcrumb={["Admin", "Content"]}
        action={
          <Button onClick={() => toast.success("New article draft created")}>
            {t("New Article")}
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ARTICLES.map((a) => (
          <Card key={a.id} className="hover-lift gap-0 p-5">
            <Badge variant="secondary">{a.category}</Badge>
            <h3 className="mt-2 font-semibold">{t(a.title)}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
            <p className="mt-2 text-xs text-muted-foreground">{a.read}</p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => toast.info("Editing article (demo)")}
              >
                {t("Edit")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-destructive"
                onClick={() => toast.success("Article unpublished")}
              >
                {t("Unpublish")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export function AdminReportsPage() {
  return (
    <>
      <PageHeader
        title={t("Reports & Analytics")}
        subtitle={t("Platform health, engagement and satisfaction metrics.")}
        breadcrumb={["Admin", "Reports"]}
        action={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast.success("Full report exported (demo)")}
          >
            <Download className="size-4" /> {t("Export PDF")}
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title={t("Queries vs Resolutions")}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={CHART_DATA.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="queries" fill="#2E7D32" radius={[8, 8, 0, 0]} name={t("Queries")} />
              <Bar dataKey="resolved" fill="#F9A825" radius={[8, 8, 0, 0]} name={t("Resolved")} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title={t("Farmer Satisfaction Score")}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={CHART_DATA.satisfaction}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis domain={[3.5, 5]} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#26A69A" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title={t("Top Selling Products")} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={CHART_DATA.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="name" type="category" width={150} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#66BB6A" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </>
  );
}

export function AdminActivityPage() {
  return (
    <>
      <PageHeader
        title={t("System Activity")}
        subtitle={t("Audit trail of key platform actions.")}
        breadcrumb={["Admin", "Activity"]}
      />
      <SectionCard title={t("Activity Log")}>
        <ol className="relative space-y-4 border-l pl-6">
          {ACTIVITY_LOG.map((a, i) => (
            <li key={i}>
              <span className="absolute -left-[7px] mt-1.5 size-3 rounded-full bg-primary" />
              <p className="text-sm font-medium">{a.action}</p>
              <p className="text-xs text-muted-foreground">
                {a.actor} • {a.time}
              </p>
            </li>
          ))}
        </ol>
      </SectionCard>
      <SectionCard title={t("Platform Documents")} className="mt-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {["Data Privacy Policy", "Buyer Onboarding SOP", "Expert Verification Guidelines"].map(
            (d) => (
              <button
                key={d}
                className="flex items-center gap-3 rounded-xl border p-4 text-left text-sm hover:bg-muted/60"
                onClick={() => toast.info("Opening document (demo)")}
              >
                <FileText className="size-4 text-primary" /> {d}
              </button>
            ),
          )}
        </div>
      </SectionCard>
    </>
  );
}
