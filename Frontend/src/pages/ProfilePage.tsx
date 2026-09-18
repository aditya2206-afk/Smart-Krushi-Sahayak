import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PageHeader, SectionCard, StatusBadge } from "@/components/skl/common";
import { useStore } from "@/lib/skl/store";
import { certProgress, officerVerification } from "@/lib/skl/data";
import type { Role } from "@/lib/skl/data";
import { t } from "@/lib/skl/i18n";
import { cropsFromString, cropsToString, fetchMyProfile, str } from "@/lib/skl/profile";
import { updateMyProfile, type ProfileResponse } from "@/lib/skl/profile";
type FieldType = "text" | "textarea" | "select" | "number";

interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
}

type FormState = Record<string, string>;
type FieldChange = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
type ChangeHandler = (e: FieldChange) => void;

export function fieldsForRole(role: Role): FieldDef[] {
  if (role === "farmer") {
    return [
      { key: "name", label: "Full Name" },
      { key: "phone", label: "Mobile" },
      { key: "village", label: "Village" },
      { key: "district", label: "District" },
      { key: "state", label: "State" },
      { key: "preferredLanguage", label: "Preferred Language", type: "select", options: ["English", "Marathi", "Hindi"] },
      { key: "farmSize", label: "Farm Size" },
      { key: "mainCrops", label: "Main Crops (comma separated)" },
    ];
  }
  if (role === "seller") {
    return [
      { key: "name", label: "Owner Name" },
      { key: "businessName", label: "Business Name" },
      { key: "phone", label: "Mobile" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "district", label: "District" },
      { key: "state", label: "State" },
      { key: "description", label: "Description", type: "textarea" },
    ];
  }
  if (role === "buyer") {
    return [
      { key: "name", label: "Full Name" },
      { key: "phone", label: "Mobile" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "district", label: "District" },
      { key: "state", label: "State" },
    ];
  }
  if (role === "officer") {
    return [
      { key: "name", label: "Full Name" },
      { key: "phone", label: "Mobile" },
      { key: "designation", label: "Designation" },
      { key: "qualification", label: "Qualification" },
      { key: "specialization", label: "Specialization" },
      { key: "department", label: "Department" },
      { key: "experienceYears", label: "Experience (years)", type: "number" },
      { key: "officerId", label: "Officer ID" },
      { key: "district", label: "District" },
      { key: "state", label: "State" },
    ];
  }
  return [];
}
export function blankProfileForm(role: Role, res: ProfileResponse): FormState {
  const p = (res.profile ?? {}) as Record<string, unknown>;
  const next: FormState = { name: res.user?.name ?? "" };
  const defs = fieldsForRole(role);
  for (let i = 0; i < defs.length; i++) {
    const f = defs[i];
    if (!f || f.key === "name") continue;
    if (f.key === "mainCrops") next[f.key] = cropsToString(p[f.key]);
    else next[f.key] = str(p[f.key]);
  }
  if (role === "farmer") {
    const lang = next["preferredLanguage"];
    if (!lang) next["preferredLanguage"] = "Marathi";
  }
  return next;
}

export function buildProfilePayload(role: Role, form: FormState): Record<string, unknown> {
  const trimName = (form["name"] ?? "").trim();
  const base: Record<string, unknown> = trimName ? { name: trimName } : {};
  if (role === "farmer") {
    base["phone"] = form["phone"] ?? "";
    base["village"] = form["village"] ?? "";
    base["district"] = form["district"] ?? "";
    base["state"] = form["state"] ?? "";
    base["preferredLanguage"] = form["preferredLanguage"] || "Marathi";
    base["farmSize"] = form["farmSize"] ?? "";
    base["mainCrops"] = cropsFromString(form["mainCrops"] ?? "");
    return base;
  }
  if (role === "seller") {
    base["businessName"] = form["businessName"] ?? "";
    base["phone"] = form["phone"] ?? "";
    base["address"] = form["address"] ?? "";
    base["district"] = form["district"] ?? "";
    base["state"] = form["state"] ?? "";
    base["description"] = form["description"] ?? "";
    return base;
  }
  if (role === "buyer") {
    base["phone"] = form["phone"] ?? "";
    base["address"] = form["address"] ?? "";
    base["district"] = form["district"] ?? "";
    base["state"] = form["state"] ?? "";
    return base;
  }
  if (role === "officer") {
    base["phone"] = form["phone"] ?? "";
    base["designation"] = form["designation"] ?? "";
    base["qualification"] = form["qualification"] ?? "";
    base["specialization"] = form["specialization"] ?? "";
    base["department"] = form["department"] ?? "";
    const exp = Number.parseInt(form["experienceYears"] ?? "", 10);
    if (Number.isFinite(exp)) base["experienceYears"] = exp;
    base["officerId"] = form["officerId"] ?? "";
    base["district"] = form["district"] ?? "";
    base["state"] = form["state"] ?? "";
    return base;
  }
  return base;
}

export function ProfilePage(props: { role: Role }) {
  const role = props.role;
  const store = useStore();
  const user = store.user;
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [form, setForm] = useState<FormState>({});
  const roleRef = useRef<Role>(role);
  roleRef.current = role;
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetchMyProfile();
      setData(res);
      setForm(blankProfileForm(roleRef.current, res));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load profile.";
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  function onChange(key: string): ChangeHandler {
    return (e: FieldChange) => {
      const v = e.target.value;
      setForm((f) => ({ ...f, [key]: v }));
    };
  }
  async function onSave(): Promise<void> {
    setSaving(true);
    try {
      const payload = buildProfilePayload(role, form);
      const res = await updateMyProfile(payload);
      setData(res);
      setForm(blankProfileForm(role, res));
      setEdit(false);
      toast.success("Profile updated successfully");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update profile.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }
  if (!user) return null;
  if (loading) {
    return (
      <div>
        <PageHeader title="My Profile" subtitle="Loading..." breadcrumb={["Dashboard", "Profile"]} />
        <Card className="p-8 text-center text-sm text-muted-foreground">Loading profile...</Card>
      </div>
    );
  }
  if (loadError || !data) {
    return (
      <div>
        <PageHeader title="My Profile" subtitle="Error" breadcrumb={["Dashboard", "Profile"]} />
        <Card className="space-y-3 p-6 text-center">
          <p className="text-sm text-destructive">{loadError ?? "Failed to load profile."}</p>
          <Button variant="outline" onClick={() => void load()}>Retry</Button>
        </Card>
      </div>
    );
  }
  const profile = data as ProfileResponse;
  const displayName = profile.user?.name || user.name;
  const displayEmail = profile.user?.email || "";
  const initials = "SK";
  const defs = fieldsForRole(role);
  const completed = profile.profileCompleted;
  const title = role === "buyer" || role === "seller" ? "Business Profile" : "My Profile";
  if (role === "admin") {
    return <AdminView displayName={displayName} displayEmail={displayEmail} subtitle={user.subtitle} initials={user.initials} />;
  }
  return (
    <div>
      <PageHeader
        title={title}
        subtitle={displayEmail}
        breadcrumb={["Dashboard", "Profile"]}
        action={
          <Button variant={edit ? "default" : "outline"} disabled={saving} onClick={() => { if (edit) void onSave(); else setEdit(true); }}>
            {saving ? "Saving..." : edit ? "Save Changes" : "Edit Profile"}
          </Button>
        }
      />
      <ProfileBody
        completed={completed}
        edit={edit}
        defs={defs}
        form={form}
        displayName={displayName}
        displayEmail={displayEmail}
        role={role}
        saving={saving}
        onDiscard={() => void load()}
        onChange={onChange}
        onEdit={() => setEdit(true)}
        onSave={() => void onSave()}
      />
    </div>
  );
}

interface AdminViewProps {
  displayName: string;
  displayEmail: string;
  subtitle: string;
  initials: string;
}

function AdminView(props: AdminViewProps) {
  return (
    <div>
      <PageHeader title="My Profile" subtitle="Admin" breadcrumb={["Dashboard", "Profile"]} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 p-6 text-center">
          <div className="mx-auto grid size-24 place-items-center rounded-full bg-pale text-2xl font-bold text-forest">{props.initials}</div>
          <h2 className="mt-4 text-lg font-semibold">{props.displayName}</h2>
          <p className="text-sm text-muted-foreground">{t(props.subtitle)}</p>
          <StatusBadge status="Verified" />
        </Card>
        <div className="grid gap-4 lg:col-span-2">
          <SectionCard title="Administrator">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="text-xs text-muted-foreground">Name</Label><p className="mt-1 text-sm font-medium">{props.displayName}</p></div>
              <div><Label className="text-xs text-muted-foreground">Email</Label><p className="mt-1 text-sm font-medium">{props.displayEmail}</p></div>
              <div><Label className="text-xs text-muted-foreground">Role</Label><p className="mt-1 text-sm font-medium">ADMIN</p></div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

interface ProfileBodyProps {
  completed: boolean;
  edit: boolean;
  defs: FieldDef[];
  form: FormState;
  displayName: string;
  displayEmail: string;
  role: Role;
  saving: boolean;
  onDiscard: () => void;
  onEdit: () => void;
  onSave: () => void;
  onChange: (key: string) => ChangeHandler;
}

function ProfileBody(props: ProfileBodyProps) {
  return (
    <div>
      {!props.completed && !props.edit ? (
        <Card className="mb-4 border-dashed p-4 text-sm text-muted-foreground">Your profile is incomplete. Click Edit Profile to complete it.</Card>
      ) : null}
      {props.edit ? (
        <div className="mb-4 flex justify-end">
          <Button variant="ghost" size="sm" disabled={props.saving} onClick={props.onDiscard}>Discard changes</Button>
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 p-6 text-center">
          <div className="mx-auto grid size-24 place-items-center rounded-full bg-pale text-2xl font-bold text-forest">SK</div>
          <h2 className="mt-4 text-lg font-semibold">{props.displayName}</h2>
          <p className="text-sm text-muted-foreground">{props.displayEmail}</p>
          <StatusBadge status="Verified" />
        </Card>
        <div className="grid gap-4 lg:col-span-2">
          <SectionCard title="Profile Information" desc="Role-specific fields only.">
            <ProfileFields defs={props.defs} form={props.form} edit={props.edit} displayEmail={props.displayEmail} onChange={props.onChange} />
          </SectionCard>
          {props.role === "officer" ? <OfficerCertSummary /> : null}
        </div>
      </div>
    </div>
  );
}

interface ProfileFieldsProps {
  defs: FieldDef[];
  form: FormState;
  edit: boolean;
  displayEmail: string;
  onChange: (key: string) => ChangeHandler;
}

function ProfileFields(props: ProfileFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {props.defs.map((f) => (
        <ProfileField key={f.key} def={f} value={props.form[f.key] ?? ""} editing={props.edit} onChange={props.onChange(f.key)} />
      ))}
      <div>
        <Label className="text-xs text-muted-foreground">Email (read-only)</Label>
        <p className="mt-1 text-sm font-medium">{props.displayEmail || "—"}</p>
      </div>
    </div>
  );
}

interface ProfileFieldProps {
  def: FieldDef;
  value: string;
  editing: boolean;
  onChange: ChangeHandler;
}

function ProfileField(props: ProfileFieldProps) {
  if (!props.editing) {
    return (
      <div>
        <Label className="text-xs text-muted-foreground">{props.def.label}</Label>
        <p className="mt-1 text-sm font-medium">{props.value ? props.value : "—"}</p>
      </div>
    );
  }
  if (props.def.type === "textarea") {
    return (
      <div>
        <Label className="text-xs text-muted-foreground">{props.def.label}</Label>
        <Textarea value={props.value} onChange={props.onChange} className="mt-1" maxLength={1000} />
      </div>
    );
  }
  if (props.def.type === "select") {
    const opts = props.def.options ?? [];
    return (
      <div>
        <Label className="text-xs text-muted-foreground">{props.def.label}</Label>
        <select value={props.value} onChange={props.onChange} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
          {opts.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    );
  }
  const inputType = props.def.type === "number" ? "number" : "text";
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{props.def.label}</Label>
      <Input value={props.value} onChange={props.onChange} className="mt-1" maxLength={300} type={inputType} />
    </div>
  );
}

function OfficerCertSummary() {
  const store = useStore();
  const officer = store.officers.find((o) => o.id === "OF1") ?? store.officers[0];
  if (!officer) return null;
  const progress = certProgress(officer);
  return (
    <SectionCard
      title={t("Certifications")}
      desc={t("Your professional certificates and their verification status with the Admin team.")}
      action={
        <Link to="/app/$" params={{ _splat: "officer/certifications" }}>
          <Button size="sm" variant="outline">{t("View all")}</Button>
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
        {progress.verified} {t("of")} {progress.total} {t("documents verified")}
      </p>
    </SectionCard>
  );
}



