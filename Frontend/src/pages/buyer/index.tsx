import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Heart,
  IndianRupee,
  Leaf,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Receipt,
  Search,
  ShoppingBag,
  Sprout,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  SELLER_PROFILES,
  MARKETS,
  MARKET_PRICE_BOARD,
  PRODUCE_CATEGORIES,
  type Order,
  type OrderStatus,
  type Product,
} from "@/lib/skl/data";
import {
  BACKEND_ORDER_STATUSES,
  cancelMyOrder,
  fetchBuyerOrderById,
  fetchMyOrders,
  friendlyOrderError,
  orderStatusLabel,
  placeOrder as apiPlaceOrder,
  type BackendOrder,
  type BackendOrderStatus,
} from "@/lib/skl/orders";
import {
  backendCategoryLabel,
  backendStatusLabel,
  categoryPlaceholderImage,
  fetchMarketplaceProducts,
  fetchProductById,
  friendlyProductError,
  sellerDisplayName,
  type BackendProduct,
  type BackendProductCategory,
} from "@/lib/skl/products";
import { t } from "@/lib/skl/i18n";

export const BUYER = "Mahesh Traders";
const BUYER_TYPE = "Wholesaler";
const BUYER_MOBILE = "98220 44112";
const BUYER_ADDRESS = "Market Yard, Solapur, Maharashtra - 413001";

const DELIVERY_OPTIONS = ["Pickup", "Seller Delivery", "Buyer Transport"];
const PAYMENT_OPTIONS = ["Cash on Delivery", "Pay on Pickup", "UPI", "Online Payment"];
const SORTS = [
  "Price: Low to High",
  "Price: High to Low",
  "Newest",
  "Highest Rated",
  "Nearest Seller",
];
const ORDER_FLOW: OrderStatus[] = [
  "New",
  "Confirmed",
  "Packed",
  "Ready for Pickup",
  "Out for Delivery",
  "Completed",
];

function unitPrice(price: number, unit: string) {
  return `${inr(price)}/${t(unit)}`;
}

function useAppSearch() {
  return useSearch({ from: "/app/$" }) as { filter?: string; use?: string };
}

function sellerOf(name: string) {
  return SELLER_PROFILES.find((f) => f.name === name);
}

function priceGap(p: Product) {
  const diff = p.price - p.marketPrice;
  const label =
    diff === 0
      ? t("At Market")
      : diff > 0
        ? `${inr(Math.abs(diff))} ${t("above market")}`
        : `${inr(Math.abs(diff))} ${t("below market")}`;
  return { diff, label };
}

/* ------------------------------------------------------------------ buy now */

function MarketplaceCard({
  product,
  onBuy,
  onContact,
}: {
  product: BackendProduct;
  onBuy: () => void;
  onContact: () => void;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative">
        <Link to="/app/$" params={{ _splat: `buyer/marketplace/${product.id}` }}>
          <img
            src={categoryPlaceholderImage(product.name)}
            alt={product.name}
            loading="lazy"
            width={640}
            height={360}
            className="h-44 w-full object-cover"
          />
        </Link>
        <Badge className="absolute top-3 left-3 rounded-full bg-white/95 text-forest">
          {t(backendCategoryLabel(product.category))}
        </Badge>
        <Badge className="absolute top-3 right-3 rounded-full bg-forest text-white">
          {t(backendStatusLabel(product.status))}
        </Badge>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-xs text-muted-foreground">
              {t("Grade")} {product.grade?.trim() ? product.grade : "—"} ·{" "}
              {sellerDisplayName(product.seller)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> {product.location}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-forest">{unitPrice(product.price, product.unit)}</span>
          <span className="text-xs text-muted-foreground">
            {t("Available")}: {product.quantity} {t(product.unit)}
          </span>
        </div>
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="flex-1" onClick={onBuy}>
            {t("Buy Now")}
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={onContact}>
            {t("Contact")}
          </Button>
          <Link
            to="/app/$"
            params={{ _splat: `buyer/marketplace/${product.id}` }}
            className="inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium"
          >
            {t("Details")}
          </Link>
        </div>
      </div>
    </Card>
  );
}

function MarketplaceBuyDialog({
  productId,
  onClose,
}: {
  productId: number | null;
  onClose: () => void;
}) {
  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qty, setQty] = useState("1");
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (productId === null) {
      setProduct(null);
      setError("");
      setQty("1");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchProductById(productId);
        if (!cancelled) {
          setProduct(data);
          setQty("1");
        }
      } catch (err: unknown) {
        if (!cancelled) setError(friendlyProductError(err, t("Could not load product.")));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const qtyNum = Number(qty);
  const validQty =
    product !== null && Number.isFinite(qtyNum) && qtyNum > 0 && qtyNum <= product.quantity;
  const previewTotal =
    product && Number.isFinite(qtyNum) && qtyNum > 0 ? product.price * qtyNum : 0;

  async function submit() {
    if (!product || !validQty) return;
    try {
      setPlacing(true);
      await apiPlaceOrder(product.id, qtyNum);
      toast.success(t("Order placed successfully"));
      onClose();
      navigate({ to: "/app/$", params: { _splat: "buyer/orders" } });
    } catch (err: unknown) {
      toast.error(friendlyOrderError(err, t("Could not place order.")));
    } finally {
      setPlacing(false);
    }
  }

  if (productId === null) return null;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Place Order")}</DialogTitle>
          <DialogDescription>
            {product
              ? `${product.name} • ${sellerDisplayName(product.seller)} • ${unitPrice(product.price, product.unit)}`
              : t("Enter a quantity and confirm. The backend recalculates the final total.")}
          </DialogDescription>
        </DialogHeader>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> {t("Loading product...")}
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {product && (
          <div className="grid gap-3">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Row label={t("Product")} value={product.name} />
              <Row label={t("Seller")} value={sellerDisplayName(product.seller)} />
              <Row
                label={t("Available Quantity")}
                value={`${product.quantity} ${t(product.unit)}`}
              />
              <Row label={t("Price Per Unit")} value={unitPrice(product.price, product.unit)} />
            </dl>
            <div>
              <Label>
                {t("Quantity")} ({t(product.unit)})
              </Label>
              <Input
                className="mt-1.5"
                type="number"
                min={1}
                max={product.quantity}
                step="any"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t("Total")}: {inr(previewTotal)}
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button disabled={!validQty || placing} onClick={() => void submit()}>
            {placing && <Loader2 className="size-4 animate-spin" />}
            {t("Place Order")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LegacyBuyNowDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  void product;
  void onClose;
  return null;
}

function BuyNowDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  void legacyBuyNowBody;
  return <LegacyBuyNowDialog product={product} onClose={onClose} />;
}

function legacyBuyNowBody(_args: {
  product: Product | null;
  onClose: () => void;
}) {
  const { product: legacyProduct, onClose } = _args;
  const { placeOrder } = useStore();
  const navigate = useNavigate();
  const [qty, setQty] = useState("");
  const [delivery, setDelivery] = useState(DELIVERY_OPTIONS[0]!);
  const [payment, setPayment] = useState(PAYMENT_OPTIONS[0]!);
  const [address, setAddress] = useState(BUYER_ADDRESS);
  const [placed, setPlaced] = useState<Order | null>(null);

  const product = legacyProduct;
  if (!product) return null;
  const quantity = Number(qty || product.minOrder);
  const subtotal = quantity * product.price;
  const deliveryCharge = delivery === "Seller Delivery" ? 100 : 0;
  const total = subtotal + deliveryCharge;

  const confirm = () => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error(t("Enter a valid quantity."));
      return;
    }
    if (quantity < product.minOrder) {
      toast.error(`${t("Minimum Order Quantity")}: ${product.minOrder} ${t(product.unit)}`);
      return;
    }
    if (quantity > product.stock) {
      toast.error(
        `${t("Only")} ${product.stock} ${t(product.unit)} ${t("is currently available.")}`,
      );
      return;
    }
    const id = placeOrder({
      seller: product.seller,
      buyer: BUYER,
      buyerType: BUYER_TYPE,
      items: [
        {
          productId: product.id,
          name: product.name,
          qty: quantity,
          price: product.price,
          unit: product.unit,
        },
      ],
      total,
      address,
      mobile: BUYER_MOBILE,
      payment,
      fulfilment: delivery === "Seller Delivery" ? "Delivery" : "Pickup",
      date: "21 Aug 2026",
      status: "New",
    });
    setPlaced({
      id,
      seller: product.seller,
      buyer: BUYER,
      buyerType: BUYER_TYPE,
      items: [
        {
          productId: product.id,
          name: product.name,
          qty: quantity,
          price: product.price,
          unit: product.unit,
        },
      ],
      total,
      address,
      mobile: BUYER_MOBILE,
      payment,
      fulfilment: delivery === "Seller Delivery" ? "Delivery" : "Pickup",
      date: "21 Aug 2026",
      status: "New",
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {placed ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("Order placed successfully.")}</DialogTitle>
              <DialogDescription>
                {t("The seller has been notified about your order.")}
              </DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Row label={t("Order ID")} value={placed.id} />
              <Row label={t("Product")} value={t(product.name)} />
              <Row label={t("Quantity")} value={`${quantity} ${t(product.unit)}`} />
              <Row label={t("Seller")} value={product.seller} />
              <Row label={t("Total")} value={inr(total)} />
              <Row label={t("Delivery Method")} value={t(delivery)} />
              <Row label={t("Order Status")} value={t("New")} />
            </dl>
            <DialogFooter className="flex-wrap gap-2">
              <Button variant="outline" onClick={onClose}>
                {t("Continue Shopping")}
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  navigate({ to: "/app/$", params: { _splat: "buyer/orders" } });
                }}
              >
                {t("View Order")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {t("Checkout")} — {t(product.name)}
              </DialogTitle>
              <DialogDescription>{t("Review your order before confirming.")}</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Row label={t("Seller")} value={product.seller} />
              <Row label={t("Seller Location")} value={t(product.location)} />
              <Row label={t("Available Quantity")} value={`${product.stock} ${t(product.unit)}`} />
              <Row label={t("Price Per Unit")} value={unitPrice(product.price, product.unit)} />
              <Row label={t("Buyer")} value={BUYER} />
              <Row label={t("Phone")} value={BUYER_MOBILE} />
            </dl>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="buy-qty">
                  {t("Quantity")} ({t(product.unit)})
                </Label>
                <Input
                  id="buy-qty"
                  className="mt-1.5"
                  type="number"
                  min={product.minOrder}
                  max={product.stock}
                  value={qty}
                  placeholder={String(product.minOrder)}
                  onChange={(e) => setQty(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("Minimum Order Quantity")}: {product.minOrder} {t(product.unit)}
                </p>
              </div>
              <div>
                <Label>{t("Delivery Type")}</Label>
                <Select value={delivery} onValueChange={setDelivery}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_OPTIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {t(d)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("Payment Method")}</Label>
                <Select value={payment} onValueChange={setPayment}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_OPTIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {t(d)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>{t("Delivery Address")}</Label>
                <Textarea
                  className="mt-1.5"
                  rows={2}
                  maxLength={200}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2 rounded-xl bg-pale/60 p-3 text-sm">
              <p className="font-semibold">{t("Order Summary")}</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("Subtotal")}</span>
                <span>{inr(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("Delivery Charge")}</span>
                <span>{deliveryCharge === 0 ? t("Free") : inr(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-forest">
                <span>{t("Total")}</span>
                <span>{inr(total)}</span>
              </div>
            </div>
            <DialogFooter className="flex-wrap gap-2">
              <Button variant="outline" onClick={onClose}>
                {t("Cancel")}
              </Button>
              <Button onClick={confirm}>{t("Confirm Order")}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ enquiry */

function MarketplaceContactDialog({
  product,
  onClose,
}: {
  product: BackendProduct | null;
  onClose: () => void;
}) {
  if (!product) return null;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("Contact Seller")} — {sellerDisplayName(product.seller)}
          </DialogTitle>
          <DialogDescription>
            {t("Seller enquiries and messaging arrive in a future module.")}
          </DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Row label={t("Product")} value={product.name} />
          <Row label={t("Seller")} value={sellerDisplayName(product.seller)} />
          <Row label={t("Location")} value={product.location} />
          <Row label={t("Price Per Unit")} value={unitPrice(product.price, product.unit)} />
        </dl>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContactSellerDialog({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  return <LegacyContactSellerDialog product={product} onClose={onClose} />;
}

function LegacyContactSellerDialog({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { sendEnquiry } = useStore();
  const [text, setText] = useState("");
  if (!product) return null;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("Contact Seller")} — {product.seller}
          </DialogTitle>
          <DialogDescription>
            {t("Ask about quantity, quality or delivery before buying.")}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          rows={4}
          maxLength={300}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("Is 200 kg Tomato available tomorrow?")}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button
            onClick={() => {
              if (!text.trim()) {
                toast.error(t("Type your message"));
                return;
              }
              sendEnquiry({
                buyer: BUYER,
                seller: product.seller,
                product: product.name,
                productId: product.id,
                text: text.trim(),
              });
              toast.success(`${t("Enquiry sent to")} ${product.seller}`);
              setText("");
              onClose();
            }}
          >
            {t("Send Enquiry")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ dashboard */

export function BuyerDashboard() {
  const { products, orders, savedListings, authUser } = useStore();
  const displayName = authUser?.name?.trim() ?? "";
  const available = products.filter((p) => p.active && p.stock > 0);
  const myOrders = orders.filter((o) => o.buyer === BUYER);
  const activeOrders = myOrders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled");
  const recommended = available.slice(0, 8);
  const [buy, setBuy] = useState<Product | null>(null);

  return (
    <>
      <PageHeader
        title={displayName ? `Welcome, ${displayName}! 👋` : `Welcome! 👋`}
        subtitle={t("Discover fresh agricultural produce and buy directly from sellers.")}
        breadcrumb={[t("Buyer"), t("Dashboard")]}
      />

      <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-r from-forest to-primary p-6 text-primary-foreground">
        <h2 className="text-2xl font-bold">{t("Fresh produce directly from sellers")}</h2>
        <p className="mt-1 max-w-2xl text-sm text-primary-foreground/85">
          {t(
            "Compare market prices, connect with sellers and purchase vegetables, fruits and crops directly.",
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/app/$" params={{ _splat: "buyer/marketplace" }}>
            <Button variant="secondary" className="gap-2">
              <ShoppingBag className="size-4" /> {t("Browse Marketplace")}
            </Button>
          </Link>
          <Link to="/app/$" params={{ _splat: "buyer/market-prices" }}>
            <Button variant="secondary" className="gap-2">
              <TrendingUp className="size-4" /> {t("Check Market Prices")}
            </Button>
          </Link>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/app/$" params={{ _splat: "buyer/marketplace" }}>
          <StatCard
            icon={Package}
            label={t("Available Products")}
            value={available.length}
            hint={t("Open Marketplace")}
          />
        </Link>
        <Link to="/app/$" params={{ _splat: "buyer/orders" }} search={{ filter: "active" }}>
          <StatCard
            icon={Receipt}
            label={t("Active Orders")}
            value={activeOrders.length}
            hint={t("Track your orders")}
            tone="harvest"
          />
        </Link>
        <Link to="/app/$" params={{ _splat: "buyer/saved" }}>
          <StatCard
            icon={Bookmark}
            label={t("Saved Products")}
            value={savedListings.length}
            hint={t("Your shortlist")}
            tone="forest"
          />
        </Link>
        <Link to="/app/$" params={{ _splat: "buyer/sellers" }}>
          <StatCard
            icon={Sprout}
            label={t("Nearby Sellers")}
            value={SELLER_PROFILES.length}
            hint={t("Verified sellers")}
            tone="forest"
          />
        </Link>
      </div>

      <SectionCard
        title={t("Today's Market Prices")}
        className="mt-4"
        action={
          <Link to="/app/$" params={{ _splat: "buyer/market-prices" }}>
            <Button size="sm" variant="outline">
              {t("View All Market Prices")}
            </Button>
          </Link>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {MARKET_PRICE_BOARD.slice(0, 5).map((m) => (
            <div key={m.id} className="rounded-xl border p-3">
              <p className="text-sm font-medium">{t(m.product)}</p>
              <p className="text-lg font-bold text-forest">
                {inr(m.avg)}/{t(m.unit)}
              </p>
              <TrendBadge trend={trendOf(m.change)} change={m.change} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={t("Recommended Produce")}
        className="mt-4"
        action={
          <Link to="/app/$" params={{ _splat: "buyer/marketplace" }}>
            <Button size="sm" variant="outline">
              {t("View all")}
            </Button>
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recommended.map((p) => (
            <ProduceCard key={p.id} product={p} onBuy={() => setBuy(p)} compact />
          ))}
        </div>
      </SectionCard>

      <BuyNowDialog product={buy} onClose={() => setBuy(null)} />
    </>
  );
}

/* ------------------------------------------------------------------ produce card */

function ProduceCard({
  product: p,
  onBuy,
  onContact,
  compact,
}: {
  product: Product;
  onBuy: () => void;
  onContact?: () => void;
  compact?: boolean;
}) {
  const { savedListings, toggleSavedListing } = useStore();
  const saved = savedListings.includes(p.id);
  const gap = priceGap(p);
  const profile = sellerOf(p.seller);
  return (
    <Card className="group gap-0 overflow-hidden p-0">
      <div className="relative">
        <img
          src={p.image}
          alt={t(p.name)}
          loading="lazy"
          width={640}
          height={360}
          className="h-36 w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge className="rounded-full">{t(p.category)}</Badge>
          {p.organic && (
            <Badge variant="secondary" className="rounded-full">
              {t("Organic")}
            </Badge>
          )}
        </div>
        <button
          type="button"
          aria-label={saved ? t("Remove from saved") : t("Save Product")}
          className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-card/90"
          onClick={() => {
            toggleSavedListing(p.id);
            toast.success(saved ? t("Removed from saved") : t("Saved for later"));
          }}
        >
          <Heart
            className={`size-4 ${saved ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
          />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{t(p.name)}</h3>
            <p className="text-xs text-muted-foreground">
              {t(p.variety)} • {t("Grade")} {p.grade}
            </p>
          </div>
          <TrendBadge trend={p.trend} />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sprout className="size-3.5" /> {p.seller}
          {p.verified && <BadgeCheck className="size-3.5 text-primary" />}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> {t(p.location)} • {t(p.market)}
        </p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-forest">{unitPrice(p.price, p.unit)}</p>
            <p className="text-xs text-muted-foreground">
              {t("Market Price")}: {unitPrice(p.marketPrice, p.unit)}
            </p>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-harvest text-harvest" /> {profile?.rating ?? p.rating}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("Available")}: {p.stock.toLocaleString("en-IN")} {t(p.unit)} • {gap.label}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/app/$" params={{ _splat: `buyer/marketplace/${p.id}` }} className="flex-1">
            <Button variant="outline" className="w-full">
              {t("View Details")}
            </Button>
          </Link>
          <Button className="flex-1" disabled={p.stock <= 0} onClick={onBuy}>
            {p.stock <= 0 ? t("Sold Out") : t("Buy Now")}
          </Button>
          {!compact && onContact && (
            <Button variant="ghost" className="w-full gap-1.5" onClick={onContact}>
              <MessageSquare className="size-4" /> {t("Contact Seller")}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ marketplace */

const BACKEND_CATEGORY_LABELS: { value: string; label: string }[] = [
  { value: "VEGETABLE", label: "Vegetable" },
  { value: "FRUIT", label: "Fruit" },
  { value: "GRAIN", label: "Grain" },
  { value: "PULSE", label: "Pulse" },
  { value: "COMMERCIAL_CROP", label: "Commercial Crop" },
  { value: "OTHER", label: "Other" },
];

function categoryValue(p: BackendProduct): string {
  return p.category;
}

export function BuyerMarketplace() {
  const search = useAppSearch();
  const [q, setQ] = useState(search.use ?? "");
  const [cat, setCat] = useState("All");
  const [location, setLocation] = useState("");
  const [grade, setGrade] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState(SORTS[0]!);
  const [listings, setListings] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [buyId, setBuyId] = useState<number | null>(null);
  const [contact, setContact] = useState<BackendProduct | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const data = await fetchMarketplaceProducts({
        ...(q.trim() ? { search: q.trim() } : {}),
        ...(cat !== "All" ? { category: cat as BackendProductCategory } : {}),
        ...(location.trim() ? { location: location.trim() } : {}),
        ...(maxPrice.trim() ? { maxPrice: maxPrice.trim() } : {}),
      });
      setListings(data);
    } catch (err: unknown) {
      setLoadError(friendlyProductError(err, t("Could not load marketplace.")));
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
      void load();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cat, location, maxPrice]);

  const grades = useMemo(() => [...new Set(listings.map((p) => p.grade ?? "").filter(Boolean))], [listings]);

  const list = useMemo(() => {
    const filtered = listings.filter(
      (p) => grade === "All" || (p.grade ?? "") === grade,
    );
    const sorted = [...filtered];
    if (sort === "Price: Low to High") sorted.sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") sorted.sort((a, b) => b.price - a.price);
    if (sort === "Newest") sorted.sort((a, b) => b.id - a.id);
    if (sort === "Nearest Seller") sorted.sort((a, b) => a.location.localeCompare(b.location));
    return sorted;
  }, [listings, grade, sort]);

  const clear = () => {
    setQ("");
    setCat("All");
    setLocation("");
    setGrade("All");
    setMaxPrice("");
  };

  return (
    <>
      <PageHeader
        title={t("Produce Marketplace")}
        subtitle={t("Buy vegetables, fruits, grains and crops directly from verified sellers.")}
        breadcrumb={[t("Buyer"), t("Marketplace")]}
        action={
          <Badge variant="secondary" className="rounded-full">
            {list.length} {t("results")}
          </Badge>
        }
      />

      <Card className="gap-0 p-4">
        <div className="grid gap-3 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search vegetables, fruits and crops...")}
              className="pl-9"
            />
          </div>
          <Pick
            value={cat}
            onChange={setCat}
            options={["All", ...BACKEND_CATEGORY_LABELS.map((c) => c.value)]}
            label={t("Category")}
          />
          <div className="flex gap-2">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("Location")}
            />
          </div>
          <Pick value={grade} onChange={setGrade} options={["All", ...grades]} label={t("Grade")} />
          <div className="flex gap-2">
            <Input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder={t("Max price")}
            />
            <Pick value={sort} onChange={setSort} options={SORTS} label={t("Sort")} />
          </div>
        </div>
        {loadError && <p className="mt-3 text-sm text-destructive">{loadError}</p>}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {list.length} {t("produce listings match your filters")}
          </span>
          <Button size="sm" variant="ghost" onClick={clear}>
            {t("Clear filters")}
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("Loading marketplace...")}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={ShoppingBag}
            title={t("No produce found.")}
            desc={t("Try another crop name, category or location.")}
            action={<Button onClick={clear}>{t("Clear filters")}</Button>}
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <MarketplaceCard
              key={p.id}
              product={p}
              onBuy={() => setBuyId(p.id)}
              onContact={() => setContact(p)}
            />
          ))}
        </div>
      )}

      <MarketplaceBuyDialog productId={buyId} onClose={() => setBuyId(null)} />
      <MarketplaceContactDialog product={contact} onClose={() => setContact(null)} />
    </>
  );
}

function Pick({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
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

/* ------------------------------------------------------------------ product details */

export function BuyerProductDetail({ productId }: { productId: string }) {
  const id = Number(productId);
  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showBuy, setShowBuy] = useState(false);
  const [contact, setContact] = useState<BackendProduct | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        if (!Number.isInteger(id) || id <= 0) throw new Error("Product not found.");
        const data = await fetchProductById(id);
        if (!cancelled) setProduct(data);
      } catch (err: unknown) {
        if (!cancelled) setLoadError(friendlyProductError(err, t("Could not load product.")));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <PageHeader title={t("Produce Details")} breadcrumb={[t("Buyer"), t("Marketplace")]} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("Loading product...")}
        </div>
      </>
    );
  }

  if (!product || loadError) {
    return (
      <>
        <PageHeader title={t("Produce Details")} breadcrumb={[t("Buyer"), t("Marketplace")]} />
        <EmptyState
          icon={Package}
          title={t("No produce found.")}
          desc={loadError || t("This listing is no longer available.")}
          action={
            <Link to="/app/$" params={{ _splat: "buyer/marketplace" }}>
              <Button>{t("Back to Marketplace")}</Button>
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t("Produce Details")}
        subtitle={`${product.name} • ${t(backendCategoryLabel(product.category))}`}
        breadcrumb={[t("Buyer"), t("Marketplace"), product.name]}
        action={
          <Link to="/app/$" params={{ _splat: "buyer/marketplace" }}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" /> {t("Back to Marketplace")}
            </Button>
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 overflow-hidden p-0 lg:col-span-2">
          <img
            src={categoryPlaceholderImage(product.name)}
            alt={product.name}
            className="h-64 w-full object-cover"
          />
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{product.name}</h2>
              <Badge>{t(backendCategoryLabel(product.category))}</Badge>
              <Badge variant="secondary">
                {t("Grade")} {product.grade?.trim() ? product.grade : "—"}
              </Badge>
              <StatusBadge status={backendStatusLabel(product.status)} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Row label={t("Seller")} value={sellerDisplayName(product.seller)} />
              <Row label={t("Seller Location")} value={product.location} />
              <Row
                label={t("Available Quantity")}
                value={`${product.quantity} ${t(product.unit)}`}
              />
              <Row label={t("Unit")} value={t(product.unit)} />
              <Row label={t("Location")} value={product.location} />
              <Row label={t("Status")} value={t(backendStatusLabel(product.status))} />
            </dl>
            {product.description && (
              <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <SectionCard title={t("Price")}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("Seller Price")}</span>
                <span className="font-semibold text-forest">
                  {unitPrice(product.price, product.unit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("Seller")}</span>
                <span>{sellerDisplayName(product.seller)}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={t("Seller Information")}>
            <dl className="grid gap-3 text-sm">
              <Row label={t("Seller")} value={sellerDisplayName(product.seller)} />
              <Row label={t("Location")} value={product.location} />
              {product.seller?.sellerProfile?.district && (
                <Row
                  label={t("District")}
                  value={product.seller.sellerProfile.district}
                />
              )}
              {product.seller?.sellerProfile?.state && (
                <Row label={t("State")} value={product.seller.sellerProfile.state} />
              )}
            </dl>
          </SectionCard>

          <SectionCard title={t("Actions")}>
            <div className="grid gap-2">
              <Button onClick={() => setShowBuy(true)}>{t("Buy Now")}</Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setContact(product)}
              >
                <MessageSquare className="size-4" /> {t("Contact Seller")}
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>

      <MarketplaceBuyDialog productId={showBuy ? product.id : null} onClose={() => setShowBuy(false)} />
      <MarketplaceContactDialog product={contact} onClose={() => setContact(null)} />
    </>
  );
}

/* ------------------------------------------------------------------ orders */

export function BuyerOrdersPage({ orderId }: { orderId?: string }) {
  const navigate = useNavigate();
  const [liveOrders, setLiveOrders] = useState<BackendOrder[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState("");
  const [status, setStatus] = useState<BackendOrderStatus | "All">("All");
  const [query, setQuery] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadLiveOrders = useCallback(async () => {
    try {
      setLiveLoading(true);
      setLiveError("");
      setLiveOrders(await fetchMyOrders());
    } catch (err: unknown) {
      setLiveError(friendlyOrderError(err, t("Could not load orders.")));
    } finally {
      setLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLiveOrders();
  }, [loadLiveOrders]);

  const liveFiltered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return liveOrders.filter((o) => {
      if (status !== "All" && o.status !== status) return false;
      if (!needle) return true;
      const hay = [
        String(o.id),
        ...o.items.map((i) => i.productName),
        o.items[0]?.seller?.name ?? "",
        o.items[0]?.seller?.sellerProfile?.businessName ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [liveOrders, status, query]);

  async function cancelLiveOrder(id: number) {
    try {
      setCancellingId(id);
      await cancelMyOrder(id);
      toast.success(t("Order cancelled successfully"));
      await loadLiveOrders();
    } catch (err: unknown) {
      toast.error(friendlyOrderError(err, t("Could not cancel order.")));
    } finally {
      setCancellingId(null);
    }
  }

  if (orderId) {
    return (
      <BuyerLiveOrderDetail
        orderId={orderId}
        onBack={() => navigate({ to: "/app/$", params: { _splat: "buyer/orders" } })}
        onChanged={() => void loadLiveOrders()}
      />
    );
  }

  return (
    <>
      <PageHeader
        title={t("My Orders")}
        subtitle={t("Live backend orders: stock changes only after the seller confirms.")}
        breadcrumb={[t("Buyer"), t("Orders")]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void loadLiveOrders()}>
              {t("Refresh")}
            </Button>
            <Link to="/app/$" params={{ _splat: "buyer/marketplace" }}>
              <Button variant="outline" className="gap-2">
                <ShoppingBag className="size-4" /> {t("Marketplace")}
              </Button>
            </Link>
          </div>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["All", ...BACKEND_ORDER_STATUSES] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={status === f ? "default" : "outline"}
            className="h-8 rounded-full text-xs"
            onClick={() => setStatus(f)}
          >
            {f === "All" ? t("All") : t(orderStatusLabel(f))}
          </Button>
        ))}
        <Input
          className="w-52"
          placeholder={t("Search orders...")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {liveLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("Loading orders...")}
        </div>
      ) : liveError ? (
        <EmptyState
          icon={Receipt}
          title={t("Could not load orders")}
          desc={liveError}
          action={<Button onClick={() => void loadLiveOrders()}>{t("Retry")}</Button>}
        />
      ) : liveFiltered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={t("No live orders found.")}
          desc={t("Place an order from the Marketplace and it will appear here.")}
          action={
            <Link to="/app/$" params={{ _splat: "buyer/marketplace" }}>
              <Button>{t("Browse Marketplace")}</Button>
            </Link>
          }
        />
      ) : (
        <SectionCard title={t("Order History")}>
          <div className="mb-3">
            <Badge variant="outline">
              {t("Mock orders are hidden here; only live backend orders are shown.")}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Order ID")}</TableHead>
                  <TableHead>{t("Seller")}</TableHead>
                  <TableHead>{t("Products")}</TableHead>
                  <TableHead>{t("Quantity")}</TableHead>
                  <TableHead>{t("Total")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead>{t("Created Date")}</TableHead>
                  <TableHead className="text-right">{t("Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveFiltered.map((o) => {
                  const sellerName =
                    o.items[0]?.seller?.sellerProfile?.businessName?.trim() ||
                    o.items[0]?.seller?.name ||
                    "—";
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">#{o.id}</TableCell>
                      <TableCell>{sellerName}</TableCell>
                      <TableCell>{o.items.map((i) => i.productName).join(", ")}</TableCell>
                      <TableCell>
                        {o.items.map((i) => `${i.quantity} ${t(i.unit)}`).join(", ")}
                      </TableCell>
                      <TableCell className="font-semibold text-forest">
                        {inr(o.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{t(orderStatusLabel(o.status))}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate({
                                to: "/app/$",
                                params: { _splat: `buyer/orders/${o.id}` },
                              })
                            }
                          >
                            {t("View")}
                          </Button>
                          {o.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={cancellingId === o.id}
                              onClick={() => void cancelLiveOrder(o.id)}
                            >
                              {cancellingId === o.id && (
                                <Loader2 className="size-3.5 animate-spin" />
                              )}
                              {t("Cancel Order")}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
    </>
  );
}

function BuyerLiveOrderDetail({
  orderId,
  onBack,
  onChanged,
}: {
  orderId: string;
  onBack: () => void;
  onChanged: () => void;
}) {
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const id = Number(orderId);

  const load = useCallback(async () => {
    if (!Number.isInteger(id) || id <= 0) {
      setError(t("Invalid order id."));
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      setOrder(await fetchBuyerOrderById(id));
    } catch (err: unknown) {
      setError(friendlyOrderError(err, t("Could not load order.")));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function cancel() {
    if (!order) return;
    try {
      setCancelling(true);
      await cancelMyOrder(order.id);
      toast.success(t("Order cancelled successfully"));
      onChanged();
      await load();
    } catch (err: unknown) {
      toast.error(friendlyOrderError(err, t("Could not cancel order.")));
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <Button variant="ghost" className="mb-3 gap-1.5" onClick={onBack}>
        <ArrowLeft className="size-4" /> {t("Back to My Orders")}
      </Button>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("Loading order...")}
        </div>
      ) : error || !order ? (
        <EmptyState
          icon={Receipt}
          title={t("Order not found")}
          desc={error || t("This order does not exist or belongs to another buyer.")}
          action={<Button onClick={onBack}>{t("Back to My Orders")}</Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard title={`${t("Order")} #${order.id}`} className="lg:col-span-2">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{t(orderStatusLabel(order.status))}</Badge>
              <span className="text-xs text-muted-foreground">
                {t("Created")}: {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Product")}</TableHead>
                  <TableHead>{t("Seller")}</TableHead>
                  <TableHead>{t("Quantity")}</TableHead>
                  <TableHead>{t("Unit Price")}</TableHead>
                  <TableHead>{t("Subtotal")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.productName}</TableCell>
                    <TableCell>
                      {i.seller?.sellerProfile?.businessName?.trim() || i.seller?.name || "—"}
                    </TableCell>
                    <TableCell>
                      {i.quantity} {t(i.unit)}
                    </TableCell>
                    <TableCell>
                      {inr(i.unitPrice)}/{t(i.unit)}
                    </TableCell>
                    <TableCell className="font-semibold">{inr(i.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-3 flex justify-end text-sm">
              <span className="text-muted-foreground">{t("Total")}:&nbsp;</span>
              <span className="font-bold text-forest">{inr(order.totalAmount)}</span>
            </div>
          </SectionCard>
          <SectionCard title={t("Actions")}>
            <div className="grid gap-2 text-sm">
              <Row label={t("Status")} value={t(orderStatusLabel(order.status))} />
              <Row label={t("Total")} value={inr(order.totalAmount)} />
              {order.status === "PENDING" ? (
                <Button variant="destructive" disabled={cancelling} onClick={() => void cancel()}>
                  {cancelling && <Loader2 className="size-4 animate-spin" />}
                  {t("Cancel Order")}
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("Only PENDING orders can be cancelled by the buyer.")}
                </p>
              )}
              <Button variant="outline" onClick={onBack}>
                {t("Back to My Orders")}
              </Button>
            </div>
          </SectionCard>
        </div>
      )}
    </>
  );
}

function OrderDetailView({
  order,
  onCancel,
  confirmCancel,
  closeCancel,
  doCancel,
}: {
  order: Order;
  onCancel: () => void;
  confirmCancel: Order | null;
  closeCancel: () => void;
  doCancel: () => void;
}) {
  const item = order.items[0]!;
  const profile = sellerOf(order.seller);
  return (
    <>
      <PageHeader
        title={`${t("Order Details")} — ${order.id}`}
        breadcrumb={[t("Buyer"), t("Orders"), order.id]}
        action={
          <Link to="/app/$" params={{ _splat: "buyer/orders" }}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" /> {t("My Orders")}
            </Button>
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title={t("Order Summary")} className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Row label={t("Product")} value={t(item.name)} />
            <Row label={t("Seller")} value={order.seller} />
            <Row label={t("Seller Phone")} value={profile?.phone ?? order.mobile} />
            <Row label={t("Quantity")} value={`${item.qty} ${t(item.unit)}`} />
            <Row label={t("Unit Price")} value={unitPrice(item.price, item.unit)} />
            <Row label={t("Total")} value={inr(order.total)} />
            <Row label={t("Payment Method")} value={t(order.payment)} />
            <Row label={t("Delivery Method")} value={t(order.fulfilment)} />
            <Row label={t("Order Status")} value={t(order.status)} />
          </dl>
          <p className="mt-3 text-sm text-muted-foreground">{order.address}</p>
        </SectionCard>
        <SectionCard title={t("Order Timeline")}>
          {ORDER_FLOW.map((s, i) => (
            <p
              key={s}
              className={`text-sm ${ORDER_FLOW.indexOf(order.status) >= i ? "font-medium text-forest" : "text-muted-foreground"}`}
            >
              {ORDER_FLOW.indexOf(order.status) >= i ? "●" : "○"}{" "}
              {t(s === "New" ? "Order Placed" : s)}
            </p>
          ))}
          {(order.status === "New" || order.status === "Confirmed") && (
            <Button variant="destructive" className="mt-3" onClick={onCancel}>
              {t("Cancel Order")}
            </Button>
          )}
        </SectionCard>
      </div>
      <Dialog open={!!confirmCancel} onOpenChange={closeCancel}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Cancel Order")}</DialogTitle>
            <DialogDescription>
              {t("Are you sure you want to cancel this order?")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeCancel}>
              {t("Keep Order")}
            </Button>
            <Button variant="destructive" onClick={doCancel}>
              {t("Cancel Order")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------------------------------------------------ saved */

export function SavedProductsPage() {
  const { products, savedListings, toggleSavedListing } = useStore();
  const saved = products.filter((p) => savedListings.includes(p.id));
  const [buy, setBuy] = useState<Product | null>(null);

  return (
    <>
      <PageHeader
        title={t("Saved Products")}
        subtitle={t("Produce you shortlisted for later.")}
        breadcrumb={[t("Buyer"), t("Saved Products")]}
      />
      {saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={t("No saved products yet.")}
          desc={t("Tap the heart icon on any produce to save it here.")}
          action={
            <Link to="/app/$" params={{ _splat: "buyer/marketplace" }}>
              <Button>{t("Browse Marketplace")}</Button>
            </Link>
          }
        />
      ) : (
        <SectionCard title={`${saved.length} ${t("Saved Products")}`}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Product")}</TableHead>
                  <TableHead>{t("Seller")}</TableHead>
                  <TableHead>{t("Location")}</TableHead>
                  <TableHead>{t("Available Quantity")}</TableHead>
                  <TableHead>{t("Seller Price")}</TableHead>
                  <TableHead>{t("Market Price")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead className="text-right">{t("Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saved.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{t(p.name)}</TableCell>
                    <TableCell>{p.seller}</TableCell>
                    <TableCell className="text-muted-foreground">{t(p.location)}</TableCell>
                    <TableCell>
                      {p.stock} {t(p.unit)}
                    </TableCell>
                    <TableCell className="font-semibold text-forest">
                      {unitPrice(p.price, p.unit)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {unitPrice(p.marketPrice, p.unit)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.stock > 0 ? "Available" : "Sold Out"} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to="/app/$" params={{ _splat: `buyer/marketplace/${p.id}` }}>
                          <Button size="sm" variant="outline">
                            {t("View")}
                          </Button>
                        </Link>
                        <Button size="sm" disabled={p.stock <= 0} onClick={() => setBuy(p)}>
                          {t("Buy Now")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => {
                            toggleSavedListing(p.id);
                            toast.success(t("Removed from saved"));
                          }}
                        >
                          {t("Remove")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
      <BuyNowDialog product={buy} onClose={() => setBuy(null)} />
    </>
  );
}

/* ------------------------------------------------------------------ sellers */

export function BuyerSellersPage() {
  const { products } = useStore();
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("All");
  const [crop, setCrop] = useState("All");
  const [rating, setRating] = useState("All");
  const [contact, setContact] = useState<Product | null>(null);

  const districts = [...new Set(SELLER_PROFILES.map((f) => f.district))];
  const crops = [...new Set(SELLER_PROFILES.flatMap((f) => f.crops))];
  const list = SELLER_PROFILES.filter(
    (f) =>
      `${f.name} ${f.village} ${f.district} ${f.crops.join(" ")}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (district === "All" || f.district === district) &&
      (crop === "All" || f.crops.includes(crop)) &&
      (rating === "All" || f.rating >= Number(rating)),
  );

  return (
    <>
      <PageHeader
        title={t("Sellers")}
        subtitle={t("Find sellers selling fresh agricultural produce.")}
        breadcrumb={[t("Buyer"), t("Sellers")]}
      />
      <Card className="gap-0 p-4">
        <div className="grid gap-3 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search sellers...")}
              className="pl-9"
            />
          </div>
          <Pick
            value={district}
            onChange={setDistrict}
            options={["All", ...districts]}
            label={t("District")}
          />
          <Pick value={crop} onChange={setCrop} options={["All", ...crops]} label={t("Products")} />
          <Pick
            value={rating}
            onChange={setRating}
            options={["All", "4.5", "4", "3"]}
            label={t("Rating")}
          />
        </div>
      </Card>

      {list.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Users}
            title={t("No sellers found")}
            desc={t("Try a different keyword or district.")}
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((f) => {
            const listings = products.filter((p) => p.seller === f.name && p.active);
            return (
              <Card key={f.id} className="gap-0 p-5">
                <div className="flex items-center gap-3">
                  <img src={f.image} alt={f.name} className="size-12 rounded-full object-cover" />
                  <div>
                    <p className="flex items-center gap-1.5 font-semibold">
                      {f.name} {f.verified && <BadgeCheck className="size-4 text-primary" />}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(f.village)}, {t(f.district)}
                    </p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-sm">
                    <Star className="size-4 fill-harvest text-harvest" /> {f.rating}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {t("Produces")}: {f.crops.map((c) => t(c)).join(", ")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {listings.length} {t("Active Listings")}
                </p>
                {f.verified && (
                  <Badge variant="secondary" className="mt-2 w-fit rounded-full">
                    {t("Verified Seller")}
                  </Badge>
                )}
                <div className="mt-4 flex gap-2">
                  <Link to="/app/$" params={{ _splat: `buyer/sellers/${f.id}` }} className="flex-1">
                    <Button variant="outline" className="w-full">
                      {t("View Seller")}
                    </Button>
                  </Link>
                  <Button
                    className="flex-1"
                    disabled={listings.length === 0}
                    onClick={() => setContact(listings[0] ?? null)}
                  >
                    {t("Contact Seller")}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <ContactSellerDialog product={contact} onClose={() => setContact(null)} />
    </>
  );
}

export function BuyerSellerDetail({ sellerId }: { sellerId: string }) {
  const { products, reviews } = useStore();
  const profile = SELLER_PROFILES.find((f) => f.id === sellerId);
  const [buy, setBuy] = useState<Product | null>(null);
  const [contact, setContact] = useState<Product | null>(null);

  if (!profile) {
    return (
      <>
        <PageHeader title={t("Seller Profile")} breadcrumb={[t("Buyer"), t("Sellers")]} />
        <EmptyState
          icon={Users}
          title={t("No sellers found")}
          desc={t("This seller profile is not available.")}
          action={
            <Link to="/app/$" params={{ _splat: "buyer/sellers" }}>
              <Button>{t("Sellers")}</Button>
            </Link>
          }
        />
      </>
    );
  }

  const listings = products.filter((p) => p.seller === profile.name && p.active);
  const sellerReviews = reviews.filter((r) => r.seller === profile.name);

  return (
    <>
      <PageHeader
        title={profile.name}
        subtitle={`${t(profile.village)}, ${t(profile.district)}`}
        breadcrumb={[t("Buyer"), t("Sellers"), profile.name]}
        action={
          <Link to="/app/$" params={{ _splat: "buyer/sellers" }}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" /> {t("Sellers")}
            </Button>
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title={t("Seller Profile")}>
          <img
            src={profile.image}
            alt={profile.name}
            className="h-32 w-full rounded-xl object-cover"
          />
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Row label={t("Location")} value={`${t(profile.village)}, ${t(profile.district)}`} />
            <Row label={t("Business Name")} value={profile.business} />
            <Row label={t("Rating")} value={`★ ${profile.rating}`} />
            <Row label={t("Active Listings")} value={String(listings.length)} />
            <Row
              label={t("Verification")}
              value={profile.verified ? t("Verified Seller") : t("Pending")}
            />
            <Row label={t("Phone")} value={profile.phone} />
          </dl>
          <p className="mt-3 text-sm text-muted-foreground">{t(profile.about)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("Main Crops")}: {profile.crops.map((c) => t(c)).join(", ")}
          </p>
          <Button
            className="mt-3 w-full gap-2"
            disabled={listings.length === 0}
            onClick={() => setContact(listings[0] ?? null)}
          >
            <MessageSquare className="size-4" /> {t("Contact Seller")}
          </Button>
        </SectionCard>

        <div className="space-y-4 lg:col-span-2">
          <SectionCard title={t("Products Available")}>
            {listings.length === 0 ? (
              <EmptyState
                icon={Package}
                title={t("No produce found.")}
                desc={t("This seller has no active listings right now.")}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {listings.map((p) => (
                  <ProduceCard key={p.id} product={p} onBuy={() => setBuy(p)} compact />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title={t("Reviews")}>
            {sellerReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("No reviews yet.")}</p>
            ) : (
              <div className="space-y-3">
                {sellerReviews.map((r) => (
                  <div key={r.id} className="rounded-xl border p-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium">{r.buyer}</span>
                      <Badge variant="secondary">{t(r.product)}</Badge>
                      <span className="ml-auto flex items-center gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="size-3.5 fill-harvest text-harvest" />
                        ))}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t(r.text)}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      <BuyNowDialog product={buy} onClose={() => setBuy(null)} />
      <ContactSellerDialog product={contact} onClose={() => setContact(null)} />
    </>
  );
}

/* ------------------------------------------------------------------ messages */

export function BuyerMessagesPage() {
  const { enquiries, replyEnquiry } = useStore();
  const mine = enquiries.filter((e) => e.buyer === BUYER);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <>
      <PageHeader
        title={t("Messages / Enquiries")}
        subtitle={t("Your conversations with sellers.")}
        breadcrumb={[t("Buyer"), t("Messages")]}
      />
      {mine.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={t("No enquiries yet.")}
          desc={t("Contact a seller from the marketplace to start a conversation.")}
          action={
            <Link to="/app/$" params={{ _splat: "buyer/marketplace" }}>
              <Button>{t("Browse Marketplace")}</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {mine.map((e) => (
            <Card key={e.id} className="gap-0 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{e.seller}</span>
                <Badge variant="secondary">{t(e.product)}</Badge>
                <span className="ml-auto text-xs text-muted-foreground">{t(e.time)}</span>
              </div>
              <div className="mt-2 space-y-2">
                {e.messages.map((m, i) => (
                  <p
                    key={i}
                    className={`rounded-xl p-3 text-sm ${m.from === "buyer" ? "bg-pale/60" : "bg-muted"}`}
                  >
                    <b>{m.from === "buyer" ? t("You") : e.seller}:</b> {t(m.text)}
                  </p>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  maxLength={300}
                  value={drafts[e.id] ?? ""}
                  onChange={(ev) => setDrafts({ ...drafts, [e.id]: ev.target.value })}
                  placeholder={t("Type your message")}
                  aria-label={`Message ${e.seller}`}
                />
                <Button
                  onClick={() => {
                    const text = (drafts[e.id] ?? "").trim();
                    if (!text) {
                      toast.error(t("Type your message"));
                      return;
                    }
                    replyEnquiry(e.id, "buyer", text);
                    setDrafts({ ...drafts, [e.id]: "" });
                    toast.success(t("Message sent"));
                  }}
                >
                  {t("Send")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ market prices */

export function BuyerMarketPricesPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [district, setDistrict] = useState("All");

  const districts = [...new Set(MARKET_PRICE_BOARD.map((m) => m.district))];
  const rows = MARKET_PRICE_BOARD.filter(
    (m) =>
      m.product.toLowerCase().includes(q.toLowerCase()) &&
      (cat === "All" || m.category === cat) &&
      (district === "All" || m.district === district),
  );

  return (
    <>
      <PageHeader
        title={t("Market Prices")}
        subtitle={t("Compare today's mandi rates before buying produce.")}
        breadcrumb={[t("Buyer"), t("Market Prices")]}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={TrendingUp}
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
          icon={IndianRupee}
          label={t("Prices Updated Today")}
          value={MARKET_PRICE_BOARD.length}
          tone="harvest"
        />
        <StatCard
          icon={Package}
          label={t("Buy Directly")}
          value={t("From Sellers")}
          tone="forest"
        />
      </div>

      <Card className="mt-4 gap-0 p-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search crop or vegetable...")}
              className="pl-9"
            />
          </div>
          <Pick
            value={cat}
            onChange={setCat}
            options={["All", ...PRODUCE_CATEGORIES]}
            label={t("Category")}
          />
          <Pick
            value={district}
            onChange={setDistrict}
            options={["All", ...districts]}
            label={t("District")}
          />
        </div>
      </Card>

      <SectionCard title={t("Today's Mandi Rates")} className="mt-4">
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
                <TableHead>{t("Trend")}</TableHead>
                <TableHead>{t("Last Updated")}</TableHead>
                <TableHead className="text-right">{t("Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.id}>
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
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate({
                          to: "/app/$",
                          params: { _splat: "buyer/marketplace" },
                          search: { use: m.product },
                        })
                      }
                    >
                      {t("View Available Produce")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {rows.length === 0 && (
          <EmptyState
            icon={TrendingUp}
            title={t("No market prices found")}
            desc={t("Try a different crop or district.")}
          />
        )}
      </SectionCard>
    </>
  );
}
