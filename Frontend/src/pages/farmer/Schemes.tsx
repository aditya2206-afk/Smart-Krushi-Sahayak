import { useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import {
  Bookmark,
  ExternalLink,
  Landmark,
  List,
  Map as MapIcon,
  MapPin,
  Navigation,
  Phone,
  Search,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { EmptyState, PageHeader, SectionCard } from "@/components/skl/common";
import { useStore } from "@/lib/skl/store";
import { INPUT_PRODUCTS, SCHEMES, SERVICES } from "@/lib/skl/data";
import { t } from "@/lib/skl/i18n";

const FILTERS = [
  "All",
  "Central Government",
  "Maharashtra Government",
  "Crop",
  "Farmer Category",
  "Subsidy",
  "Insurance",
  "Loan",
  "Equipment",
];

export function SchemesPage() {
  const { savedSchemes, toggleScheme } = useStore();
  const [f, setF] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<(typeof SCHEMES)[number] | null>(null);

  const list = SCHEMES.filter(
    (s) =>
      (f === "All" || s.gov === f || s.category === f) &&
      (s.name + s.desc + s.benefit).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title={t("Government Schemes")}
        subtitle={t("Central and Maharashtra schemes with eligibility, benefits and deadlines.")}
        breadcrumb={["Dashboard", "Government Schemes"]}
      />
      <Card className="mb-4 gap-0 p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Search schemes")}
            className="pl-9"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((x) => (
            <Button
              key={x}
              size="sm"
              variant={f === x ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setF(x)}
            >
              {x}
            </Button>
          ))}
        </div>
      </Card>

      {list.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title={t("No schemes found")}
          desc={t("Try a different filter or keyword.")}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((s) => (
            <Card key={s.id} className="hover-lift gap-0 p-5">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="secondary">{s.gov}</Badge>
                <button
                  onClick={() => {
                    toggleScheme(s.id);
                    toast.success(
                      savedSchemes.includes(s.id) ? "Removed from saved" : "Scheme saved",
                    );
                  }}
                  aria-label={t("Save scheme")}
                >
                  <Bookmark
                    className={`size-4 ${savedSchemes.includes(s.id) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                </button>
              </div>
              <h3 className="mt-3 font-semibold">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(s.desc)}</p>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div>
                  <dt className="inline text-xs text-muted-foreground">{t("Eligibility:")} </dt>
                  <dd className="inline">{s.eligibility}</dd>
                </div>
                <div>
                  <dt className="inline text-xs text-muted-foreground">{t("Benefit:")} </dt>
                  <dd className="inline font-medium text-forest">{s.benefit}</dd>
                </div>
                <div>
                  <dt className="inline text-xs text-muted-foreground">{t("Deadline:")} </dt>
                  <dd className="inline">{s.deadline}</dd>
                </div>
              </dl>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpen(s)}>
                  {t("Learn More")}
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    toggleScheme(s.id);
                    toast.success("Saved to your schemes");
                  }}
                >
                  {savedSchemes.includes(s.id) ? "Saved" : "Save Scheme"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{open?.name}</DialogTitle>
          </DialogHeader>
          {open && (
            <div className="space-y-3 text-sm">
              <Badge variant="secondary">
                {open.gov} • {open.category}
              </Badge>
              <p>{t(open.desc)}</p>
              <p>
                <b>{t("Eligibility:")}</b> {open.eligibility}
              </p>
              <p>
                <b>{t("Benefit:")}</b> {open.benefit}
              </p>
              <p>
                <b>{t("Required documents:")}</b>{" "}
                {t("Aadhaar, 7/12 extract, bank passbook, passport photo.")}
              </p>
              <p>
                <b>{t("Application deadline:")}</b> {open.deadline}
              </p>
              <Button
                className="w-full gap-2"
                onClick={() => toast.info("Official portal link opens in the live version.")}
              >
                <ExternalLink className="size-4" /> {t("Apply on Official Portal")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

const CATS = [
  "All",
  "Krushi Seva Kendra",
  "Soil Testing Lab",
  "Seed Store",
  "Fertilizer Store",
  "Pesticide Store",
  "Agriculture Office",
  "Equipment Rental",
];

const RADII: { label: string; km: number }[] = [
  { label: "3 km", km: 3 },
  { label: "5 km", km: 5 },
  { label: "10 km", km: 10 },
  { label: "All", km: Infinity },
];

const FARMER_LOCATION = "Akluj, Solapur";

export function ServicesPage() {
  const search = useSearch({ from: "/app/$" }) as { use?: string };
  const wanted = INPUT_PRODUCTS.find((p) => p.id === search.use);
  const [cat, setCat] = useState("All");
  const [radius, setRadius] = useState(5);
  const [sq, setSq] = useState("");
  const [stockOnly, setStockOnly] = useState(!!wanted);

  const stockingIds = wanted
    ? INPUT_PRODUCTS.filter((p) => p.id === wanted.id || p.category === wanted.category).map(
        (p) => p.kendraId,
      )
    : [];

  const km = (s: (typeof SERVICES)[number]) => parseFloat(s.distance) || 0;

  const list = SERVICES.filter(
    (s) =>
      (cat === "All" || s.category === cat) &&
      km(s) <= radius &&
      (s.name + s.category + s.address).toLowerCase().includes(sq.trim().toLowerCase()) &&
      (!wanted || !stockOnly || stockingIds.includes(s.id)),
  ).sort((a, b) => km(a) - km(b));

  const verifiedCount = list.filter((s) => s.status === "Active").length;
  const radiusLabel = RADII.find((r) => r.km === radius)?.label ?? "5 km";

  return (
    <>
      <PageHeader
        title={t("Nearby Agriculture Services")}
        subtitle={t("Krushi Seva Kendras, soil labs, stores and offices around Akluj, Solapur.")}
        breadcrumb={["Dashboard", "Nearby Services"]}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1.5 text-xs">
          <MapPin className="size-3.5" />
          {radius === Infinity
            ? `${t("Showing all services near")} ${FARMER_LOCATION}`
            : `${t("Showing services within")} ${radiusLabel} ${t("of")} ${FARMER_LOCATION}`}
        </Badge>
        <Badge className="rounded-full px-3 py-1.5 text-xs">
          {verifiedCount} {verifiedCount === 1 ? t("Store Available") : t("Stores Available")}
        </Badge>
      </div>

      {wanted && (
        <Card className="mb-4 gap-0 border-primary/40 bg-pale/60 p-4">
          <p className="text-sm">
            {t("Showing Kendras that stock")} <strong>{wanted.name}</strong> ({wanted.packSize}) —{" "}
            {t("prescribed by your Krushi Adhikari")}.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={stockOnly ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setStockOnly((v) => !v)}
            >
              {stockOnly ? t("Showing in-stock Kendras only") : t("Show in-stock Kendras only")}
            </Button>
          </div>
        </Card>
      )}
      <Card className="mb-4 gap-0 p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={sq}
            onChange={(e) => setSq(e.target.value)}
            placeholder={t("Search stores and services")}
            className="pl-9"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{t("Distance")}:</span>
          {RADII.map((r) => (
            <Button
              key={r.label}
              size="sm"
              variant={radius === r.km ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setRadius(r.km)}
            >
              {t(r.label)}
            </Button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={cat === c ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setCat(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </Card>

      {list.length === 0 ? (
        <Card className="gap-0 p-8 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-pale text-forest">
            <MapPin className="size-6" />
          </div>
          <h3 className="mt-3 font-semibold">
            {t("No verified stores within")} {radiusLabel}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("We could not find any service near")} {FARMER_LOCATION}.{" "}
            {t("Try a wider distance or a different category.")}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={() => setRadius(10)}>
              {t("Expand search to 10 km")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setRadius(Infinity);
                setCat("All");
                setSq("");
              }}
            >
              {t("Show all services")}
            </Button>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="map">
          <TabsList>
            <TabsTrigger value="map" className="gap-1.5">
              <MapIcon className="size-4" /> {t("Map")}
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1.5">
              <List className="size-4" /> {t("List")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-4">
            <Card className="gap-0 overflow-hidden p-0">
              <div
                className="relative h-[26rem] w-full"
                style={{
                  backgroundImage:
                    "linear-gradient(0deg, rgba(46,125,50,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(46,125,50,0.08) 1px, transparent 1px), linear-gradient(160deg, var(--color-pale), var(--color-background))",
                  backgroundSize: "40px 40px, 40px 40px, 100% 100%",
                }}
              >
                <span className="absolute top-4 left-4 rounded-full bg-card px-3 py-1.5 text-xs shadow-soft">
                  Demo map • Akluj, Solapur (live map API not connected)
                </span>
                {list.map((s, i) => (
                  <div
                    key={s.id}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${15 + ((i * 13) % 70)}%`, top: `${25 + ((i * 17) % 55)}%` }}
                  >
                    <div className="flex flex-col items-center">
                      <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift">
                        📍
                      </span>
                      <span className="mt-1 max-w-[9rem] truncate rounded-full bg-card px-2 py-0.5 text-[10px] shadow-soft">
                        {s.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {list.map((s) => (
                <Card key={s.id} className="hover-lift gap-0 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{s.name}</h3>
                      <p className="text-xs text-muted-foreground">{s.category}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {s.distance} away
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{s.address}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm">
                    <Star className="size-3.5 fill-harvest text-harvest" /> {s.rating} • Open:{" "}
                    {s.hours}
                  </p>
                  {wanted && stockingIds.includes(s.id) && (
                    <Badge className="mt-3 w-fit rounded-full">
                      {wanted.name} • {t("In stock")}
                    </Badge>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5"
                      onClick={() => toast.info(`Directions to ${s.name} (demo)`)}
                    >
                      <Navigation className="size-3.5" /> {t("Directions")}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => toast.info(`${t("Calling")} ${s.name} • ${s.phone}`)}
                    >
                      <Phone className="size-3.5" /> {t("Call Store")}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <SectionCard title={t("Service Availability")} className="mt-4">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ["Krushi Seva Kendras", 12],
            ["Soil Testing Labs", 3],
            ["Seed & Fertilizer Stores", 21],
            ["Agriculture Offices", 5],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-xl bg-pale/60 p-4">
              <p className="text-xs text-muted-foreground">{k}</p>
              <p className="text-lg font-bold text-forest">{v} nearby</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
