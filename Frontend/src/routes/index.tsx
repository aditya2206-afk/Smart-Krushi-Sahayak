import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BadgeIndianRupee,
  Bug,
  CheckCircle2,
  Cloud,
  CloudSun,
  FlaskConical,
  Landmark,
  Languages,
  Leaf,
  Mail,
  MapPin,
  MessageSquare,
  Mic,
  Menu,
  Phone,
  Scan,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Star,
  Store,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { LanguageSelector, Logo } from "@/components/skl/common";
import { useStore } from "@/lib/skl/store";
import { SCHEMES, SERVICES, seedProducts, MANDI_PRICES } from "@/lib/skl/data";
import heroImg from "@/assets/hero-farmer.jpg";
import { t } from "@/lib/skl/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Krushi Sahayak — Expert Farming Guidance for India" },
      {
        name: "description",
        content:
          "Ask Krushi Adhikaris, diagnose crop problems, check weather, discover government schemes and trade agricultural produce.",
      },
      { property: "og:title", content: "Smart Krushi Sahayak" },
      {
        property: "og:description",
        content: "Sow • Grow • Connect • Prosper — farmer assistance and expert consultation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how" },
  { label: "Government Schemes", href: "#schemes" },
  { label: "Marketplace", href: "#marketplace" },
  { label: "Nearby Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const FEATURES = [
  {
    icon: UserCheck,
    title: "Expert Agricultural Guidance",
    desc: "Connect directly with verified Krushi Adhikaris of your district.",
  },
  {
    icon: Scan,
    title: "Crop Disease Support",
    desc: "Upload crop photographs for expert inspection and treatment advice.",
  },
  {
    icon: Mic,
    title: "Voice & Text Questions",
    desc: "Explain your problem by typing or by recording a voice note.",
  },
  {
    icon: FlaskConical,
    title: "Fertilizer Recommendation",
    desc: "Receive personalized fertilizer doses for your crop and stage.",
  },
  {
    icon: Bug,
    title: "Pesticide Recommendation",
    desc: "Crop-specific pesticide guidance with safe dosage and precautions.",
  },
  {
    icon: CloudSun,
    title: "Live Weather",
    desc: "Current conditions, 7-day forecast and spraying advisories.",
  },
  {
    icon: Landmark,
    title: "Government Schemes",
    desc: "Central and Maharashtra schemes with eligibility and deadlines.",
  },
  {
    icon: MapPin,
    title: "Nearby Agriculture Services",
    desc: "Krushi Seva Kendras, soil labs, seed and fertilizer stores.",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    desc: "Buy agricultural produce directly from verified sellers.",
  },
  {
    icon: Languages,
    title: "Multi-language",
    desc: "Use the platform in English, मराठी or हिंदी.",
  },
];

const ROLE_CARDS = [
  { icon: Sprout, title: "Farmer", desc: "Get expert agricultural assistance." },
  { icon: Store, title: "Seller", desc: "Sell agricultural produce and manage orders." },
  { icon: ShoppingBag, title: "Buyer", desc: "Buy agricultural produce directly from sellers." },
  { icon: UserCheck, title: "Krushi Adhikari", desc: "Provide expert agricultural guidance." },
  { icon: ShieldCheck, title: "Admin", desc: "Manage and monitor the platform." },
];

const STEPS = [
  "Register / Login",
  "Select Language",
  "Upload Crop Image",
  "Submit Voice / Text Problem",
  "Krushi Adhikari Reviews Query",
  "Expert Gives Recommendation",
  "Farmer Chats With Expert",
  "Farmer Receives Notification",
  "Consultation Added to History",
  "Download the verified prescription for offline pickup",
];

function Landing() {
  const { t } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Logo />
          <nav className="ml-6 hidden items-center gap-1 xl:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-pale hover:text-forest"
              >
                {t(l.label)}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSelector />
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost">{t("login")}</Button>
            </Link>
            <Link to="/register">
              <Button className="rounded-full">{t("register")}</Button>
            </Link>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="xl:hidden"
                  aria-label={t("Open menu")}
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-6">
                <SheetTitle className="mb-4">{t("Menu")}</SheetTitle>
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-pale"
                    >
                      {t(l.label)}
                    </a>
                  ))}
                  <Link to="/login" className="mt-3">
                    <Button variant="outline" className="w-full">
                      {t("login")}
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="home" className="hero-gradient">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <Badge variant="outline" className="rounded-full border-primary/30 bg-pale text-forest">
              <Leaf className="mr-1 size-3" /> {t("tagline")}
            </Badge>
            <h1 className="mt-4 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
              <span className="text-gradient-green">{t("heroTitle")}</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              {t("heroDesc")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/login">
                <Button size="lg" className="gap-2 rounded-full px-6">
                  {t("askExpert")} <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="rounded-full px-6">
                  {t("explore")}
                </Button>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              {[
                ["12,486+", "Farmers"],
                ["146", "Krushi Adhikaris"],
                ["4.8/5", "Satisfaction"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="text-xl font-bold text-forest">{v}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImg}
              alt="Indian farmer using a smartphone in a green soybean field"
              width={1200}
              height={1008}
              className="w-full rounded-3xl object-cover shadow-lift"
            />
            <Card className="animate-floaty absolute -top-4 left-2 gap-0 p-3 sm:-left-6">
              <div className="flex items-center gap-2">
                <Cloud className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-bold">{t("28\u00b0C")}</p>
                  <p className="text-[10px] text-muted-foreground">{t("Solapur Weather")}</p>
                </div>
              </div>
            </Card>
            <Card className="animate-floaty absolute top-1/3 -right-2 gap-0 p-3 [animation-delay:1s] sm:-right-6">
              <div className="flex items-center gap-2">
                <Sprout className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-bold">{t("Crop Health")}</p>
                  <p className="text-[10px] text-muted-foreground">{t("Soybean \u2022 Healthy")}</p>
                </div>
              </div>
            </Card>
            <Card className="animate-floaty absolute -bottom-5 left-4 gap-0 p-3 [animation-delay:2s]">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-bold">{t("Expert Available")}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t("Dr. S. K. Deshmukh \ud83d\udfe2")}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="animate-floaty absolute right-4 -bottom-6 gap-0 p-3 [animation-delay:1.5s]">
              <div className="flex items-center gap-2">
                <BadgeIndianRupee className="size-4 text-harvest" />
                <div>
                  <p className="text-sm font-bold">{t("\u20b94,850/qtl")}</p>
                  <p className="text-[10px] text-muted-foreground">{t("Soybean Mandi")}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeading
          eyebrow={t("Features")}
          title={t("Everything a farmer needs, in one place")}
          desc={t(
            "Built with farmers, Krushi Adhikaris, buyers and the agriculture department workflow in mind.",
          )}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={t(f.title)} className="hover-lift gap-0 p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-pale text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{t(f.title)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(f.desc)}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow={t("Roles")}
            title={t("Five roles, one connected platform")}
            desc={t(
              "Farmers, sellers, buyers, Krushi Adhikaris and admins each get a dedicated dashboard.",
            )}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ROLE_CARDS.map((r) => (
              <Card key={r.title} className="hover-lift gap-0 p-5">
                <span className="grid size-11 place-items-center rounded-xl bg-pale text-primary">
                  <r.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{t(r.title)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(r.desc)}</p>
                <Link to="/login" className="mt-4">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    {t("Continue as")} {t(r.title)} <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-pale/60 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow={t("How It Works")}
            title={t("From your field to expert advice in minutes")}
            desc={t(
              "A complete guided journey between farmers, Krushi Adhikaris and verified buyers.",
            )}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <div key={s} className="relative rounded-2xl border bg-card p-4">
                <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="mt-3 text-sm font-medium">{s}</p>
              </div>
            ))}
          </div>
          <Card className="mt-8 gap-0 border-primary/40 p-6 text-center">
            <p className="text-base font-semibold text-forest sm:text-lg">
              {t(
                "After the Krushi Adhikari issues a prescription, the farmer downloads a PDF prescription form and can collect the exact prescribed items from verified local Krushi Seva Kendras nearby.",
              )}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "Mandi rates stay informational under Today's Mandi Prices, while the Produce Marketplace handles real buying and selling of farm produce.",
              )}
            </p>
          </Card>
        </div>
      </section>

      {/* SCHEMES */}
      <section id="schemes" className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeading
          eyebrow={t("Government Schemes")}
          title={t("Central & Maharashtra farmer schemes")}
          desc={t("Eligibility, benefits and deadlines explained in simple language.")}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {SCHEMES.slice(0, 3).map((s) => (
            <Card key={s.id} className="hover-lift gap-0 p-5">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{s.gov}</Badge>
                <Landmark className="size-4 text-primary" />
              </div>
              <h3 className="mt-3 font-semibold">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(s.desc)}</p>
              <p className="mt-3 text-sm font-medium text-forest">{s.benefit}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* MARKETPLACE */}
      <section id="marketplace" className="bg-pale/60 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow={t("Produce Marketplace")}
            title={t("Verified farmers, fresh agricultural produce")}
            desc={t(
              "Vegetables, fruits, grains, pulses and commercial crops sold directly at transparent mandi-linked prices.",
            )}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {seedProducts.slice(0, 4).map((p) => (
              <Card key={p.id} className="hover-lift gap-0 overflow-hidden p-0">
                <img
                  src={p.image}
                  alt={t(p.name)}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="h-36 w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-xs text-muted-foreground">
                    {t(p.category)} • {t(p.market)}
                  </p>
                  <h3 className="mt-0.5 line-clamp-1 font-semibold">{t(p.name)}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-forest">
                      ₹{p.price.toLocaleString("en-IN")}/{t(p.unit)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3 fill-harvest text-harvest" /> {p.rating}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-5">
            {MANDI_PRICES.map((m) => (
              <Card key={m.crop} className="gap-0 p-4">
                <p className="text-xs text-muted-foreground">
                  {m.crop} • {m.market}
                </p>
                <p className="mt-1 font-bold">₹{m.price.toLocaleString("en-IN")}/qtl</p>
                <p className={m.change >= 0 ? "text-xs text-primary" : "text-xs text-destructive"}>
                  {m.change >= 0 ? "▲" : "▼"} {Math.abs(m.change)}%
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeading
          eyebrow={t("Nearby Services")}
          title={t("Agriculture services around you")}
          desc={t(
            "Krushi Seva Kendras, soil testing labs, seed and fertilizer stores, offices and equipment rental.",
          )}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {SERVICES.slice(0, 3).map((s) => (
            <Card key={s.id} className="hover-lift gap-0 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{s.category}</p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  {s.distance}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.address}</p>
              <p className="mt-2 text-sm">
                ⭐ {s.rating} • Open {s.hours}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-pale/60 py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow={t("About")}
              title={t("Trusted guidance, not guesswork")}
              align="left"
            />
            <p className="mt-4 text-muted-foreground">
              {t(
                "Smart Krushi Sahayak connects farmers with verified Krushi Adhikaris of the agriculture\n              department. Preliminary image assessment helps describe the problem better, but every\n              official recommendation is reviewed and issued by a verified officer.",
              )}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Verified officer recommendations with dosage and precautions",
                "Consultation history saved for every farmer",
                "Verified farmers and buyers only in the marketplace",
                "Available in English, मराठी and हिंदी",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <Card className="gap-0 p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-primary" />
              <div>
                <p className="font-semibold">{t("Advisory Safety Policy")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("Why we do not auto-diagnose crops")}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t(
                "Automated image assessment can misread field conditions. On this platform it is only a\n              preliminary visual assessment shared with a Krushi Adhikari, who verifies symptoms,\n              soil, weather and crop stage before issuing a treatment plan.",
              )}
            </p>
          </Card>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={t("Contact")} title={t("Talk to our team")} align="left" />
            <div className="mt-6 space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-primary" /> 1800-233-4000 (Toll Free, 8 AM – 8 PM)
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-primary" /> {t("support@smartkrushisahayak.in")}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" /> {t("Krushi Bhavan, Pune, Maharashtra")}
              </p>
            </div>
          </div>
          <Card className="gap-0 p-6">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Message sent", {
                  description: "Our team will contact you within 24 hours.",
                });
                (e.target as HTMLFormElement).reset();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="cname">{t("Full Name")}</Label>
                  <Input
                    id="cname"
                    required
                    maxLength={100}
                    className="mt-1.5"
                    placeholder={t("Ramesh Patil")}
                  />
                </div>
                <div>
                  <Label htmlFor="cmob">{t("Mobile Number")}</Label>
                  <Input
                    id="cmob"
                    required
                    maxLength={15}
                    className="mt-1.5"
                    placeholder="98220 11223"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cmsg">{t("Message")}</Label>
                <Textarea
                  id="cmsg"
                  required
                  maxLength={1000}
                  className="mt-1.5"
                  placeholder={t("How can we help you?")}
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full">
                {t("Send Message")}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">{t("tagline")}</p>
          </div>
          <div>
            <p className="font-semibold">{t("Platform")}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features">{t("Features")}</a>
              </li>
              <li>
                <a href="#how">{t("How It Works")}</a>
              </li>
              <li>
                <a href="#marketplace">{t("Marketplace")}</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">{t("Resources")}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#schemes">{t("Government Schemes")}</a>
              </li>
              <li>
                <a href="#services">{t("Nearby Services")}</a>
              </li>
              <li>
                <a href="#about">{t("Advisory Policy")}</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">{t("Get Started")}</p>
            <div className="mt-3 flex gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  {t("Login")}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">{t("Register")}</Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          {t("\u00a9 2026 Smart Krushi Sahayak \u00b7 Prototype for demonstration purposes")}
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  desc,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : ""}>
      <span className="text-xs font-semibold tracking-widest text-primary uppercase">
        {eyebrow}
      </span>
      <h2 className="mt-2 text-3xl font-bold tracking-tight">{title}</h2>
      {desc && <p className="mt-2 text-muted-foreground">{desc}</p>}
    </div>
  );
}
