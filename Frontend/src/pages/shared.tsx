import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BellOff,
  Bookmark,
  BookOpen,
  Bug,
  CheckCheck,
  CloudRain,
  CloudSun,
  Droplets,
  FlaskConical,
  Gauge,
  Landmark,
  Search,
  ShoppingBag,
  Sunrise,
  Sunset,
  Sun,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { EmptyState, PageHeader, SectionCard, StatusBadge } from "@/components/skl/common";
import { useStore } from "@/lib/skl/store";
import {
  ARTICLES,
  FERTILIZERS,
  PESTICIDES,
  WEATHER,
  type Role,
  certProgress,
  officerVerification,
} from "@/lib/skl/data";
import { LANGS, t } from "@/lib/skl/i18n";

const typeIcon: Record<string, string> = {
  chat: "💬",
  weather: "🌦",
  scheme: "🏛",
  order: "🛒",
  announcement: "📢",
};

const NOTIFICATION_TARGET: Record<string, Partial<Record<Role, string>>> = {
  order: { seller: "seller/orders", buyer: "buyer/orders", admin: "admin/orders" },
  chat: {
    farmer: "farmer/questions",
    seller: "seller/enquiries",
    officer: "officer/queries",
    buyer: "buyer/messages",
  },
  weather: {
    farmer: "farmer/weather",
    seller: "seller/market-prices",
    officer: "officer/weather",
    buyer: "buyer/market-prices",
    admin: "admin/weather",
  },
  scheme: { farmer: "farmer/schemes", admin: "admin/schemes" },
  announcement: {
    farmer: "farmer/dashboard",
    seller: "seller/dashboard",
    officer: "officer/queries",
    buyer: "buyer/dashboard",
    admin: "admin/dashboard",
  },
};

export function NotificationsPage({ role }: { role: Role }) {
  const { notifications, markRead, markAllRead } = useStore();
  const navigate = useNavigate();
  const list = notifications.filter((n) => n.role === role);
  const openNotification = (id: string, type: string) => {
    markRead(id);
    const target = NOTIFICATION_TARGET[type]?.[role] ?? `${role}/dashboard`;
    navigate({ to: "/app/$", params: { _splat: target } });
  };
  return (
    <>
      <PageHeader
        title={t("Notifications")}
        subtitle={t("Query replies, weather alerts, scheme updates and order activity.")}
        breadcrumb={["Dashboard", "Notifications"]}
        action={
          <Button variant="outline" onClick={() => markAllRead(role)} className="gap-2">
            <CheckCheck className="size-4" /> {t("Mark all as read")}
          </Button>
        }
      />
      {list.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={t("No notifications yet")}
          desc={t("Platform updates will appear here.")}
        />
      ) : (
        <div className="space-y-3">
          {list.map((n) => (
            <Card
              key={n.id}
              onClick={() => openNotification(n.id, n.type)}
              className={`hover-lift cursor-pointer gap-0 p-4 ${n.read ? "" : "border-primary/30 bg-pale/40"}`}
            >
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-pale text-lg">
                  {typeIcon[n.type]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{t(n.title)}</p>
                    {!n.read && <Badge className="rounded-full text-[10px]">{t("New")}</Badge>}
                    <span className="ml-auto text-xs text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t(n.body)}</p>
                </div>
                {!n.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      markRead(n.id);
                    }}
                  >
                    {t("Mark as read")}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export function SettingsPage() {
  const { lang, setLang } = useStore();
  return (
    <>
      <PageHeader
        title={t("Settings")}
        subtitle={t("Language, notifications, privacy and security preferences.")}
        breadcrumb={["Dashboard", "Settings"]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title={t("Language")}
          desc={t("Applies across navigation and content labels.")}
        >
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <Button
                key={l.code}
                variant={lang === l.code ? "default" : "outline"}
                onClick={() => setLang(l.code)}
              >
                {t(l.label)}
              </Button>
            ))}
          </div>
        </SectionCard>
        <SectionCard
          title={t("Notification Preferences")}
          desc={t("Choose what you want to be alerted about.")}
        >
          <div className="space-y-4">
            {[
              "Expert replies",
              "Weather alerts",
              "Scheme updates",
              "Order updates",
              "Platform announcements",
            ].map((x, i) => (
              <div key={x} className="flex items-center justify-between">
                <Label className="text-sm font-normal">{x}</Label>
                <Switch defaultChecked={i < 4} />
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title={t("Password & Security")} desc={t("Keep your account secure.")}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Password updated successfully");
            }}
          >
            <div>
              <Label>{t("Current Password")}</Label>
              <Input type="password" className="mt-1.5" maxLength={64} />
            </div>
            <div>
              <Label>{t("New Password")}</Label>
              <Input type="password" className="mt-1.5" maxLength={64} />
            </div>
            <Button type="submit">{t("Update Password")}</Button>
          </form>
        </SectionCard>
        <SectionCard
          title={t("Accessibility")}
          desc={t("Make the app easier to use in the field.")}
        >
          <div className="space-y-4">
            {["Large text mode", "High contrast", "Voice guidance", "Data saver"].map((x, i) => (
              <div key={x} className="flex items-center justify-between">
                <Label className="text-sm font-normal">{x}</Label>
                <Switch defaultChecked={i === 0} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

export function WeatherPage() {
  const w = WEATHER;
  const cards = [
    { icon: Droplets, label: "Humidity", value: `${w.humidity}%` },
    { icon: Wind, label: "Wind", value: `${w.wind} km/h` },
    { icon: CloudRain, label: "Rain Probability", value: `${w.rain}%` },
    { icon: Gauge, label: "UV Index", value: `${w.uv} (Moderate)` },
    { icon: Sunrise, label: "Sunrise", value: w.sunrise },
    { icon: Sunset, label: "Sunset", value: w.sunset },
  ];
  return (
    <>
      <PageHeader
        title={t("Weather Forecast")}
        subtitle={w.location}
        breadcrumb={["Dashboard", "Weather"]}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="brand-gradient gap-0 p-6 text-primary-foreground lg:col-span-1">
          <p className="text-sm text-white/80">{w.location}</p>
          <div className="mt-3 flex items-center gap-3">
            <CloudSun className="size-14" />
            <div>
              <p className="text-5xl font-bold">{w.temp}°C</p>
              <p className="text-sm text-white/85">{w.condition}</p>
            </div>
          </div>
          <p className="mt-6 text-xs text-white/75">
            {t("Updated just now \u2022 Demo weather service")}
          </p>
        </Card>
        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
          {cards.map((c) => (
            <Card key={t(c.label)} className="gap-0 p-4">
              <c.icon className="size-5 text-primary" />
              <p className="mt-2 text-xs text-muted-foreground">{t(c.label)}</p>
              <p className="font-semibold">{c.value}</p>
            </Card>
          ))}
        </div>
      </div>

      <SectionCard title={t("7-Day Forecast")} className="mt-4">
        <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {w.forecast.map((f) => (
            <div key={f.day} className="rounded-xl border bg-card p-3 text-center">
              <p className="text-sm font-semibold">{f.day}</p>
              {f.rain > 50 ? (
                <CloudRain className="mx-auto my-2 size-6 text-primary" />
              ) : f.rain > 20 ? (
                <CloudSun className="mx-auto my-2 size-6 text-harvest" />
              ) : (
                <Sun className="mx-auto my-2 size-6 text-harvest" />
              )}
              <p className="text-sm font-bold">{f.temp}°</p>
              <p className="text-xs text-muted-foreground">
                {f.min}° • {f.rain}%
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 border-warning/40 bg-warning/10 p-5">
          <p className="font-semibold text-warning">{t("\u26a0 Farming Advisory")}</p>
          <p className="mt-2 text-sm">
            {t(
              "Rain is expected tomorrow evening. Avoid pesticide spraying during the next 24 hours and\n            postpone urea top dressing until the field drains.",
            )}
          </p>
        </Card>
        <SectionCard title={t("Crop-specific Recommendations")}>
          <ul className="space-y-3 text-sm">
            <li>
              🌱 <b>{t("Soybean:")}</b> Check for waterlogging in low areas; delay foliar spray by 2
              days.
            </li>
            <li>
              🌿 <b>{t("Cotton:")}</b>{" "}
              {t("Install pheromone traps before rainfall to monitor pink bollworm.")}
            </li>
            <li>
              🧅 <b>{t("Onion:")}</b>{" "}
              {t(
                "High humidity increases purple blotch risk \u2014 plan a protective spray after rain.",
              )}
            </li>
          </ul>
        </SectionCard>
      </div>
    </>
  );
}

export function PesticidesPage() {
  const [q, setQ] = useState("");
  const list = PESTICIDES.filter((p) =>
    (p.name + p.target + p.crops).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title={t("Pesticides")}
        subtitle={t("Approved pesticide options with dose and safety precautions.")}
        breadcrumb={["Dashboard", "Pesticides"]}
      />
      <Card className="mb-4 gap-0 p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Search pesticide, pest or crop")}
            className="pl-9"
          />
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((p) => (
          <Card key={p.name} className="hover-lift gap-0 p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-10 place-items-center rounded-xl bg-pale text-primary">
                <Bug className="size-5" />
              </span>
              <h3 className="font-semibold">{p.name}</h3>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">{t("Target")}</dt>
                <dd>{p.target}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Dose")}</dt>
                <dd className="font-medium text-forest">{p.dose}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Suitable crops")}</dt>
                <dd>{p.crops}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Safety")}</dt>
                <dd>{p.safety}</dd>
              </div>
            </dl>
          </Card>
        ))}
        {list.length === 0 && (
          <EmptyState
            icon={Bug}
            title={t("No match found")}
            desc={t("Try a different pesticide, pest or crop name.")}
          />
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {t(
          "Always confirm the final pesticide choice and dose with a verified Krushi Adhikari before spraying.",
        )}
      </p>
    </>
  );
}

export function FertilizersPage() {
  return (
    <>
      <PageHeader
        title={t("Fertilizers")}
        subtitle={t("Nutrient-wise fertilizer guidance for major Maharashtra crops.")}
        breadcrumb={["Dashboard", "Fertilizers"]}
      />
      <Card className="gap-0 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Fertilizer")}</TableHead>
              <TableHead>{t("Nutrient")}</TableHead>
              <TableHead>{t("Recommended Dose")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("Suitable Crops")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("Application Note")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {FERTILIZERS.map((f) => (
              <TableRow key={f.name}>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    <FlaskConical className="size-4 text-primary" />
                    {f.name}
                  </span>
                </TableCell>
                <TableCell>{f.nutrient}</TableCell>
                <TableCell className="font-medium text-forest">{f.dose}</TableCell>
                <TableCell className="hidden md:table-cell">{f.crops}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {f.note}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Card className="mt-4 gap-0 bg-pale/60 p-4 text-sm">
        {t(
          "\ud83d\udca1 Doses shown are general guidance. Soil Health Card results and Krushi Adhikari advice take priority.",
        )}
      </Card>
    </>
  );
}

const ARTICLE_CATS = [
  "All",
  "Crop Guides",
  "Pest Management",
  "Fertilizers",
  "Pesticides",
  "Soil Health",
  "Irrigation",
  "Organic Farming",
  "Government Programs",
];

export function LibraryPage() {
  const { bookmarks, toggleBookmark } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<(typeof ARTICLES)[number] | null>(null);
  const list = ARTICLES.filter(
    (a) =>
      (cat === "All" || a.category === cat) &&
      (a.title + a.excerpt).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title={t("Knowledge Library")}
        subtitle={t("Practical guides written for Indian field conditions.")}
        breadcrumb={["Dashboard", "Knowledge Library"]}
      />
      <Card className="mb-4 gap-0 p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Search articles")}
            className="pl-9"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ARTICLE_CATS.map((c) => (
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
        <EmptyState
          icon={BookOpen}
          title={t("No articles found")}
          desc={t("Try another keyword or category.")}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <Card key={a.id} className="hover-lift gap-0 p-5">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{a.category}</Badge>
                <button onClick={() => toggleBookmark(a.id)} aria-label={t("Bookmark")}>
                  <Bookmark
                    className={`size-4 ${bookmarks.includes(a.id) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                </button>
              </div>
              <h3 className="mt-3 font-semibold">{t(a.title)}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{a.excerpt}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{a.read}</span>
                <Button size="sm" variant="outline" onClick={() => setOpen(a)}>
                  {t("Read Article")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{open?.title}</DialogTitle>
          </DialogHeader>
          <Badge variant="secondary" className="w-fit">
            {open?.category}
          </Badge>
          <p className="text-sm text-muted-foreground">{open?.excerpt}</p>
          <Separator />
          <div className="space-y-3 text-sm">
            <p>
              <b>{t("Why it happens:")}</b>{" "}
              {t(
                "Field symptoms usually appear from a combination of nutrient availability, soil moisture and pest pressure. Confirm the cause before spending on inputs.",
              )}
            </p>
            <p>
              <b>{t("What to check first:")}</b>{" "}
              {t(
                "Inspect 10 random plants across the affected patch, note leaf position of symptoms, check soil moisture at 15 cm depth and recall the last fertilizer or spray applied.",
              )}
            </p>
            <p>
              <b>{t("Recommended practice:")}</b>{" "}
              {t(
                "Follow the Soil Health Card dose, split nitrogen applications, maintain field drainage and use protective sprays only at economic threshold levels.",
              )}
            </p>
            <p>
              <b>{t("When to consult:")}</b>{" "}
              {t(
                "If symptoms spread beyond 10% of the plot within a week, submit a query with photographs to your Krushi Adhikari.",
              )}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ProfilePage({ role }: { role: Role }) {
  const { user } = useStore();
  const [edit, setEdit] = useState(false);
  if (!user) return null;
  const sections: Record<Role, { title: string; fields: [string, string][] }[]> = {
    farmer: [
      {
        title: "Personal Information",
        fields: [
          ["Full Name", "Ramesh Patil"],
          ["Mobile", "98220 11223"],
          ["Email", "ramesh.patil@example.com"],
          ["Preferred Language", "मराठी"],
        ],
      },
      {
        title: "Address",
        fields: [
          ["Village", "Akluj"],
          ["Taluka", "Malshiras"],
          ["District", "Solapur"],
          ["Pincode", "413101"],
        ],
      },
      {
        title: "Farm Information",
        fields: [
          ["Farm Size", "6.5 Acres"],
          ["Irrigation", "Drip & Sprinkler"],
          ["Soil Type", "Medium Black"],
          ["Main Crops", "Soybean, Cotton, Onion"],
        ],
      },
    ],
    seller: [
      {
        title: "Seller Information",
        fields: [
          ["Business Name", "Shree Krushi Produce"],
          ["Owner", "Shrikant Kale"],
          ["Mobile", "98220 77330"],
          ["Email", "seller@example.com"],
        ],
      },
      {
        title: "Business Address",
        fields: [
          ["Address", "APMC Market Yard, Solapur"],
          ["District", "Solapur"],
          ["Pincode", "413001"],
          ["Working Hours", "6 AM - 7 PM"],
        ],
      },
      {
        title: "Produce Business",
        fields: [
          ["Categories", "Vegetables, Fruits, Grains, Pulses"],
          ["Active Listings", "4"],
          ["Verification", "Verified Seller"],
          ["Rating", "4.7 / 5"],
        ],
      },
    ],
    officer: [
      {
        title: "Officer Information",
        fields: [
          ["Full Name", "Dr. S. K. Deshmukh"],
          ["Officer ID", "MH-AGRI-2201"],
          ["Designation", "Agriculture Officer"],
          ["Department", "Dept. of Agriculture, Maharashtra"],
        ],
      },
      {
        title: "Posting",
        fields: [
          ["District", "Solapur"],
          ["Taluka", "Malshiras"],
          ["Experience", "12 years"],
          ["Languages", "Marathi, Hindi, English"],
        ],
      },
      {
        title: "Expertise",
        fields: [
          ["Primary", "Crop Protection"],
          ["Secondary", "Soil Management"],
          ["Verification", "Verified by Admin"],
          ["Rating", "4.8 / 5"],
        ],
      },
    ],
    buyer: [
      {
        title: "Buyer Information",
        fields: [
          ["Business Name", "Mahesh Traders"],
          ["Owner", "Mahesh Kulkarni"],
          ["Buyer Type", "Wholesaler"],
          ["Mobile", "98220 44112"],
        ],
      },
      {
        title: "Location",
        fields: [
          ["Address", "Market Yard, Solapur"],
          ["District", "Solapur"],
          ["Pincode", "413001"],
          ["Working Hours", "6 AM - 7 PM"],
        ],
      },
      {
        title: "Business",
        fields: [
          ["Interested Produce", "Vegetables, Fruits, Grains, Pulses"],
          ["Primary Market", "Solapur Mandi"],
          ["Verification", "✅ Verified Buyer"],
          ["Rating", "4.7 / 5"],
        ],
      },
    ],

    admin: [
      {
        title: "Administrator",
        fields: [
          ["Name", "Platform Admin"],
          ["Role", "Super Admin"],
          ["Email", "admin@smartkrushisahayak.in"],
          ["Region", "Maharashtra"],
        ],
      },
      {
        title: "Permissions",
        fields: [
          ["User Management", "Full"],
          ["Approvals", "Full"],
          ["Content", "Full"],
          ["Marketplace", "Full"],
        ],
      },
    ],
  };
  return (
    <>
      <PageHeader
        title={role === "buyer" || role === "seller" ? "Business Profile" : "My Profile"}
        subtitle={user.meta}
        breadcrumb={["Dashboard", "Profile"]}
        action={
          <Button
            variant={edit ? "default" : "outline"}
            onClick={() => {
              if (edit) toast.success("Profile updated");
              setEdit(!edit);
            }}
          >
            {edit ? "Save Changes" : "Edit Profile"}
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 p-6 text-center">
          <div className="mx-auto grid size-24 place-items-center rounded-full bg-pale text-2xl font-bold text-forest">
            {user.initials}
          </div>
          <h2 className="mt-4 text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{t(user.subtitle)}</p>
          <StatusBadge status="Verified" />
        </Card>
        <div className="grid gap-4 lg:col-span-2">
          {sections[role].map((s) => (
            <SectionCard key={t(s.title)} title={t(s.title)}>
              <div className="grid gap-4 sm:grid-cols-2">
                {s.fields.map(([k, v]) => (
                  <div key={k}>
                    <Label className="text-xs text-muted-foreground">{k}</Label>
                    {edit ? (
                      <Input defaultValue={v} className="mt-1" maxLength={120} />
                    ) : (
                      <p className="mt-1 text-sm font-medium">{v}</p>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
          {role === "officer" && <OfficerCertSummary />}
        </div>
      </div>
    </>
  );
}

function OfficerCertSummary() {
  const { officers } = useStore();
  const officer = officers.find((o) => o.id === "OF1") ?? officers[0];
  if (!officer) return null;
  const progress = certProgress(officer);
  return (
    <SectionCard
      title={t("Certifications")}
      desc={t("Your professional certificates and their verification status with the Admin team.")}
      action={
        <Link to="/app/$" params={{ _splat: "officer/certifications" }}>
          <Button size="sm" variant="outline">
            {t("View all")}
          </Button>
        </Link>
      }
    >
      <div className="space-y-2">
        {officer.certificates.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{t(c.name)}</p>
              <p className="text-xs text-muted-foreground">{c.number}</p>
            </div>
            <StatusBadge status={c.status} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {progress.verified} {t("of")} {progress.total} {t("documents verified")} •{" "}
        {t(officerVerification(officer))}
      </p>
    </SectionCard>
  );
}

export function SimpleTabsPage({
  title,
  subtitle,
  tabs,
}: {
  title: string;
  subtitle: string;
  tabs: { value: string; label: string; content: React.ReactNode }[];
}) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} breadcrumb={["Dashboard", title]} />
      <Tabs defaultValue={tabs[0]?.value ?? ""}>
        <TabsList className="flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {t(tab.label)}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-4">
            {t.content}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

export const sharedIcons = { Bell, Landmark, ShoppingBag };
