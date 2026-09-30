import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  Bug,
  CheckCircle2,
  ClipboardList,
  CloudSun,
  FlaskConical,
  HelpCircle,
  Landmark,
  MessageSquare,
  ShoppingBag,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SectionCard, StatCard, StatusBadge } from "@/components/skl/common";
import { useStore } from "@/lib/skl/store";
import { CROP_CARDS, MANDI_PRICES, WEATHER } from "@/lib/skl/data";
import heroImg from "@/assets/hero-farmer.jpg";
import { t } from "@/lib/skl/i18n";

const QUICK = [
  {
    path: "farmer/crop-help",
    icon: HelpCircle,
    title: "Crop Help",
    desc: "Ask an expert or run a preliminary crop check.",
  },
  {
    path: "farmer/pesticides",
    icon: Bug,
    title: "Pesticide Guide",
    desc: "Find the right pesticide.",
  },
  {
    path: "farmer/fertilizers",
    icon: FlaskConical,
    title: "Fertilizer Guide",
    desc: "Get fertilizer recommendations.",
  },
  {
    path: "farmer/mandi-prices",
    icon: TrendingUp,
    title: "Today's Mandi Prices",
    desc: "Check live market rates.",
  },
  { path: "farmer/weather", icon: CloudSun, title: "Weather", desc: "Check forecast." },
  {
    path: "farmer/schemes",
    icon: Landmark,
    title: "Schemes",
    desc: "Explore government benefits.",
  },
];

export function FarmerDashboard() {
  const { queries, notifications, savedSchemes, t, authUser } = useStore();
  const displayName = authUser?.name?.trim() ?? "";
  const mine = queries.filter((q) => q.farmer === "Ramesh Patil");
  const active = mine.filter((q) => q.status !== "Resolved").length;
  const resolved = mine.filter((q) => q.status === "Resolved").length;
  const unreadMsgs = notifications.filter(
    (n) => n.role === "farmer" && n.type === "chat" && !n.read,
  ).length;

  return (
    <>
      <PageHeader
        title={displayName ? `${t("welcome")}, ${displayName}! 👋` : `${t("welcome")}! 👋`}
        subtitle={t(
          "Get expert advice for your crops, diseases, pesticides, fertilizers and more.",
        )}
      />

      <Card className="relative mb-6 gap-0 overflow-hidden border-0 p-0">
        <img
          src={heroImg}
          alt="Farmer in a soybean field"
          width={1200}
          height={1008}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="relative bg-gradient-to-r from-forest/95 via-forest/80 to-forest/20 p-6 sm:p-8">
          <Badge variant="outline" className="rounded-full border-white/30 bg-white/15 text-white">
            {t("Kharif 2026 \u2022 Solapur")}
          </Badge>
          <h2 className="mt-3 max-w-lg text-2xl font-bold text-white sm:text-3xl">
            {t("Your Krushi Adhikari is online and ready to help")}
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/85">
            {t(
              "Submit crop photos and a short description \u2014 verified officers reply in about 18 minutes.",
            )}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/app/$" params={{ _splat: "farmer/crop-help" }} search={{ tab: "ask" }}>
              <Button size="lg" className="rounded-full">
                {t("Ask an Expert")}
              </Button>
            </Link>
            <Link to="/app/$" params={{ _splat: "farmer/crop-help" }} search={{ tab: "diagnose" }}>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/50 bg-white/10 text-white hover:bg-white/20"
              >
                {t("Diagnose Crop")}
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label={t("Active Queries")}
          value={active}
          hint={t("Awaiting expert action")}
        />
        <StatCard
          icon={CheckCircle2}
          label={t("Resolved Queries")}
          value={resolved}
          tone="forest"
          hint={t("Closed after follow-up")}
        />
        <StatCard
          icon={MessageSquare}
          label={t("Unread Expert Messages")}
          value={unreadMsgs}
          tone="harvest"
          hint={t("From Dr. S. K. Deshmukh")}
        />
        <StatCard
          icon={Bookmark}
          label={t("Saved Schemes")}
          value={savedSchemes.length}
          tone="warning"
          hint={t("Ready to apply")}
        />
      </div>

      <SectionCard
        title={t("Quick Actions")}
        desc={t("Everything you need, one tap away.")}
        className="mt-6"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK.map((q) => (
            <Link
              key={q.path}
              to="/app/$"
              params={{ _splat: q.path }}
              className="hover-lift flex items-start gap-3 rounded-xl border bg-card p-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-pale text-primary">
                <q.icon className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">{t(q.title)}</span>
                <span className="block text-xs text-muted-foreground">{t(q.desc)}</span>
              </span>
            </Link>
          ))}
        </div>
      </SectionCard>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <SectionCard
          title={t("Recent Questions")}
          desc={t("Latest activity on your consultations")}
          className="lg:col-span-2"
          action={
            <Link to="/app/$" params={{ _splat: "farmer/questions" }}>
              <Button size="sm" variant="outline">
                {t("View all")}
              </Button>
            </Link>
          }
        >
          <div className="space-y-3">
            {mine.slice(0, 3).map((q) => (
              <Link
                key={q.id}
                to="/app/$"
                params={{ _splat: "farmer/questions" }}
                className="flex items-center gap-3 rounded-xl border p-3 hover:bg-muted/50"
              >
                <img
                  src={q.images[0]}
                  alt={q.crop}
                  loading="lazy"
                  width={80}
                  height={80}
                  className="size-14 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t(q.title)}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.id} • {q.crop} • {q.createdAt}
                  </p>
                </div>
                <StatusBadge status={q.status} />
              </Link>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-4">
          <Card className="brand-gradient gap-0 p-5 text-primary-foreground">
            <div className="flex items-center gap-3">
              <CloudSun className="size-10" />
              <div>
                <p className="text-2xl font-bold">{WEATHER.temp}°C</p>
                <p className="text-xs text-white/80">
                  {WEATHER.condition} • {WEATHER.location}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-white/85">
              {t("Rain expected tomorrow evening \u2014 avoid spraying.")}
            </p>
            <Link to="/app/$" params={{ _splat: "farmer/weather" }}>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                {t("Open Forecast")}
              </Button>
            </Link>
          </Card>
          <SectionCard
            title={t("Today's Mandi Prices")}
            desc={t("Nearby markets")}
            action={
              <Link to="/app/$" params={{ _splat: "farmer/mandi-prices" }}>
                <Button size="sm" variant="outline">
                  {t("View all")}
                </Button>
              </Link>
            }
          >
            <div className="space-y-2.5">
              {MANDI_PRICES.slice(0, 4).map((m) => (
                <div key={m.crop} className="flex items-center justify-between text-sm">
                  <span>
                    {m.crop} <span className="text-xs text-muted-foreground">• {m.market}</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    ₹{m.price.toLocaleString("en-IN")}
                    <TrendingUp
                      className={`size-3 ${m.change >= 0 ? "text-primary" : "rotate-180 text-destructive"}`}
                    />
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title={t("My Crops")}
        desc={t("Season snapshot")}
        className="mt-6"
        action={
          <Link to="/app/$" params={{ _splat: "farmer/crops" }}>
            <Button size="sm" variant="outline">
              {t("Manage crops")}
            </Button>
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {CROP_CARDS.map((c) => (
            <div key={c.id} className="hover-lift overflow-hidden rounded-xl border">
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                width={800}
                height={600}
                className="h-28 w-full object-cover"
              />
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{c.name}</p>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  <Sprout className="mr-1 inline size-3" />
                  {c.area} • Sown {c.sowing}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
