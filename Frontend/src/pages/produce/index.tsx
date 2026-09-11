import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
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
  AlertTriangle,
  Boxes,
  Carrot,
  Download,
  IndianRupee,
  Leaf,
  MessageSquare,
  Package,
  Phone,
  Plus,
  Receipt,
  Search,
  Star,
  Store,
  TrendingUp,
  Users,
  Wheat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  TrendBadge,
  trendOf,
} from "@/components/skl/common";
import { inr, useStore } from "@/lib/skl/store";
import {
  BUYERS,
  CHART_DATA,
  MARKETS,
  MARKET_PRICE_BOARD,
  PRICE_HISTORY,
  PRODUCE_CATEGORIES,
  PRODUCE_GRADES,
  PRODUCE_UNITS,
  cropImages,
  type Order,
  type OrderStatus,
  type Product,
  type ProduceCategory,
} from "@/lib/skl/data";
import { t } from "@/lib/skl/i18n";

const SELLER = "Shree Krushi Produce";
const COLORS = ["#2E7D32", "#66BB6A", "#F9A825", "#26A69A", "#8D6E63"];
const ORDER_STATUSES: OrderStatus[] = [
  "New",
  "Confirmed",
  "Packed",
  "Ready for Pickup",
  "Out for Delivery",
  "Completed",
  "Cancelled",
];

/** "₹30/kg" style price label used everywhere produce prices are shown. */
export function unitPrice(price: number, unit: string) {
  return `${inr(price)}/${t(unit)}`;
}

export function listingStatus(p: Product) {
  if (!p.active) return "Unavailable";
  if (p.stock === 0) return "Sold Out";
  if (p.stock <= (p.unit === "quintal" ? 20 : 200)) return "Low Stock";
  if (p.orders > 150) return "Fast Moving";
  return "Available";
}

function useAppSearch() {
  return useSearch({ from: "/app/$" }) as { filter?: string; use?: string };
}

function bySeller<T extends { seller: string }>(items: T[]) {
  return items.filter((i) => i.seller === SELLER);
}

/* ------------------------------------------------------------------ dashboard */

export function ProduceDashboard() {
  const { products, orders } = useStore();
  const mine = bySeller(products);
  const sellerOrders = bySeller(orders);
  const todayOrders = sellerOrders.filter(
    (o) => o.date === "21 Aug 2026" || o.status === "New" || o.status === "Confirmed",
  );
  const revenue = todayOrders.reduce((a, o) => a + o.total, 0);
  const totalStock = mine.filter((p) => p.unit === "kg").reduce((a, p) => a + p.stock, 0);
  const lowStock = mine.filter((p) => listingStatus(p) === "Low Stock").length;
  const avgMarket = Math.round(
    MARKET_PRICE_BOARD.filter((m) => m.unit === "quintal").reduce((a, m) => a + m.avg, 0) /
      MARKET_PRICE_BOARD.filter((m) => m.unit === "quintal").length,
  );

  return (
    <>
      <PageHeader
        title={t("Seller Dashboard")}
        subtitle={t("Manage your agricultural produce, buyers, market prices and orders.")}
        breadcrumb={[t("Seller"), t("Dashboard")]}
        action={<Badge className="rounded-full">{t("🟢 Accepting Orders")}</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link to="/app/$" params={{ _splat: "seller/inventory" }} search={{ filter: "active" }}>
          <StatCard
            icon={Package}
            label={t("Active Listings")}
            value={mine.filter((p) => p.active).length}
            hint={t("Open Inventory")}
          />
        </Link>
        <Link to="/app/$" params={{ _splat: "seller/orders" }} search={{ filter: "today" }}>
          <StatCard
            icon={Receipt}
            label={t("Today's Orders")}
            value={todayOrders.length}
            hint={t("View today's orders")}
            tone="harvest"
          />
        </Link>
        <Link to="/app/$" params={{ _splat: "seller/inventory" }}>
          <StatCard
            icon={Boxes}
            label={t("Total Stock")}
            value={`${totalStock.toLocaleString("en-IN")} ${t("kg")}`}
            hint={t("Vegetables and fruits")}
            tone="forest"
          />
        </Link>
        <Link to="/app/$" params={{ _splat: "seller/analytics" }}>
          <StatCard
            icon={IndianRupee}
            label={t("Today's Revenue")}
            value={inr(revenue)}
            hint={t("From confirmed orders")}
            tone="forest"
          />
        </Link>
        <Link to="/app/$" params={{ _splat: "seller/inventory" }} search={{ filter: "low" }}>
          <StatCard
            icon={AlertTriangle}
            label={t("Low Stock Products")}
            value={lowStock}
            hint={t("Restock soon")}
            tone="destructive"
          />
        </Link>
        <Link to="/app/$" params={{ _splat: "seller/market-prices" }}>
          <StatCard
            icon={TrendingUp}
            label={t("Average Market Price")}
            value={`${inr(avgMarket)} / ${t("quintal")}`}
            hint={t("Across tracked markets")}
            tone="harvest"
          />
        </Link>
      </div>

      <SectionCard title={t("Quick Actions")} className="mt-4">
        <div className="flex flex-wrap gap-2">
          <Link to="/app/$" params={{ _splat: "seller/add-product" }}>
            <Button className="gap-2">
              <Plus className="size-4" /> {t("Add New Listing")}
            </Button>
          </Link>
          <Link to="/app/$" params={{ _splat: "seller/orders" }}>
            <Button variant="outline" className="gap-2">
              <Receipt className="size-4" /> {t("View Orders")}
            </Button>
          </Link>
          <Link to="/app/$" params={{ _splat: "seller/market-prices" }}>
            <Button variant="outline" className="gap-2">
              <TrendingUp className="size-4" /> {t("Check Market Prices")}
            </Button>
          </Link>
          <Link to="/app/$" params={{ _splat: "seller/inventory" }}>
            <Button variant="outline" className="gap-2">
              <Boxes className="size-4" /> {t("Update Stock")}
            </Button>
          </Link>
        </div>
      </SectionCard>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard
          title={t("Market Price Trends")}
          desc={t("Average mandi price of your top produce")}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={PRICE_HISTORY["Tomato"]!.map((d, i) => ({
                day: d.day,
                Tomato: d.price,
                Onion: PRICE_HISTORY["Onion"]![i]!.price,
                "Green Chilli": PRICE_HISTORY["Green Chilli"]![i]!.price,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Tomato"
                stroke="#2E7D32"
                strokeWidth={2}
                name={t("Tomato")}
              />
              <Line
                type="monotone"
                dataKey="Onion"
                stroke="#F9A825"
                strokeWidth={2}
                name={t("Onion")}
              />
              <Line
                type="monotone"
                dataKey="Green Chilli"
                stroke="#26A69A"
                strokeWidth={2}
                name={t("Green Chilli")}
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title={t("Top Selling Produce")}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={CHART_DATA.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="name" type="category" width={90} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#66BB6A" radius={[0, 8, 8, 0]} name={t("Quantity sold")} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard
        title={t("Recent Orders")}
        className="mt-4"
        action={
          <Link to="/app/$" params={{ _splat: "seller/orders" }}>
            <Button size="sm" variant="outline">
              {t("View all")}
            </Button>
          </Link>
        }
      >
        <OrdersTable limit={4} />
      </SectionCard>
    </>
  );
}

/* ------------------------------------------------------------------ add listing */

export function AddProductPage() {
  const { addProduct } = useStore();
  const navigate = useNavigate();
  const search = useAppSearch();
  const prefill = MARKET_PRICE_BOARD.find((m) => m.product === search.use);
  const empty = {
    name: prefill?.product ?? "",
    category: (prefill?.category ?? "Vegetable") as ProduceCategory,
    variety: "",
    grade: "A",
    stock: "",
    unit: prefill?.unit ?? "kg",
    price: prefill ? String(prefill.avg) : "",
    marketPrice: prefill ? String(prefill.avg) : "",
    market: prefill?.market ?? MARKETS[0]!,
    location: prefill?.district ?? "Solapur",
    harvestDate: "",
    availableUntil: "",
    description: "",
    organic: false,
    minOrder: "",
  };
  const [f, setF] = useState(empty);

  const publish = (asDraft = false) => {
    if (f.name.trim().length < 3) {
      toast.error(t("Enter a produce name"));
      return;
    }
    if (!f.price || Number(f.price) <= 0) {
      toast.error(t("Enter a valid selling price"));
      return;
    }
    if (!f.stock || Number(f.stock) <= 0) {
      toast.error(t("Enter the available quantity"));
      return;
    }
    addProduct({
      id: `P-${Math.floor(Math.random() * 900 + 100)}`,
      name: f.name.trim(),
      category: f.category,
      variety: f.variety.trim() || f.name.trim(),
      grade: f.grade,
      seller: SELLER,
      location: f.location,
      market: f.market,
      price: Number(f.price),
      marketPrice: Number(f.marketPrice) || Number(f.price),
      trend: trendOf(Number(f.price) - (Number(f.marketPrice) || Number(f.price))),
      stock: Number(f.stock),
      unit: f.unit,
      minOrder: Number(f.minOrder) || 1,
      harvestDate: f.harvestDate || "21 Aug 2026",
      availableUntil: f.availableUntil || "30 Sep 2026",
      organic: f.organic,
      rating: 4.5,
      orders: 0,
      verified: true,
      active: !asDraft,
      description:
        f.description.trim() || "Freshly harvested agricultural produce from a verified seller.",
      image: cropImages.product,
    });
    toast.success(asDraft ? t("Saved as draft") : t("Produce listing published successfully."));
    setF(empty);
    navigate({ to: "/app/$", params: { _splat: "seller/inventory" } });
  };

  return (
    <>
      <PageHeader
        title={t("Add Produce Listing")}
        subtitle={t("List your vegetables, fruits or crops for buyers.")}
        breadcrumb={[t("Seller"), t("Add Listing")]}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title={t("Produce Details")} className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("Product Name")}</Label>
              <Input
                className="mt-1.5"
                maxLength={60}
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
                placeholder={t("e.g. Tomato")}
              />
            </div>
            <div>
              <Label>{t("Category")}</Label>
              <Select
                value={f.category}
                onValueChange={(v) => setF({ ...f, category: v as ProduceCategory })}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("Variety")}</Label>
              <Input
                className="mt-1.5"
                maxLength={50}
                value={f.variety}
                onChange={(e) => setF({ ...f, variety: e.target.value })}
                placeholder={t("Hybrid Tomato")}
              />
            </div>
            <div>
              <Label>{t("Grade / Quality")}</Label>
              <Select value={f.grade} onValueChange={(v) => setF({ ...f, grade: v })}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCE_GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("Available Quantity")}</Label>
              <Input
                className="mt-1.5"
                type="number"
                value={f.stock}
                onChange={(e) => setF({ ...f, stock: e.target.value })}
                placeholder="500"
              />
            </div>
            <div>
              <Label>{t("Unit")}</Label>
              <Select value={f.unit} onValueChange={(v) => setF({ ...f, unit: v })}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCE_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {t(u)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("Your Selling Price")} (₹)</Label>
              <Input
                className="mt-1.5"
                type="number"
                value={f.price}
                onChange={(e) => setF({ ...f, price: e.target.value })}
                placeholder="30"
              />
            </div>
            <div>
              <Label>{t("Current Market Price")} (₹)</Label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  type="number"
                  value={f.marketPrice}
                  onChange={(e) => setF({ ...f, marketPrice: e.target.value })}
                  placeholder="28"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const row = MARKET_PRICE_BOARD.find(
                      (m) => m.product.toLowerCase() === f.name.trim().toLowerCase(),
                    );
                    if (!row) {
                      toast.error(t("No market price found for this produce"));
                      return;
                    }
                    setF({
                      ...f,
                      marketPrice: String(row.avg),
                      market: row.market,
                      unit: row.unit,
                    });
                    toast.success(t("Market price applied"));
                  }}
                >
                  {t("Use Market Price")}
                </Button>
              </div>
            </div>
            <div>
              <Label>{t("Market / Mandi")}</Label>
              <Select value={f.market} onValueChange={(v) => setF({ ...f, market: v })}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKETS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {t(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("Location")}</Label>
              <Input
                className="mt-1.5"
                maxLength={40}
                value={f.location}
                onChange={(e) => setF({ ...f, location: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("Harvest Date")}</Label>
              <Input
                className="mt-1.5"
                type="date"
                value={f.harvestDate}
                onChange={(e) => setF({ ...f, harvestDate: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("Available Until")}</Label>
              <Input
                className="mt-1.5"
                type="date"
                value={f.availableUntil}
                onChange={(e) => setF({ ...f, availableUntil: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("Minimum Order Quantity")}</Label>
              <Input
                className="mt-1.5"
                type="number"
                value={f.minOrder}
                onChange={(e) => setF({ ...f, minOrder: e.target.value })}
                placeholder="20"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
                <Switch
                  checked={f.organic}
                  onCheckedChange={(v) => setF({ ...f, organic: v })}
                  id="organic"
                />
                <Label htmlFor="organic">{f.organic ? t("Organic") : t("Conventional")}</Label>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>{t("Description")}</Label>
              <Textarea
                className="mt-1.5"
                rows={4}
                maxLength={500}
                value={f.description}
                onChange={(e) => setF({ ...f, description: e.target.value })}
                placeholder={t("Quality, packing and delivery details")}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="gap-2" onClick={() => publish(false)}>
              <Plus className="size-4" /> {t("Publish Listing")}
            </Button>
            <Button variant="outline" onClick={() => publish(true)}>
              {t("Save Draft")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setF(empty);
                navigate({ to: "/app/$", params: { _splat: "seller/inventory" } });
              }}
            >
              {t("Cancel")}
            </Button>
          </div>
        </SectionCard>
        <SectionCard title={t("Product Image")}>
          <div className="grid h-40 place-items-center rounded-xl border border-dashed bg-pale/40 text-sm text-muted-foreground">
            {t("Drag & drop image here")}
          </div>
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => toast.success(t("Demo image attached"))}
          >
            {t("Upload Image")}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            {t(
              "Listings from verified sellers show a trust badge in the produce marketplace along with the current mandi price.",
            )}
          </p>
        </SectionCard>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ inventory */

const PAGE_SIZE = 10;

export function InventoryPage() {
  const { products, updateProduct, deleteProduct } = useStore();
  const search = useAppSearch();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState(search.filter === "low" ? "Low Stock" : "All");
  const [market, setMarket] = useState("All");
  const [trend, setTrend] = useState("All");
  const [page, setPage] = useState(1);
  const [stockEdit, setStockEdit] = useState<Product | null>(null);
  const [priceEdit, setPriceEdit] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);

  const mine = bySeller(products);
  const filtered = mine.filter(
    (p) =>
      `${p.name} ${p.variety} ${p.category} ${p.market} ${p.location} ${p.grade}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (cat === "All" || p.category === cat) &&
      (status === "All" || listingStatus(p) === status) &&
      (market === "All" || p.market === market) &&
      (trend === "All" || p.trend === trend) &&
      (search.filter !== "active" || p.active),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avgMarket = Math.round(
    mine.reduce((a, p) => a + p.marketPrice, 0) / Math.max(1, mine.length),
  );

  return (
    <>
      <PageHeader
        title={t("Seller Inventory")}
        subtitle={t("Manage vegetables, fruits and crops available for sale.")}
        breadcrumb={[t("Seller"), t("Inventory")]}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => toast.success(t("Inventory exported (demo)"))}
            >
              <Download className="size-4" /> {t("Export CSV")}
            </Button>
            <Link to="/app/$" params={{ _splat: "seller/add-product" }}>
              <Button className="gap-2">
                <Plus className="size-4" /> {t("Add Listing")}
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Package} label={t("Total Listings")} value={mine.length} />
        <StatCard
          icon={Carrot}
          label={t("Vegetables")}
          value={mine.filter((p) => p.category === "Vegetable").length}
          tone="harvest"
        />
        <StatCard
          icon={Wheat}
          label={t("Crops")}
          value={
            mine.filter((p) => p.category === "Grain" || p.category === "Commercial Crop").length
          }
          tone="forest"
        />
        <StatCard
          icon={AlertTriangle}
          label={t("Low Stock")}
          value={mine.filter((p) => listingStatus(p) === "Low Stock").length}
          tone="warning"
        />
        <StatCard
          icon={TrendingUp}
          label={t("Average Market Price")}
          value={inr(avgMarket)}
          tone="forest"
        />
      </div>

      <Card className="mt-4 gap-0 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder={t("Search vegetables, crops, fruits...")}
              className="pl-9"
            />
          </div>
          <Filter
            label={t("Category")}
            value={cat}
            onChange={(v) => {
              setCat(v);
              setPage(1);
            }}
            options={["All", ...PRODUCE_CATEGORIES]}
          />
          <Filter
            label={t("Status")}
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={["All", "Available", "Low Stock", "Fast Moving", "Unavailable", "Sold Out"]}
          />
          <Filter
            label={t("Market")}
            value={market}
            onChange={(v) => {
              setMarket(v);
              setPage(1);
            }}
            options={["All", ...MARKETS]}
          />
          <Filter
            label={t("Price Trend")}
            value={trend}
            onChange={(v) => {
              setTrend(v);
              setPage(1);
            }}
            options={["All", "Up", "Down", "Stable"]}
          />
        </div>
        {(q || cat !== "All" || status !== "All" || market !== "All" || trend !== "All") && (
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {filtered.length} {t("listings match your filters")}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setQ("");
                setCat("All");
                setStatus("All");
                setMarket("All");
                setTrend("All");
                setPage(1);
              }}
            >
              {t("Clear filters")}
            </Button>
          </div>
        )}
      </Card>

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Package}
            title={t("No produce listings found.")}
            desc={t("Adjust your filters or publish your first produce listing.")}
            action={
              <Link to="/app/$" params={{ _splat: "seller/add-product" }}>
                <Button>{t("Add Your First Listing")}</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <SectionCard title={t("Produce Listings")} className="mt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Product")}</TableHead>
                  <TableHead>{t("Category")}</TableHead>
                  <TableHead>{t("Grade")}</TableHead>
                  <TableHead>{t("Available Qty")}</TableHead>
                  <TableHead>{t("Selling Price")}</TableHead>
                  <TableHead>{t("Market Price")}</TableHead>
                  <TableHead>{t("Trend")}</TableHead>
                  <TableHead>{t("Market")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead className="text-right">{t("Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          width={80}
                          height={80}
                          className="size-9 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{t(p.name)}</p>
                          <p className="text-xs text-muted-foreground">{t(p.variety)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t(p.category)}</TableCell>
                    <TableCell>{p.grade}</TableCell>
                    <TableCell>
                      {p.stock.toLocaleString("en-IN")} {t(p.unit)}
                    </TableCell>
                    <TableCell className="font-semibold text-forest">
                      {unitPrice(p.price, p.unit)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {unitPrice(p.marketPrice, p.unit)}
                    </TableCell>
                    <TableCell>
                      <TrendBadge trend={p.trend} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t(p.market)}</TableCell>
                    <TableCell>
                      <StatusBadge status={listingStatus(p)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            {t("Actions")}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetail(p)}>
                            {t("View")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPriceEdit(p)}>
                            {t("Edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStockEdit(p)}>
                            {t("Update Stock")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPriceEdit(p)}>
                            {t("Update Price")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              updateProduct(p.id, { active: !p.active });
                              toast.success(
                                p.active
                                  ? t("Listing marked unavailable")
                                  : t("Listing is available again"),
                              );
                            }}
                          >
                            {p.active ? t("Mark Unavailable") : t("Mark Available")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setConfirmDelete(p)}
                          >
                            {t("Delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {t("Page")} {page} / {pages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                {t("Previous")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
              >
                {t("Next")}
              </Button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* update stock */}
      <Dialog open={!!stockEdit} onOpenChange={() => setStockEdit(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {t("Update Stock")} — {stockEdit && t(stockEdit.name)}
            </DialogTitle>
          </DialogHeader>
          {stockEdit && (
            <>
              <Label>
                {t("Available Quantity")} ({t(stockEdit.unit)})
              </Label>
              <Input
                type="number"
                value={stockEdit.stock}
                onChange={(e) => setStockEdit({ ...stockEdit, stock: Number(e.target.value) })}
              />
              <DialogFooter>
                <Button
                  onClick={() => {
                    updateProduct(stockEdit.id, { stock: stockEdit.stock });
                    setStockEdit(null);
                    toast.success(t("Listing updated successfully."));
                  }}
                >
                  {t("Save Changes")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* edit price */}
      <Dialog open={!!priceEdit} onOpenChange={() => setPriceEdit(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("Edit Listing")} — {priceEdit && t(priceEdit.name)}
            </DialogTitle>
          </DialogHeader>
          {priceEdit && (
            <div className="grid gap-3">
              <div>
                <Label>
                  {t("Your Selling Price")} (₹/{t(priceEdit.unit)})
                </Label>
                <Input
                  className="mt-1.5"
                  type="number"
                  value={priceEdit.price}
                  onChange={(e) => setPriceEdit({ ...priceEdit, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>
                  {t("Current Market Price")} (₹/{t(priceEdit.unit)})
                </Label>
                <Input
                  className="mt-1.5"
                  type="number"
                  value={priceEdit.marketPrice}
                  onChange={(e) =>
                    setPriceEdit({ ...priceEdit, marketPrice: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>{t("Description")}</Label>
                <Textarea
                  className="mt-1.5"
                  rows={3}
                  maxLength={400}
                  value={priceEdit.description}
                  onChange={(e) => setPriceEdit({ ...priceEdit, description: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    updateProduct(priceEdit.id, {
                      price: priceEdit.price,
                      marketPrice: priceEdit.marketPrice,
                      description: priceEdit.description,
                      trend: trendOf(priceEdit.price - priceEdit.marketPrice),
                    });
                    setPriceEdit(null);
                    toast.success(t("Listing updated successfully."));
                  }}
                >
                  {t("Save Changes")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* details */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail && t(detail.name)}</DialogTitle>
          </DialogHeader>
          {detail && (
            <>
              <img
                src={detail.image}
                alt={detail.name}
                className="h-40 w-full rounded-xl object-cover"
              />
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Field label={t("Category")} value={t(detail.category)} />
                <Field label={t("Variety")} value={t(detail.variety)} />
                <Field label={t("Grade")} value={detail.grade} />
                <Field label={t("Available Qty")} value={`${detail.stock} ${t(detail.unit)}`} />
                <Field label={t("Selling Price")} value={unitPrice(detail.price, detail.unit)} />
                <Field
                  label={t("Market Price")}
                  value={unitPrice(detail.marketPrice, detail.unit)}
                />
                <Field label={t("Market")} value={t(detail.market)} />
                <Field label={t("Harvest Date")} value={detail.harvestDate} />
              </dl>
              <p className="text-sm text-muted-foreground">{t(detail.description)}</p>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* delete confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Delete listing")}</DialogTitle>
            <DialogDescription>
              {t("Are you sure you want to delete this listing?")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              {t("Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteProduct(confirmDelete!.id);
                setConfirmDelete(null);
                toast.success(t("Listing deleted"));
              }}
            >
              {t("Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full lg:w-40">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o === "All" ? `${t("All")} ${label}` : t(o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ------------------------------------------------------------------ market prices */

export function MarketPricesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [district, setDistrict] = useState("All");
  const [market, setMarket] = useState("All");
  const [selected, setSelected] = useState(MARKET_PRICE_BOARD[0]!.product);

  const rows = MARKET_PRICE_BOARD.filter(
    (m) =>
      m.product.toLowerCase().includes(q.toLowerCase()) &&
      (cat === "All" || m.category === cat) &&
      (district === "All" || m.district === district) &&
      (market === "All" || m.market === market),
  );
  const districts = [...new Set(MARKET_PRICE_BOARD.map((m) => m.district))];
  const top = [...MARKET_PRICE_BOARD].sort((a, b) => b.change - a.change)[0]!;

  return (
    <>
      <PageHeader
        title={t("Market Prices")}
        subtitle={t("Compare current agricultural produce prices across nearby markets.")}
        breadcrumb={[t("Seller"), t("Market Prices")]}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Store}
          label={t("Markets Tracked")}
          value={new Set(MARKET_PRICE_BOARD.map((m) => m.market)).size}
        />
        <StatCard
          icon={Leaf}
          label={t("Products Tracked")}
          value={MARKET_PRICE_BOARD.length}
          tone="forest"
        />
        <StatCard
          icon={TrendingUp}
          label={t("Prices Updated Today")}
          value={MARKET_PRICE_BOARD.length}
          tone="harvest"
        />
        <StatCard
          icon={IndianRupee}
          label={t("Highest Price Increase")}
          value={`${t(top.product)} +${top.change}%`}
          tone="forest"
        />
      </div>

      <Card className="mt-4 gap-0 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search crop or vegetable...")}
              className="pl-9"
            />
          </div>
          <Filter
            label={t("Category")}
            value={cat}
            onChange={setCat}
            options={["All", ...PRODUCE_CATEGORIES]}
          />
          <Filter
            label={t("District")}
            value={district}
            onChange={setDistrict}
            options={["All", ...districts]}
          />
          <Filter
            label={t("Market")}
            value={market}
            onChange={setMarket}
            options={["All", ...MARKETS]}
          />
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard
          title={t("Today's Mandi Rates")}
          desc={t("Select a row to see its 7 day price trend.")}
          className="lg:col-span-2"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Product")}</TableHead>
                  <TableHead>{t("Market")}</TableHead>
                  <TableHead>{t("District")}</TableHead>
                  <TableHead>{t("Min Price")}</TableHead>
                  <TableHead>{t("Max Price")}</TableHead>
                  <TableHead>{t("Average Price")}</TableHead>
                  <TableHead>{t("Unit")}</TableHead>
                  <TableHead>{t("Today's Change")}</TableHead>
                  <TableHead>{t("Last Updated")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((m) => (
                  <TableRow
                    key={m.id}
                    onClick={() => setSelected(m.product)}
                    className={`cursor-pointer ${selected === m.product ? "bg-pale/60" : ""}`}
                  >
                    <TableCell className="font-medium">{t(m.product)}</TableCell>
                    <TableCell className="text-muted-foreground">{t(m.market)}</TableCell>
                    <TableCell className="text-muted-foreground">{t(m.district)}</TableCell>
                    <TableCell>{inr(m.min)}</TableCell>
                    <TableCell>{inr(m.max)}</TableCell>
                    <TableCell className="font-semibold text-forest">{inr(m.avg)}</TableCell>
                    <TableCell>{t(m.unit)}</TableCell>
                    <TableCell>
                      <TrendBadge trend={trendOf(m.change)} change={m.change} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t(m.updated)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>

        <SectionCard title={`${t("Price Trend")} — ${t(selected)}`}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={PRICE_HISTORY[selected] ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} domain={["auto", "auto"]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2E7D32"
                strokeWidth={2}
                name={t("Average Price")}
              />
            </LineChart>
          </ResponsiveContainer>
          <Link to="/app/$" params={{ _splat: "seller/add-product" }} search={{ use: selected }}>
            <Button className="mt-3 w-full">{t("Use Market Price")}</Button>
          </Link>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {t("Prefills the market price while creating a listing.")}
          </p>
        </SectionCard>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ orders */

function nextActions(
  status: OrderStatus,
  fulfilment: Order["fulfilment"],
): { label: string; next: OrderStatus }[] {
  switch (status) {
    case "New":
      return [
        { label: "Accept Order", next: "Confirmed" },
        { label: "Reject Order", next: "Cancelled" },
      ];
    case "Confirmed":
      return [{ label: "Mark Packed", next: "Packed" }];
    case "Packed":
      return fulfilment === "Pickup"
        ? [{ label: "Ready for Pickup", next: "Ready for Pickup" }]
        : [{ label: "Out for Delivery", next: "Out for Delivery" }];
    case "Ready for Pickup":
    case "Out for Delivery":
      return [{ label: "Complete Order", next: "Completed" }];
    default:
      return [];
  }
}

function OrdersTable({
  limit,
  filterStatus,
  query = "",
  product = "All",
  buyerType = "All",
}: {
  limit?: number;
  filterStatus?: string;
  query?: string;
  product?: string;
  buyerType?: string;
}) {
  const { orders, setOrderStatus } = useStore();
  const [detail, setDetail] = useState<Order | null>(null);
  const filtered = bySeller(orders).filter(
    (o) =>
      (!filterStatus || filterStatus === "All" || o.status === filterStatus) &&
      (product === "All" || o.items.some((i) => i.name === product)) &&
      (buyerType === "All" || o.buyerType === buyerType) &&
      `${o.id} ${o.buyer} ${o.items.map((i) => i.name).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const list = limit ? filtered.slice(0, limit) : filtered;
  const current = detail ? (orders.find((o) => o.id === detail.id) ?? detail) : null;

  if (list.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title={t("No orders yet.")}
        desc={t("New produce orders from buyers will appear here.")}
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Order ID")}</TableHead>
              <TableHead>{t("Buyer Name")}</TableHead>
              <TableHead>{t("Product")}</TableHead>
              <TableHead>{t("Quantity")}</TableHead>
              <TableHead>{t("Price")}</TableHead>
              <TableHead>{t("Total Amount")}</TableHead>
              <TableHead>{t("Order Date")}</TableHead>
              <TableHead>{t("Delivery / Pickup")}</TableHead>
              <TableHead>{t("Status")}</TableHead>
              <TableHead className="text-right">{t("Action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((o) => {
              const item = o.items[0]!;
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.buyer}</TableCell>
                  <TableCell>
                    {t(item.name)}
                    {o.items.length > 1 ? ` +${o.items.length - 1}` : ""}
                  </TableCell>
                  <TableCell>
                    {item.qty} {t(item.unit)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {unitPrice(item.price, item.unit)}
                  </TableCell>
                  <TableCell className="font-semibold text-forest">{inr(o.total)}</TableCell>
                  <TableCell className="text-muted-foreground">{t(o.date)}</TableCell>
                  <TableCell>{t(o.fulfilment)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setDetail(o)}>
                      {t("View Order")}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!current} onOpenChange={() => setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {t("Order Details")} — {current?.id}
            </DialogTitle>
          </DialogHeader>
          {current && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={current.status} />
                <Badge variant="secondary">{t(current.fulfilment)}</Badge>
                <Badge variant="outline">{t(current.buyerType)}</Badge>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Field label={t("Buyer Name")} value={current.buyer} />
                <Field label={t("Phone")} value={current.mobile} />
                <Field
                  label={t("Product")}
                  value={current.items.map((i) => t(i.name)).join(", ")}
                />
                <Field
                  label={t("Quantity")}
                  value={current.items.map((i) => `${i.qty} ${t(i.unit)}`).join(", ")}
                />
                <Field
                  label={t("Price")}
                  value={current.items.map((i) => unitPrice(i.price, i.unit)).join(", ")}
                />
                <Field label={t("Total Amount")} value={inr(current.total)} />
                <Field label={t("Payment")} value={t(current.payment)} />
                <Field label={t("Order Date")} value={t(current.date)} />
              </dl>
              <p className="text-sm text-muted-foreground">{current.address}</p>
              <div className="rounded-xl bg-pale/60 p-3 text-xs">
                <p className="mb-1 font-semibold">{t("Order Timeline")}</p>
                {ORDER_STATUSES.filter((s) => s !== "Cancelled").map((s, i) => (
                  <p
                    key={s}
                    className={
                      ORDER_STATUSES.indexOf(current.status) >= i
                        ? "text-forest"
                        : "text-muted-foreground"
                    }
                  >
                    {ORDER_STATUSES.indexOf(current.status) >= i ? "●" : "○"} {t(s)}
                  </p>
                ))}
              </div>
              <DialogFooter className="flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => toast.info(`${t("Calling")} ${current.buyer} (demo)`)}
                >
                  <Phone className="size-4" /> {t("Contact Buyer")}
                </Button>
                {nextActions(current.status, current.fulfilment).map((a) => (
                  <Button
                    key={a.next}
                    variant={a.next === "Cancelled" ? "outline" : "default"}
                    onClick={() => {
                      setOrderStatus(current.id, a.next);
                      toast.success(`${current.id} → ${t(a.next)}`);
                    }}
                  >
                    {t(a.label)}
                  </Button>
                ))}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ProduceOrdersPage() {
  const { orders, products } = useStore();
  const search = useAppSearch();
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");
  const [product, setProduct] = useState("All");
  const [buyerType, setBuyerType] = useState("All");
  const productNames = [...new Set(products.map((p) => p.name))];
  const sellerOrders = bySeller(orders);
  const buyerTypes = [...new Set(sellerOrders.map((o) => o.buyerType))];
  const counts = useMemo(
    () =>
      (["New", "Confirmed", "Packed", "Completed"] as OrderStatus[]).map((s) => ({
        s,
        n: sellerOrders.filter((o) => o.status === s).length,
      })),
    [sellerOrders],
  );
  return (
    <>
      <PageHeader
        title={t("Orders")}
        subtitle={
          search.filter === "today"
            ? t("Produce orders received today.")
            : t("Process produce orders from buyers and update their status.")
        }
        breadcrumb={[t("Seller"), t("Orders")]}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {counts.map((c) => (
          <button key={c.s} type="button" className="text-left" onClick={() => setStatus(c.s)}>
            <StatCard icon={Receipt} label={`${t(c.s)} ${t("Orders")}`} value={c.n} />
          </button>
        ))}
      </div>
      <Card className="mt-4 gap-0 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search order ID, buyer or produce")}
              className="pl-9"
            />
          </div>
          <Filter
            label={t("Status")}
            value={status}
            onChange={setStatus}
            options={["All", ...ORDER_STATUSES]}
          />
          <Filter
            label={t("Product")}
            value={product}
            onChange={setProduct}
            options={["All", ...productNames]}
          />
          <Filter
            label={t("Buyer Type")}
            value={buyerType}
            onChange={setBuyerType}
            options={["All", ...buyerTypes]}
          />
        </div>
      </Card>
      <SectionCard title={t("All Orders")} className="mt-4">
        <OrdersTable filterStatus={status} query={q} product={product} buyerType={buyerType} />
      </SectionCard>
    </>
  );
}

/* ------------------------------------------------------------------ buyers */

export function MyBuyersPage() {
  const { orders } = useStore();
  const [detail, setDetail] = useState<(typeof BUYERS)[number] | null>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const totalPurchase = BUYERS.reduce((a, b) => a + b.spent, 0);
  const buyerList = BUYERS.filter(
    (b) =>
      `${b.name} ${b.phone} ${b.location} ${b.type}`.toLowerCase().includes(q.toLowerCase()) &&
      (type === "All" || b.type === type),
  );
  return (
    <>
      <PageHeader
        title={t("Customers / Buyers")}
        subtitle={t("Traders, wholesalers, retailers and households buying your produce.")}
        breadcrumb={[t("Seller"), t("Buyers")]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label={t("Total Buyers")} value={BUYERS.length} />
        <StatCard icon={TrendingUp} label={t("Repeat Buyers")} value="64%" tone="forest" />
        <StatCard
          icon={IndianRupee}
          label={t("Total Purchase Value")}
          value={inr(totalPurchase)}
          tone="harvest"
        />
      </div>
      <Card className="mt-4 gap-0 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search buyer name, phone or location")}
              className="pl-9"
            />
          </div>
          <Filter
            label={t("Buyer Type")}
            value={type}
            onChange={setType}
            options={["All", ...new Set(BUYERS.map((b) => b.type))]}
          />
        </div>
      </Card>
      {buyerList.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Users}
            title={t("No buyers found")}
            desc={t("Try a different keyword.")}
          />
        </div>
      ) : (
        <SectionCard title={t("Buyer List")} className="mt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Buyer Name")}</TableHead>
                  <TableHead>{t("Buyer Type")}</TableHead>
                  <TableHead>{t("Phone")}</TableHead>
                  <TableHead>{t("Location")}</TableHead>
                  <TableHead>{t("Orders")}</TableHead>
                  <TableHead>{t("Total Purchase")}</TableHead>
                  <TableHead>{t("Last Order")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead className="text-right">{t("Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buyerList.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{t(b.type)}</TableCell>
                    <TableCell className="text-muted-foreground">{b.phone}</TableCell>
                    <TableCell className="text-muted-foreground">{t(b.location)}</TableCell>
                    <TableCell>{b.orders}</TableCell>
                    <TableCell className="font-semibold text-forest">{inr(b.spent)}</TableCell>
                    <TableCell className="text-muted-foreground">{t(b.last)}</TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setDetail(b)}>
                        {t("View")}
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
            <DialogTitle>{detail?.name}</DialogTitle>
          </DialogHeader>
          {detail && (
            <>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Field label={t("Buyer Type")} value={t(detail.type)} />
                <Field label={t("Phone")} value={detail.phone} />
                <Field label={t("Location")} value={t(detail.location)} />
                <Field label={t("Total Purchase")} value={inr(detail.spent)} />
              </dl>
              <p className="text-sm font-semibold">{t("Purchase History")}</p>
              <div className="space-y-2">
                {orders
                  .filter((o) => o.seller === detail.name)
                  .map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-xl border p-3 text-sm"
                    >
                      <span>
                        {o.id} •{" "}
                        {o.items.map((i) => `${t(i.name)} ${i.qty} ${t(i.unit)}`).join(", ")}
                      </span>
                      <span className="font-semibold text-forest">{inr(o.total)}</span>
                    </div>
                  ))}
                {orders.filter((o) => o.seller === detail.name).length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("No orders yet.")}</p>
                )}
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => toast.info(`${t("Calling")} ${detail.name} (demo)`)}
              >
                <Phone className="size-4" /> {t("Contact Buyer")}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------------------------------------------------ enquiries */

export function EnquiriesPage() {
  const { enquiries, replyEnquiry } = useStore();
  const mine = enquiries.filter((e) => e.seller === SELLER);
  const [replies, setReplies] = useState<Record<string, string>>({});
  return (
    <>
      <PageHeader
        title={t("Buyer Enquiries")}
        subtitle={t("Answer produce questions from buyers.")}
        breadcrumb={[t("Seller"), t("Enquiries")]}
      />
      <div className="space-y-4">
        {mine.length === 0 && (
          <EmptyState
            icon={MessageSquare}
            title={t("No enquiries yet")}
            desc={t("Buyer questions about your produce will appear here.")}
          />
        )}
        {mine.map((e) => (
          <Card key={e.id} className="gap-0 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{e.buyer}</span>
              <Badge variant="secondary">{t(e.product)}</Badge>
              <span className="ml-auto text-xs text-muted-foreground">{t(e.time)}</span>
            </div>
            <div className="mt-3 space-y-2">
              {e.messages.map((m, i) => (
                <p
                  key={i}
                  className={
                    m.from === "seller"
                      ? "rounded-xl bg-pale/60 p-3 text-sm"
                      : "rounded-xl bg-muted/60 p-3 text-sm"
                  }
                >
                  <b>{m.from === "seller" ? t("You") : e.buyer}:</b> {t(m.text)}
                  <span className="ml-2 text-xs text-muted-foreground">{t(m.time)}</span>
                </p>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                maxLength={300}
                value={replies[e.id] ?? ""}
                onChange={(ev) => setReplies({ ...replies, [e.id]: ev.target.value })}
                placeholder={t("Type your reply")}
                aria-label={`Reply to ${e.buyer}`}
              />
              <Button
                className="gap-1.5"
                onClick={() => {
                  const text = (replies[e.id] ?? "").trim();
                  if (!text) {
                    toast.error(t("Enter a reply"));
                    return;
                  }
                  replyEnquiry(e.id, "seller", text);
                  setReplies({ ...replies, [e.id]: "" });
                  toast.success(t("Reply sent to buyer"));
                }}
              >
                <MessageSquare className="size-4" /> {t("Reply")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ analytics */

const RANGES = ["Today", "7 Days", "30 Days", "3 Months", "Custom"];

export function EarningsPage() {
  const { orders } = useStore();
  const [range, setRange] = useState("30 Days");
  const sellerOrders = bySeller(orders);
  const revenue = sellerOrders.reduce((a, o) => a + o.total, 0);
  const qty = sellerOrders.reduce((a, o) => a + o.items.reduce((s, i) => s + i.qty, 0), 0);
  const factor: Record<string, number> = {
    Today: 0.05,
    "7 Days": 0.28,
    "30 Days": 1,
    "3 Months": 2.8,
    Custom: 1.4,
  };
  const k = factor[range] ?? 1;
  const scale = (n: number) => Math.round(n * k);
  const monthly = CHART_DATA.monthly.slice(
    -(range === "Today" || range === "7 Days" ? 3 : range === "3 Months" ? 9 : 6),
  );
  return (
    <>
      <PageHeader
        title={t("Sales Analytics")}
        subtitle={t("Understand which produce sells best, in which market and at what price.")}
        breadcrumb={[t("Seller"), t("Analytics")]}
        action={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast.success(t("Analytics exported (demo)"))}
          >
            <Download className="size-4" /> {t("Export")}
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <Button
            key={r}
            size="sm"
            variant={range === r ? "default" : "outline"}
            className="h-8 rounded-full text-xs"
            onClick={() => setRange(r)}
          >
            {t(r)}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={IndianRupee}
          label={t("Today's Revenue")}
          value={inr(18450)}
          tone="forest"
        />
        <StatCard
          icon={IndianRupee}
          label={`${t("Revenue")} — ${t(range)}`}
          value={inr(scale(402000 + revenue))}
          tone="harvest"
        />
        <StatCard icon={Receipt} label={t("Orders")} value={scale(orders.length + 685)} />
        <StatCard
          icon={Boxes}
          label={t("Quantity Sold")}
          value={`${scale(qty + 33450).toLocaleString("en-IN")} ${t("kg")}`}
        />
        <StatCard
          icon={TrendingUp}
          label={t("Average Order Value")}
          value={inr(2480)}
          tone="forest"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Card className="gap-0 p-4">
          <p className="text-xs text-muted-foreground">{t("Best Selling Product")}</p>
          <p className="mt-1 text-lg font-bold text-forest">{t("Tomato")}</p>
        </Card>
        <Card className="gap-0 p-4">
          <p className="text-xs text-muted-foreground">{t("Highest Revenue Product")}</p>
          <p className="mt-1 text-lg font-bold text-forest">{t("Soybean")}</p>
        </Card>
        <Card className="gap-0 p-4">
          <p className="text-xs text-muted-foreground">{t("Most Active Market")}</p>
          <p className="mt-1 text-lg font-bold text-forest">{t("Solapur Mandi")}</p>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="mt-4">
        <TabsList>
          <TabsTrigger value="revenue">{t("Revenue Trend")}</TabsTrigger>
          <TabsTrigger value="products">{t("Sales by Product")}</TabsTrigger>
          <TabsTrigger value="category">{t("Sales by Category")}</TabsTrigger>
          <TabsTrigger value="status">{t("Orders by Status")}</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="mt-4">
          <SectionCard title={t("Monthly Revenue & Orders")}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#2E7D32" radius={[8, 8, 0, 0]} name={t("Revenue ₹")} />
                <Bar dataKey="orders" fill="#F9A825" radius={[8, 8, 0, 0]} name={t("Orders")} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </TabsContent>
        <TabsContent value="products" className="mt-4">
          <SectionCard title={t("Top Selling Produce")}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={CHART_DATA.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" width={140} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#66BB6A" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </TabsContent>
        <TabsContent value="category" className="mt-4">
          <SectionCard title={t("Sales Share by Category")}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={CHART_DATA.salesByCategory}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {CHART_DATA.salesByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>
        </TabsContent>
        <TabsContent value="status" className="mt-4">
          <SectionCard title={t("Orders by Status")}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={ORDER_STATUSES.map((s) => ({
                  name: t(s),
                  value: sellerOrders.filter((o) => o.status === s).length,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#26A69A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}

/* ------------------------------------------------------------------ reviews */

export function ReviewsPage() {
  const { reviews } = useStore();
  const mine = reviews.filter((r) => r.seller === SELLER);
  const [stars, setStars] = useState("All");
  const list = mine.filter((r) => stars === "All" || r.rating === Number(stars[0]));
  const avg = mine.length
    ? (mine.reduce((a, r) => a + r.rating, 0) / mine.length).toFixed(1)
    : "0.0";
  return (
    <>
      <PageHeader
        title={t("Ratings & Reviews")}
        subtitle={t("Feedback from buyers who purchased your produce.")}
        breadcrumb={[t("Seller"), t("Reviews")]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Star} label={t("Average Rating")} value={`${avg} / 5`} tone="harvest" />
        <StatCard icon={MessageSquare} label={t("Total Reviews")} value={mine.length} />
        <StatCard
          icon={Store}
          label={t("Seller Trust Score")}
          value={t("Excellent")}
          tone="forest"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {["All", "5 Star", "4 Star", "3 Star", "2 Star", "1 Star"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={stars === s ? "default" : "outline"}
            className="h-8 rounded-full text-xs"
            onClick={() => setStars(s)}
          >
            {t(s)}
          </Button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {list.length === 0 && (
          <EmptyState
            icon={Star}
            title={t("No reviews found")}
            desc={t("Try a different rating filter.")}
          />
        )}
        {list.map((r) => (
          <Card key={r.id} className="gap-0 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{r.buyer}</span>
              <Badge variant="secondary">{t(r.product)}</Badge>
              <span className="text-xs text-muted-foreground">{t(r.date)}</span>
              <span className="ml-auto flex items-center gap-0.5">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-harvest text-harvest" />
                ))}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t(r.text)}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-fit"
              onClick={() => toast.success(t("Thank you note sent"))}
            >
              {t("Reply")}
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}
