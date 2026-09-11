import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  CloudSun,
  Eye,
  EyeOff,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Store,
  UserCog,
  Wheat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { LanguageSelector, Logo } from "@/components/skl/common";
import { useStore } from "@/lib/skl/store";
import type { Role } from "@/lib/skl/data";
import loginImg from "@/assets/login-farmer.jpg";
import { t } from "@/lib/skl/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Smart Krushi Sahayak" },
      {
        name: "description",
        content:
          "Login to Smart Krushi Sahayak as a farmer, produce seller, buyer, Krushi Adhikari or administrator.",
      },
      { property: "og:title", content: "Login — Smart Krushi Sahayak" },
      { property: "og:description", content: "Smart support for smart farmers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const DEMOS: { role: Role; label: string; emoji: string; icon: typeof Sprout; desc: string }[] = [
  {
    role: "farmer",
    label: "Farmer Demo",
    emoji: "👨‍🌾",
    icon: Wheat,
    desc: "Get expert agricultural assistance.",
  },
  {
    role: "seller",
    label: "Seller Demo",
    emoji: "🧺",
    icon: Store,
    desc: "Sell agricultural produce and manage orders.",
  },
  {
    role: "buyer",
    label: "Buyer Demo",
    emoji: "🛒",
    icon: ShoppingBag,
    desc: "Buy agricultural produce directly from sellers.",
  },
  {
    role: "officer",
    label: "Krushi Adhikari Demo",
    emoji: "👨‍💼",
    icon: UserCog,
    desc: "Provide expert agricultural guidance.",
  },
  {
    role: "admin",
    label: "Admin Demo",
    emoji: "🛡",
    icon: ShieldCheck,
    desc: "Manage and monitor the platform.",
  },
];

function LoginPage() {
  const { loginAs } = useStore();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const enter = (role: Role) => {
    loginAs(role);
    toast.success(`Logged in as ${role === "officer" ? "Krushi Adhikari" : role}`);
    navigate({ to: "/app/$", params: { _splat: `${role}/dashboard` } });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src={loginImg}
          alt="Indian farmer standing in a green farm at sunrise"
          width={912}
          height={1408}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/50 to-forest/30" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Logo invert />
          <div>
            <h2 className="max-w-md text-4xl leading-tight font-bold">
              {t("Smart Support for Smart Farmers")}
            </h2>
            <p className="mt-3 max-w-md text-white/85">
              {t("Get expert advice for crops, diseases, pesticides, fertilizers and more.")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: ShieldCheck, label: "Expert Advice" },
                { icon: Sprout, label: "Trusted Information" },
                { icon: CloudSun, label: "Weather Updates" },
              ].map((f) => (
                <span
                  key={t(f.label)}
                  className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur"
                >
                  <f.icon className="size-4" /> {t(f.label)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-between p-4">
          <div className="lg:hidden">
            <Logo compact />
          </div>
          <div className="ml-auto">
            <LanguageSelector />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-10">
          <Card className="w-full max-w-md gap-0 p-6 sm:p-8">
            <h1 className="text-2xl font-bold">{t("Welcome Back!")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("Login to continue to your account.")}
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!id.trim() || pw.length < 4) {
                  toast.error("Enter mobile/email and a password of at least 4 characters");
                  return;
                }
                enter("farmer");
              }}
            >
              <div>
                <Label htmlFor="id">{t("Mobile Number / Email")}</Label>
                <Input
                  id="id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  maxLength={255}
                  className="mt-1.5 h-11"
                  placeholder="98220 11223"
                />
              </div>
              <div>
                <Label htmlFor="pw">{t("Password")}</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="pw"
                    type={show ? "text" : "password"}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    maxLength={64}
                    className="h-11 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={t("Show password")}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox defaultChecked /> {t("Remember Me")}
                </label>
                <button
                  type="button"
                  className="text-sm text-primary"
                  onClick={() =>
                    toast.info("Password reset link sent to your registered mobile number.")
                  }
                >
                  {t("Forgot Password?")}
                </button>
              </div>
              <Button type="submit" className="h-11 w-full text-base">
                {t("Login")}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> {t("OR")}{" "}
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                onClick={() => toast.info("Google sign-in is simulated in this prototype.")}
              >
                {t("Continue with Google")}
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info("OTP 4321 sent to your mobile (demo).")}
              >
                {t("Login with OTP")}
              </Button>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed bg-pale/60 p-4">
              <p className="text-sm font-semibold text-forest">{t("Demo Accounts")}</p>
              <p className="text-xs text-muted-foreground">
                {t("No password needed \u2014 enter any dashboard instantly.")}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {DEMOS.map((d) => (
                  <button
                    key={d.role}
                    onClick={() => enter(d.role)}
                    className="hover-lift flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5 text-left"
                  >
                    <span className="text-lg">{d.emoji}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold">{t(d.label)}</span>
                      <span className="block truncate text-[10px] text-muted-foreground">
                        {t(d.desc)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-primary">
                {t("Register Here")}
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
