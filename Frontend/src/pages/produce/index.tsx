import { useCallback, useEffect, useMemo, useState } from "react";
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
  Loader2,
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
  backendCategoryLabel,
  backendStatusLabel,
  categoryPlaceholderImage,
  createProduct as apiCreateProduct,
  deleteProduct as apiDeleteProduct,
  fetchMyProducts,
  friendlyProductError,
  sellerDisplayName,
  updateProduct as apiUpdateProduct,
  type BackendListingStatus,
  type BackendProduct,
  type BackendProductCategory,
  type BackendProductUnit,
} from "@/lib/skl/products";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  TrendBadge,
  trendOf,
} from "@/components/skl/common";
import {
  BACKEND_ORDER_STATUSES,
  fetchSellerOrders,
  friendlyOrderError,
  orderStatusLabel,
  updateSellerOrderStatus,
  type BackendOrder,
  type BackendOrderStatus,
} from "@/lib/skl/orders";
import { inr, useStore } from "@/lib/skl/store";
import {
  BUYERS,
  CHART_DATA,
  MARKET_PRICE_BOARD,
  PRICE_HISTORY,
  type Order,
  type OrderStatus,
  type Product,
} from "@/lib/skl/data";
import { t } from "@/lib/skl/i18n";

const SELLER = "Shree Krushi Produce";
const BACKEND_CATEGORY_OPTIONS: { value: BackendProductCategory; label: string }[] = [
  { value: "VEGETABLE", label: "Vegetable" },
  { value: "FRUIT", label: "Fruit" },
  { value: "GRAIN", label: "Grain" },
  { value: "PULSE", label: "Pulse" },
  { value: "COMMERCIAL_CROP", label: "Commercial Crop" },
  { value: "OTHER", label: "Other" },
];
const BACKEND_UNIT_OPTIONS: BackendProductUnit[] = ["KG", "QUINTAL", "TON", "PIECE"];
const BACKEND_GRADE_OPTIONS = ["A", "B", "FAQ", "Premium", "Standard"];

function toBackendStatusFlag(s: BackendListingStatus): boolean {
  return s !== "INACTIVE";
}

function backendRows(list: BackendProduct[]) {
  return list.map((p) => ({
    id: String(p.id),
    name: p.name,
    category: backendCategoryLabel(p.category),
    grade: p.grade?.trim() ? p.grade : "—",
    quantity: p.quantity,
    unit: p.unit.toLowerCase(),
    price: p.price,
    location: p.location,
    status: p.status,
    statusLabel: backendStatusLabel(p.status),
    image: categoryPlaceholderImage(p.name),
    description: p.description ?? "",
    raw: p,
  }));
}
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
  const { orders, authUser } = useStore();
  const displayName = authUser?.name?.trim() ?? "";
  const [listings, setListings] = useState<BackendProduct[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingListings(true);
        setListingsError("");
        const data = await fetchMyProducts();
        if (!cancelled) setListings(data);
      } catch (err: unknown) {
        if (!cancelled) setListingsError(friendlyProductError(err, "Could not load listings."));
      } finally {
        if (!cancelled) setLoadingListings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const mine = useMemo(() => backendRows(listings), [listings]);
  const sellerOrders = bySeller(orders);
  const todayOrders = sellerOrders.filter(
    (o) => o.date === "21 Aug 2026" || o.status === "New" || o.status === "Confirmed",
  );
  const revenue = todayOrders.reduce((a, o) => a + o.total, 0);
  const totalStock = listings.reduce((a, p) => a + (Number.isFinite(p.quantity) ? p.quantity : 0), 0);
  const activeCount = listings.filter((p) => p.status === "ACTIVE").length;
  const lowStock = listings.filter((p) => p.quantity > 0 && p.quantity <= 200).length;
  const avgMarket = Math.round(
    MARKET_PRICE_BOARD.filter((m) => m.unit === "quintal").reduce((a, m) => a + m.avg, 0) /
      MARKET_PRICE_BOARD.filter((m) => m.unit === "quintal").length,
  );

  return (
    <>
      <PageHeader
        title={displayName ? `Welcome, ${displayName}! 👋` : `Welcome! 👋`}
        subtitle={t("Manage your agricultural produce, buyers, market prices and orders.")}
        breadcrumb={[t("Seller"), t("Dashboard")]}
        action={<Badge className="rounded-full">{t("🟢 Accepting Orders")}</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link to="/app/$" params={{ _splat: "seller/inventory" }} search={{ filter: "active" }}>
          <StatCard
            icon={Package}
            label={t("Active Listings")}
            value={loadingListings ? "…" : activeCount}
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
            value={`${totalStock.toLocaleString("en-IN")}`}
            hint={t("Across all live listings")}
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
        <LiveSellerOrdersTable limit={4} />
      </SectionCard>
    </>
  );
}

/* ------------------------------------------------------------------ add listing */

export function AddProductPage() {
  const navigate = useNavigate();
  const [f, setF] = useState({
    name: "",
    category: "VEGETABLE" as BackendProductCategory,
    grade: "A",
    stock: "",
    unit: "KG" as BackendProductUnit,
    price: "",
    location: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const publish = async () => {
    if (f.name.trim().length < 1) {
      toast.error(t("Enter a produce name"));
      return;
    }
    if (!f.category) {
      toast.error(t("Select a category"));
      return;
    }
    const qty = Number(f.stock);
    if (!f.stock || !Number.isFinite(qty) || qty <= 0) {
      toast.error(t("Enter the available quantity"));
      return;
    }
    if (!f.unit) {
      toast.error(t("Select a unit"));
      return;
    }
    const price = Number(f.price);
    if (!f.price || !Number.isFinite(price) || price <= 0) {
      toast.error(t("Enter a valid selling price"));
      return;
    }
    if (f.location.trim().length < 1) {
      toast.error(t("Enter a location"));
      return;
    }
    try {
      setSaving(true);
      const grade = f.grade.trim();
      const description = f.description.trim();
      await apiCreateProduct({
        name: f.name.trim(),
        category: f.category,
        ...(grade ? { grade } : {}),
        ...(description ? { description } : {}),
        quantity: qty,
        unit: f.unit,
        price,
        location: f.location.trim(),
      });
      toast.success(t("Product listed successfully"));
      navigate({ to: "/app/$", params: { _splat: "seller/inventory" } });
    } catch (err: unknown) {
      toast.error(friendlyProductError(err, t("Could not list product")));
    } finally {
      setSaving(false);
    }
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
                onValueChange={(v) => setF({ ...f, category: v as BackendProductCategory })}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BACKEND_CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {t(c.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("Grade / Quality")}</Label>
              <Select value={f.grade} onValueChange={(v) => setF({ ...f, grade: v })}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BACKEND_GRADE_OPTIONS.map((g) => (
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
              <Select
                value={f.unit}
                onValueChange={(v) => setF({ ...f, unit: v as BackendProductUnit })}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BACKEND_UNIT_OPTIONS.map((u) => (
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
              <Label>{t("Location")}</Label>
              <Input
                className="mt-1.5"
                maxLength={200}
                value={f.location}
                onChange={(e) => setF({ ...f, location: e.target.value })}
                placeholder={t("Solapur, Maharashtra")}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>{t("Description")}</Label>
              <Textarea
                className="mt-1.5"
                rows={4}
                maxLength={5000}
                value={f.description}
                onChange={(e) => setF({ ...f, description: e.target.value })}
                placeholder={t("Fresh red tomatoes harvested this week")}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="gap-2" onClick={() => publish()} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              <Plus className="size-4" /> {t("Publish Listing")}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigate({ to: "/app/$", params: { _splat: "seller/inventory" } });
              }}
            >
              {t("Cancel")}
            </Button>
          </div>
        </SectionCard>
        <SectionCard title={t("Listing Photo")}>
          <div className="grid h-40 place-items-center rounded-xl border border-dashed bg-pale/40 text-sm text-muted-foreground">
            {t("Image upload arrives in a later module")}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {t(
              "Marketplace cards keep using local category placeholder images for display only.",
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
  const search = useAppSearch();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState(search.filter === "low" ? "OUT_OF_STOCK" : "All");
  const [showInactive, setShowInactive] = useState(true);
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [stockEdit, setStockEdit] = useState<BackendProduct | null>(null);
  const [stockValue, setStockValue] = useState("");
  const [editRow, setEditRow] = useState<BackendProduct | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "VEGETABLE" as BackendProductCategory,
    grade: "",
    quantity: "",
    unit: "KG" as BackendProductUnit,
    price: "",
    location: "",
    status: "ACTIVE" as BackendListingStatus,
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<BackendProduct | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<BackendProduct | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const data = await fetchMyProducts({
        search: q.trim() || undefined,
        category: cat === "All" ? "" : (cat as BackendProductCategory),
        status: status === "All" ? "" : (status as BackendListingStatus),
      });
      setListings(data);
    } catch (err: unknown) {
      setLoadError(friendlyProductError(err, t("Could not load inventory.")));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      void load();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cat, status]);

  const visible = showInactive ? listings : listings.filter((p) => p.status !== "INACTIVE");
  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const rows = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const saveStock = async () => {
    if (!stockEdit) return;
    const qty = Number(stockValue);
    if (!Number.isFinite(qty) || qty < 0) {
      toast.error(t("Enter a valid quantity"));
      return;
    }
    try {
      setSaving(true);
      const updated = await apiUpdateProduct(stockEdit.id, { quantity: qty });
      setListings((prev) => prev.map((x) => (x.id === stockEdit.id ? updated : x)));
      setStockEdit(null);
      toast.success(t("Listing updated successfully."));
    } catch (err: unknown) {
      toast.error(friendlyProductError(err, t("Could not update stock")));
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editRow) return;
    const qty = Number(editForm.quantity);
    const price = Number(editForm.price);
    if (editForm.name.trim().length < 1) {
      toast.error(t("Enter a produce name"));
      return;
    }
    if (!Number.isFinite(qty) || qty < 0) {
      toast.error(t("Enter a valid quantity"));
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast.error(t("Enter a valid selling price"));
      return;
    }
    if (editForm.location.trim().length < 1) {
      toast.error(t("Enter a location"));
      return;
    }
    try {
      setSaving(true);
      const grade = editForm.grade.trim();
      const description = editForm.description.trim();
      const updated = await apiUpdateProduct(editRow.id, {
        name: editForm.name.trim(),
        category: editForm.category,
        ...(grade ? { grade } : { grade: "" }),
        quantity: qty,
        unit: editForm.unit,
        price,
        location: editForm.location.trim(),
        status: editForm.status,
        ...(description ? { description } : { description: "" }),
      });
      setListings((prev) => prev.map((x) => (x.id === editRow.id ? updated : x)));
      setEditRow(null);
      toast.success(t("Listing updated successfully."));
    } catch (err: unknown) {
      toast.error(friendlyProductError(err, t("Could not update listing")));
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailable = async (p: BackendProduct) => {
    try {
      setTogglingId(p.id);
      const next: BackendListingStatus = p.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
      const updated = await apiUpdateProduct(p.id, { status: next });
      setListings((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
      toast.success(
        next === "INACTIVE" ? t("Listing marked unavailable") : t("Listing is available again"),
      );
    } catch (err: unknown) {
      toast.error(friendlyProductError(err, t("Could not update listing")));
    } finally {
      setTogglingId(null);
    }
  };

  const removeListing = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await apiDeleteProduct(confirmDelete.id);
      const removedId = confirmDelete.id;
      setListings((prev) =>
        prev.map((x) => (x.id === removedId ? { ...x, status: "INACTIVE" } : x)),
      );
      setConfirmDelete(null);
      toast.success(t("Product removed successfully"));
    } catch (err: unknown) {
      toast.error(friendlyProductError(err, t("Could not remove listing")));
    } finally {
      setDeleting(false);
    }
  };

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label={t("Total Listings")} value={listings.length} />
        <StatCard
          icon={Carrot}
          label={t("Active")}
          value={listings.filter((p) => p.status === "ACTIVE").length}
          tone="harvest"
        />
        <StatCard
          icon={Wheat}
          label={t("Sold Out")}
          value={listings.filter((p) => p.status === "OUT_OF_STOCK").length}
          tone="forest"
        />
        <StatCard
          icon={AlertTriangle}
          label={t("Inactive")}
          value={listings.filter((p) => p.status === "INACTIVE").length}
          tone="warning"
        />
      </div>

      <Card className="mt-4 gap-0 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search your listings...")}
              className="pl-9"
            />
          </div>
          <Filter
            label={t("Category")}
            value={cat}
            onChange={setCat}
            options={["All", ...BACKEND_CATEGORY_OPTIONS.map((c) => c.value)]}
          />
          <Filter
            label={t("Status")}
            value={status}
            onChange={setStatus}
            options={["All", "ACTIVE", "OUT_OF_STOCK", "INACTIVE"]}
          />
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
            <Switch
              checked={showInactive}
              onCheckedChange={setShowInactive}
              id="show-inactive"
            />
            <Label htmlFor="show-inactive">{t("Show inactive")}</Label>
          </div>
        </div>
        {loadError && <p className="mt-3 text-sm text-destructive">{loadError}</p>}
      </Card>

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("Loading inventory...")}
        </div>
      ) : rows.length === 0 ? (
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
                  <TableHead>{t("Location")}</TableHead>
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
                          src={categoryPlaceholderImage(p.name)}
                          alt={p.name}
                          loading="lazy"
                          width={80}
                          height={80}
                          className="size-9 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {sellerDisplayName(p.seller)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t(backendCategoryLabel(p.category))}
                    </TableCell>
                    <TableCell>{p.grade?.trim() ? p.grade : "—"}</TableCell>
                    <TableCell>
                      {p.quantity.toLocaleString("en-IN")} {t(p.unit)}
                    </TableCell>
                    <TableCell className="font-semibold text-forest">
                      {unitPrice(p.price, p.unit)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.location}</TableCell>
                    <TableCell>
                      <StatusBadge status={backendStatusLabel(p.status)} />
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
                          <DropdownMenuItem
                            onClick={() => {
                              setEditRow(p);
                              setEditForm({
                                name: p.name,
                                category: p.category,
                                grade: p.grade ?? "",
                                quantity: String(p.quantity),
                                unit: p.unit,
                                price: String(p.price),
                                location: p.location,
                                status: p.status,
                                description: p.description ?? "",
                              });
                            }}
                          >
                            {t("Edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setStockEdit(p);
                              setStockValue(String(p.quantity));
                            }}
                          >
                            {t("Update Stock")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={togglingId === p.id}
                            onClick={() => void toggleAvailable(p)}
                          >
                            {p.status === "INACTIVE" ? t("Mark Available") : t("Mark Unavailable")}
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
              {t("Page")} {safePage} / {pages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
              >
                {t("Previous")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={safePage >= pages}
                onClick={() => setPage(safePage + 1)}
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
              {t("Update Stock")} — {stockEdit && stockEdit.name}
            </DialogTitle>
            <DialogDescription>
              {t("Setting quantity to 0 marks the listing as Sold Out.")}
            </DialogDescription>
          </DialogHeader>
          {stockEdit && (
            <>
              <Label>
                {t("Available Quantity")} ({t(stockEdit.unit)})
              </Label>
              <Input type="number" value={stockValue} onChange={(e) => setStockValue(e.target.value)} />
              <DialogFooter>
                <Button disabled={saving} onClick={() => void saveStock()}>
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {t("Save Changes")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* edit listing */}
      <Dialog open={!!editRow} onOpenChange={() => setEditRow(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("Edit Listing")} — {editRow && editRow.name}
            </DialogTitle>
          </DialogHeader>
          {editRow && (
            <div className="grid gap-3">
              <div>
                <Label>{t("Product Name")}</Label>
                <Input
                  className="mt-1.5"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("Quantity")}</Label>
                  <Input
                    className="mt-1.5"
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t("Price")} (₹)</Label>
                  <Input
                    className="mt-1.5"
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>{t("Location")}</Label>
                <Input
                  className="mt-1.5"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("Description")}</Label>
                <Textarea
                  className="mt-1.5"
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button disabled={saving} onClick={() => void saveEdit()}>
                  {saving && <Loader2 className="size-4 animate-spin" />}
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
            <DialogTitle>{detail && detail.name}</DialogTitle>
          </DialogHeader>
          {detail && (
            <>
              <img
                src={categoryPlaceholderImage(detail.name)}
                alt={detail.name}
                className="h-40 w-full rounded-xl object-cover"
              />
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Field label={t("Category")} value={t(backendCategoryLabel(detail.category))} />
                <Field label={t("Grade")} value={detail.grade?.trim() ? detail.grade : "—"} />
                <Field
                  label={t("Available Qty")}
                  value={`${detail.quantity} ${t(detail.unit)}`}
                />
                <Field
                  label={t("Selling Price")}
                  value={unitPrice(detail.price, detail.unit)}
                />
                <Field label={t("Location")} value={detail.location} />
                <Field label={t("Status")} value={backendStatusLabel(detail.status)} />
              </dl>
              {detail.description && (
                <p className="text-sm text-muted-foreground">{detail.description}</p>
              )}
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
            <Button variant="destructive" disabled={deleting} onClick={() => void removeListing()}>
              {deleting && <Loader2 className="size-4 animate-spin" />}
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
            options={["All", "Vegetable", "Fruit", "Grain", "Pulse", "Commercial Crop", "Other"]}
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
            options={["All", "Solapur Mandi", "Lasalgaon Mandi", "Nashik Mandi", "Pune Mandi"]}
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

export function LiveSellerOrdersTable({
  limit,
  filterStatus,
  query = "",
}: {
  limit?: number;
  filterStatus?: string;
  query?: string;
}) {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<BackendOrder | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const status =
        filterStatus && filterStatus !== "All"
          ? (filterStatus as BackendOrderStatus)
          : undefined;
      setOrders(
        await fetchSellerOrders({
          ...(status ? { status } : {}),
          ...(query.trim() ? { search: query.trim() } : {}),
        }),
      );
    } catch (err: unknown) {
      setError(friendlyOrderError(err, t("Could not load seller orders.")));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, query]);

  useEffect(() => {
    void load();
  }, [load]);

  const list = limit ? orders.slice(0, limit) : orders;
  const current = detail ? (orders.find((o) => o.id === detail.id) ?? detail) : null;
  async function changeStatus(o: BackendOrder, next: BackendOrderStatus) {
    try {
      setUpdating(true);
      await updateSellerOrderStatus(o.id, next as "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED");
      toast.success(`${t("Order")} #${o.id} ? ${t(orderStatusLabel(next))}`);
      await load();
      setDetail(null);
    } catch (err: unknown) {
      toast.error(friendlyOrderError(err, t("Could not update order status.")));
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> {t("Loading orders...")}
      </div>
    );
  }
  if (error) {
    return (
      <EmptyState
        icon={Receipt}
        title={t("Could not load orders")}
        desc={error}
        action={<Button onClick={() => void load()}>{t("Retry")}</Button>}
      />
    );
  }

  if (list.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title={t("No live orders yet.")}
        desc={t("New buyer orders for your products will appear here.")}
      />
    );
  }

  return (
    <>
      <div className="mb-3">
        <Badge variant="outline">
          {t("Mock seller orders are hidden here; only live backend orders are shown.")}
        </Badge>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Order ID")}</TableHead>
              <TableHead>{t("Buyer")}</TableHead>
              <TableHead>{t("Product")}</TableHead>
              <TableHead>{t("Quantity")}</TableHead>
              <TableHead>{t("Total")}</TableHead>
              <TableHead>{t("Status")}</TableHead>
              <TableHead>{t("Order Date")}</TableHead>
              <TableHead className="text-right">{t("Action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">#{o.id}</TableCell>
                <TableCell>{o.buyer?.name ?? `Buyer #${o.buyerId}`}</TableCell>
                <TableCell>{o.items.map((i) => i.productName).join(", ")}</TableCell>
                <TableCell>{o.items.map((i) => `${i.quantity} ${t(i.unit)}`).join(", ")}</TableCell>
                <TableCell className="font-semibold text-forest">{inr(o.totalAmount)}</TableCell>
                <TableCell><Badge variant="outline">{t(orderStatusLabel(o.status))}</Badge></TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</TableCell>
                <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => setDetail(o)}>{t("View")}</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!current} onOpenChange={() => setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("Order Details")} � #{current?.id}</DialogTitle>
          </DialogHeader>
          {current && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{t(orderStatusLabel(current.status))}</Badge>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Field label={t("Buyer")} value={current.buyer?.name ?? `#${current.buyerId}`} />
                <Field label={t("Buyer Email")} value={current.buyer?.email ?? "�"} />
                <Field label={t("Product")} value={current.items.map((i) => i.productName).join(", ")} />
                <Field label={t("Quantity")} value={current.items.map((i) => `${i.quantity} ${t(i.unit)}`).join(", ")} />
                <Field label={t("Price")} value={current.items.map((i) => `${inr(i.unitPrice)}/${t(i.unit)}`).join(", ")} />
                <Field label={t("Total")} value={inr(current.totalAmount)} />
                <Field label={t("Order Date")} value={new Date(current.createdAt).toLocaleString()} />
              </dl>
              <DialogFooter className="flex-wrap gap-2">
                {current.status === "PENDING" && (
                  <>
                    <Button
                      disabled={updating}
                      onClick={() => void changeStatus(current, "CONFIRMED")}
                    >
                      {t("Confirm")}
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={updating}
                      onClick={() => void changeStatus(current, "CANCELLED")}
                    >
                      {t("Cancel")}
                    </Button>
                  </>
                )}
                {current.status === "CONFIRMED" && (
                  <>
                    <Button
                      disabled={updating}
                      onClick={() => void changeStatus(current, "PROCESSING")}
                    >
                      {t("Mark Processing")}
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={updating}
                      onClick={() => void changeStatus(current, "CANCELLED")}
                    >
                      {t("Cancel")}
                    </Button>
                  </>
                )}
                {current.status === "PROCESSING" && (
                  <>
                    <Button
                      disabled={updating}
                      onClick={() => void changeStatus(current, "SHIPPED")}
                    >
                      {t("Mark Shipped")}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={updating}
                      onClick={() => void changeStatus(current, "CANCELLED")}
                    >
                      {t("Cancel")}
                    </Button>
                  </>
                )}
                {current.status === "SHIPPED" && (
                  <Button
                    disabled={updating}
                    onClick={() => void changeStatus(current, "DELIVERED")}
                  >
                    {t("Mark Delivered")}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MockOrdersTable({
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
  void limit;
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
                  onClick={() => toast.info(t("Buyer contact is not part of this module."))}
                >
                  <Phone className="size-4" /> {t("Contact Buyer")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ProduceOrdersPage() {
  const search = useAppSearch();
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");
  return (
    <>
      <PageHeader
        title={t("Orders")}
        subtitle={
          search.filter === "today"
            ? t("Produce orders received today.")
            : t("Live buyer orders for your products. Confirm to move stock.")
        }
        breadcrumb={[t("Seller"), t("Orders")]}
      />
      <div className="mb-3">
        <Badge variant="outline">
          {t("Mock seller orders are hidden here; only live backend orders are shown.")}
        </Badge>
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
            options={["All", ...BACKEND_ORDER_STATUSES]}
          />
        </div>
      </Card>
      <SectionCard title={t("All Orders")} className="mt-4">
        <LiveSellerOrdersTable filterStatus={status} query={q} />
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
