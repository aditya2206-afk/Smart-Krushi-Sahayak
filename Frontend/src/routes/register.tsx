import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, ShoppingBag, Store, UserCog, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LanguageSelector, Logo } from "@/components/skl/common";
import { friendlyAuthError, registerRequest, type BackendRole } from "@/lib/skl/auth";
import { t } from "@/lib/skl/i18n";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Smart Krushi Sahayak" },
      {
        name: "description",
        content:
          "Create a farmer, produce seller, Krushi Adhikari or buyer account on Smart Krushi Sahayak.",
      },
      { property: "og:title", content: "Register — Smart Krushi Sahayak" },
      {
        property: "og:description",
        content: "Join India's farmer assistance and expert consultation platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

type Kind = null | "farmer" | "seller" | "officer" | "buyer";

function RegisterPage() {
  const [kind, setKind] = useState<Kind>(null);
  const [done, setDone] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Link to="/login">
              <Button variant="outline" size="sm">
                {t("Login")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        {done ? (
          <Card className="gap-0 p-8 text-center">
            <CheckCircle2 className="mx-auto size-14 text-primary" />
            <h1 className="mt-4 text-2xl font-bold">Registration successful</h1>
            <p className="mt-2 text-muted-foreground">{done}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate({ to: "/login" })}>
                {t("Go to Login")}
              </Button>
            </div>
          </Card>
        ) : !kind ? (
          <>
            <h1 className="text-center text-3xl font-bold">{t("Who are you?")}</h1>
            <p className="mt-2 text-center text-muted-foreground">
              {t("Choose your role to start registration. Admin registration is not public.")}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  k: "farmer" as const,
                  icon: Wheat,
                  title: "Farmer",
                  desc: "Get expert agricultural assistance.",
                },
                {
                  k: "seller" as const,
                  icon: Store,
                  title: "Seller",
                  desc: "Sell agricultural produce and manage orders.",
                },
                {
                  k: "officer" as const,
                  icon: UserCog,
                  title: "Krushi Adhikari",
                  desc: "Answer farmer queries in your district",
                },
                {
                  k: "buyer" as const,
                  icon: ShoppingBag,
                  title: "Buyer",
                  desc: "Buy agricultural produce directly from sellers.",
                },
              ].map((c) => (
                <button
                  key={c.k}
                  onClick={() => setKind(c.k)}
                  className="hover-lift rounded-2xl border bg-card p-6 text-left"
                >
                  <span className="grid size-12 place-items-center rounded-xl bg-pale text-primary">
                    <c.icon className="size-6" />
                  </span>
                  <h2 className="mt-4 font-semibold">{t(c.title)}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{t(c.desc)}</p>
                </button>
              ))}
            </div>
            <Card className="mt-6 gap-0 p-4 text-sm text-muted-foreground">
              {t(
                "\ud83d\udee1 Admin accounts are created internally by the platform team and cannot be registered publicly.",
              )}
            </Card>
          </>
        ) : (
          <>
            <button
              onClick={() => setKind(null)}
              className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> {t("Change role")}
            </button>
            {kind === "farmer" && <AuthRegisterForm role="FARMER" title="Farmer Registration" onDone={setDone} />}
            {kind === "seller" && <AuthRegisterForm role="SELLER" title="Seller Registration" onDone={setDone} />}
            {kind === "officer" && <AuthRegisterForm role="OFFICER" title="Krushi Adhikari Registration" onDone={setDone} />}
            {kind === "buyer" && <AuthRegisterForm role="BUYER" title="Buyer Registration" onDone={setDone} />}
          </>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function AuthRegisterForm({
  role,
  title,
  onDone,
}: {
  role: BackendRole;
  title: string;
  onDone: (m: string) => void;
}) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const user = await registerRequest({ name, email, password, role });
      toast.success("Registration successful");
      onDone(`Account created for ${user.email} as ${user.role}. Please login.`);
      navigate({ to: "/login" });
    } catch (err) {
      setError(friendlyAuthError(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="gap-0 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Badge variant="outline" className="rounded-full">
          {role}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Admin accounts cannot be registered publicly.
      </p>
      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label={t("Full Name")}>
          <Input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t("Email")}>
          <Input type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={t("Password")}>
          <Input type="password" required minLength={8} maxLength={64} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label={t("Confirm Password")}>
          <Input type="password" required minLength={8} maxLength={64} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive sm:col-span-2">
            {error}
          </p>
        ) : null}
        <div className="sm:col-span-2">
          <Button type="submit" className="h-11 w-full sm:w-auto sm:px-10" disabled={loading}>
            {loading ? "Creating account..." : `Create ${role} Account`}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// Legacy mock prototype forms removed: registration now calls POST /api/auth/register.

