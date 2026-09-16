import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CloudSun, Eye, EyeOff, ShieldCheck, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { LanguageSelector, Logo } from "@/components/skl/common";
import { useStore } from "@/lib/skl/store";
import {
  dashboardPathForRole,
  friendlyAuthError,
  loginRequest,
} from "@/lib/skl/auth";
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

function LoginPage() {
  const { setSession } = useStore();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = id.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!pw) {
      setError("Please enter your password.");
      return;
    }
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      // Authoritative backend login. No mock users, no role-based bypass.
      const result = await loginRequest(email, pw);
      setSession(result.token, result.user);
      toast.success("Login successful");
      navigate({
        to: "/app/$",
        params: { _splat: dashboardPathForRole(result.user.role) },
      });
    } catch (err) {
      setError(friendlyAuthError(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
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

            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div>
                <Label htmlFor="id">{t("Email")}</Label>
                <Input
                  id="id"
                  type="email"
                  autoComplete="email"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  maxLength={255}
                  className="mt-1.5 h-11"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label htmlFor="pw">{t("Password")}</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="pw"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
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
              {error ? (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {error}
                </p>
              ) : null}
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
              <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
                {loading ? "Logging in..." : t("Login")}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Use the email and password you registered with. New accounts are
              created on the Register page.
            </p>

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
