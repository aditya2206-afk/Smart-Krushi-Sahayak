import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, ShoppingBag, Store, Upload, UserCog, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { LanguageSelector, Logo } from "@/components/skl/common";
import { BUYER_TYPES, DISTRICTS } from "@/lib/skl/data";
import { useStore } from "@/lib/skl/store";
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
  const { loginAs } = useStore();
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
            <h1 className="mt-4 text-2xl font-bold">{t("Registration Submitted")}</h1>
            <p className="mt-2 text-muted-foreground">{done}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => {
                  loginAs("farmer");
                  navigate({ to: "/app/$", params: { _splat: "farmer/dashboard" } });
                }}
              >
                {t("Continue to Demo Dashboard")}
              </Button>
              <Link to="/login">
                <Button variant="outline">{t("Go to Login")}</Button>
              </Link>
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
            {kind === "farmer" && <FarmerForm onDone={setDone} />}
            {kind === "seller" && <SellerForm onDone={setDone} />}
            {kind === "officer" && <OfficerForm onDone={setDone} />}
            {kind === "buyer" && <BuyerForm onDone={setDone} />}
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

function DistrictSelect() {
  return (
    <Select>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t("Select district")} />
      </SelectTrigger>
      <SelectContent>
        {DISTRICTS.map((d) => (
          <SelectItem key={d} value={d}>
            {d}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function UploadBox({ label }: { label: string }) {
  const [file, setFile] = useState<string | null>(null);
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground hover:bg-muted">
      <Upload className="size-4" />
      {file ?? label}
      <input
        type="file"
        className="sr-only"
        onChange={(e) => setFile(e.target.files?.[0]?.name ?? "file-selected.png")}
      />
    </label>
  );
}

function FarmerForm({ onDone }: { onDone: (m: string) => void }) {
  const [agree, setAgree] = useState(false);
  return (
    <Card className="gap-0 p-6">
      <h1 className="text-2xl font-bold">{t("Farmer Registration")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("Tell us about you and your farm.")}</p>
      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!agree) {
            toast.error("Please accept Terms & Privacy Policy");
            return;
          }
          onDone(
            "Your farmer account has been created. You can now login and start asking questions.",
          );
        }}
      >
        <Field label={t("Full Name")}>
          <Input required maxLength={100} placeholder={t("Ramesh Patil")} />
        </Field>
        <Field label={t("Mobile Number")}>
          <Input required maxLength={15} placeholder="98220 11223" />
        </Field>
        <Field label={t("Email")}>
          <Input type="email" maxLength={255} placeholder={t("ramesh@example.com")} />
        </Field>
        <Field label={t("Password")}>
          <Input type="password" required minLength={6} maxLength={64} />
        </Field>
        <Field label={t("Confirm Password")}>
          <Input type="password" required minLength={6} maxLength={64} />
        </Field>
        <Field label={t("State")}>
          <Input defaultValue="Maharashtra" maxLength={60} />
        </Field>
        <Field label={t("District")}>
          <DistrictSelect />
        </Field>
        <Field label={t("Taluka")}>
          <Input maxLength={60} placeholder={t("Malshiras")} />
        </Field>
        <Field label={t("Village")}>
          <Input maxLength={60} placeholder={t("Akluj")} />
        </Field>
        <Field label={t("Pincode")}>
          <Input maxLength={6} placeholder="413101" />
        </Field>
        <Field label={t("Preferred Language")}>
          <Select defaultValue="English">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">{t("English")}</SelectItem>
              <SelectItem value="Marathi">मराठी</SelectItem>
              <SelectItem value="Hindi">हिंदी</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("Main Crops")}>
          <Input maxLength={120} placeholder={t("Soybean, Cotton, Onion")} />
        </Field>
        <Field label={t("Farm Size (acres)")}>
          <Input maxLength={10} placeholder="6.5" />
        </Field>
        <Field label={t("Profile Photo")}>
          <UploadBox label={t("Upload profile photo")} />
        </Field>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} />
            {t("I agree to Terms & Privacy Policy.")}
          </label>
          <Button type="submit" className="mt-4 h-11 w-full sm:w-auto sm:px-10">
            {t("Create Farmer Account")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function SellerForm({ onDone }: { onDone: (m: string) => void }) {
  return (
    <Card className="gap-0 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t("Seller Registration")}</h1>
        <Badge
          variant="outline"
          className="rounded-full border-warning/40 bg-warning/10 text-warning"
        >
          {t("Pending Verification")}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("Register your agricultural produce business.")}
      </p>
      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          onDone("Your seller application is submitted. Status: Pending Verification by Admin.");
        }}
      >
        <Field label={t("Full Name")}>
          <Input required maxLength={100} placeholder={t("Anil Pawar")} />
        </Field>
        <Field label={t("Business Name")}>
          <Input required maxLength={120} placeholder={t("Pawar Fresh Produce")} />
        </Field>
        <Field label={t("Mobile Number")}>
          <Input required maxLength={15} />
        </Field>
        <Field label={t("Email")}>
          <Input type="email" maxLength={255} />
        </Field>
        <Field label={t("Password")}>
          <Input type="password" required minLength={6} maxLength={64} />
        </Field>
        <Field label={t("Confirm Password")}>
          <Input type="password" required minLength={6} maxLength={64} />
        </Field>
        <Field label={t("District")}>
          <DistrictSelect />
        </Field>
        <Field label={t("Pincode")}>
          <Input maxLength={6} />
        </Field>
        <div className="sm:col-span-2">
          <Field label={t("Business Address")}>
            <Textarea required maxLength={300} rows={3} placeholder={t("Market Yard, Solapur")} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label={t("Produce Categories")}>
            <Input required maxLength={160} placeholder={t("Vegetables, Fruits, Grains, Pulses")} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" className="h-11 w-full sm:w-auto sm:px-10">
            {t("Create Seller Account")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function OfficerForm({ onDone }: { onDone: (m: string) => void }) {
  return (
    <Card className="gap-0 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t("Krushi Adhikari Registration")}</h1>
        <Badge
          variant="outline"
          className="rounded-full border-warning/40 bg-warning/10 text-warning"
        >
          {t("Pending Admin Verification")}
        </Badge>
      </div>
      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          onDone("Your officer application is submitted. Status: Pending Admin Verification.");
        }}
      >
        <Field label={t("Full Name")}>
          <Input required maxLength={100} placeholder={t("Dr. P. M. Kulkarni")} />
        </Field>
        <Field label={t("Employee / Officer ID")}>
          <Input required maxLength={40} placeholder={t("MH-AGRI-4471")} />
        </Field>
        <Field label={t("Email")}>
          <Input type="email" required maxLength={255} />
        </Field>
        <Field label={t("Mobile Number")}>
          <Input required maxLength={15} />
        </Field>
        <Field label={t("Department")}>
          <Input maxLength={120} placeholder={t("Department of Agriculture, Maharashtra")} />
        </Field>
        <Field label={t("Designation")}>
          <Input maxLength={80} placeholder={t("Agriculture Officer")} />
        </Field>
        <Field label={t("District")}>
          <DistrictSelect />
        </Field>
        <Field label={t("Taluka")}>
          <Input maxLength={60} />
        </Field>
        <Field label={t("Areas of Expertise")}>
          <Input maxLength={160} placeholder={t("Crop Protection, Soil Management")} />
        </Field>
        <Field label={t("Experience (years)")}>
          <Input maxLength={4} placeholder="8" />
        </Field>
        <Field label={t("Preferred Languages")}>
          <Input maxLength={80} placeholder={t("Marathi, Hindi, English")} />
        </Field>
        <Field label={t("Password")}>
          <Input type="password" required minLength={6} maxLength={64} />
        </Field>
        <Field label={t("Upload ID / Certificate")}>
          <UploadBox label={t("Upload officer ID or certificate")} />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" className="h-11 w-full sm:w-auto sm:px-10">
            {t("Submit for Verification")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function BuyerForm({ onDone }: { onDone: (m: string) => void }) {
  return (
    <Card className="gap-0 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t("Buyer Registration")}</h1>
        <Badge
          variant="outline"
          className="rounded-full border-warning/40 bg-warning/10 text-warning"
        >
          {t("Pending Verification")}
        </Badge>
      </div>
      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          onDone("Your buyer application is submitted. Status: Pending Verification by Admin.");
        }}
      >
        <Field label={t("Full Name")}>
          <Input required maxLength={100} placeholder={t("Ganesh Bhosale")} />
        </Field>
        <Field label={t("Business Name")}>
          <Input maxLength={120} placeholder={t("Bhosale Produce Traders")} />
        </Field>
        <Field label={t("Mobile")}>
          <Input required maxLength={15} />
        </Field>
        <Field label={t("Email")}>
          <Input type="email" maxLength={255} />
        </Field>
        <Field label={t("Buyer Type")}>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("Select buyer type")} />
            </SelectTrigger>
            <SelectContent>
              {BUYER_TYPES.map((b) => (
                <SelectItem key={b} value={b}>
                  {t(b)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("GST / License Number")}>
          <Input maxLength={40} placeholder={t("27ABCDE1234F1Z5")} />
        </Field>
        <Field label={t("District")}>
          <DistrictSelect />
        </Field>
        <Field label={t("Pincode")}>
          <Input maxLength={6} />
        </Field>
        <div className="sm:col-span-2">
          <Field label={t("Products Interested In")}>
            <Input maxLength={160} placeholder={t("Vegetables, Fruits, Grains, Pulses")} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label={t("Business Address")}>
            <Textarea maxLength={300} rows={3} placeholder={t("Market Yard, Solapur")} />
          </Field>
        </div>
        <Field label={t("Password")}>
          <Input type="password" required minLength={6} maxLength={64} />
        </Field>
        <Field label={t("Confirm Password")}>
          <Input type="password" required minLength={6} maxLength={64} />
        </Field>
        <div className="sm:col-span-2">
          <Field label={t("Upload License / ID")}>
            <UploadBox label={t("Upload APMC licence, GST or ID proof")} />
          </Field>
          <Button type="submit" className="mt-4 h-11 w-full sm:w-auto sm:px-10">
            {t("Create Buyer Account")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
