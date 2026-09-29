import { Link } from "@tanstack/react-router";
import { Leaf, Loader2, Sprout, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/skl/store";
import { LANGS, t } from "@/lib/skl/i18n";

export function Logo({ compact = false, invert = false }: { compact?: boolean; invert?: boolean }) {
  const { t } = useStore();
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          invert ? "bg-white/15 text-white" : "brand-gradient text-primary-foreground",
        )}
      >
        <Sprout className="size-5" />
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block text-[15px] font-bold tracking-tight",
            invert ? "text-white" : "text-forest",
          )}
        >
          {t("brand")}
        </span>
        {!compact && (
          <span
            className={cn("block text-[11px]", invert ? "text-white/70" : "text-muted-foreground")}
          >
            {t("brandSub")}
          </span>
        )}
      </span>
    </Link>
  );
}

export function LanguageSelector({ invert = false }: { invert?: boolean }) {
  const { lang, setLang } = useStore();
  const current = LANGS.find((l) => l.code === lang)!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5 rounded-full",
            invert && "border-white/30 bg-white/10 text-white hover:bg-white/20",
          )}
        >
          <Leaf className="size-3.5" />
          {t(current.label)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGS.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}>
            <span className={cn(lang === l.code && "font-semibold text-primary")}>
              {t(l.label)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  action,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {breadcrumb && (
          <nav className="mb-1 text-xs text-muted-foreground">{breadcrumb.join(" › ")}</nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "primary" | "harvest" | "warning" | "destructive" | "forest";
}) {
  const tones: Record<string, string> = {
    primary: "bg-pale text-primary",
    forest: "bg-pale text-forest",
    harvest: "bg-harvest/15 text-harvest",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <Card className="hover-lift gap-0 p-4">
      <div className="flex items-center gap-3">
        <span className={cn("grid size-11 place-items-center rounded-xl", tones[tone])}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
      {hint && <p className="mt-3 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

const statusTones: Record<string, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30",
  "Under Review": "bg-harvest/15 text-harvest border-harvest/30",
  "Expert Replied": "bg-pale text-forest border-primary/30",
  "Follow-up Required": "bg-warning/15 text-warning border-warning/30",
  Resolved: "bg-primary/10 text-primary border-primary/30",
  Healthy: "bg-primary/10 text-primary border-primary/30",
  "Needs Attention": "bg-warning/15 text-warning border-warning/30",
  New: "bg-harvest/15 text-harvest border-harvest/30",
  Confirmed: "bg-pale text-forest border-primary/30",
  Packed: "bg-harvest/15 text-harvest border-harvest/30",
  "Ready for Pickup": "bg-pale text-forest border-primary/30",
  "Out for Delivery": "bg-pale text-forest border-primary/30",
  Completed: "bg-primary/10 text-primary border-primary/30",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/30",
  Available: "bg-primary/10 text-primary border-primary/30",
  "Low Stock": "bg-warning/15 text-warning border-warning/30",
  "Fast Moving": "bg-harvest/15 text-harvest border-harvest/30",
  Unavailable: "bg-muted text-muted-foreground border-border",
  "Sold Out": "bg-destructive/10 text-destructive border-destructive/30",
  Active: "bg-primary/10 text-primary border-primary/30",
  Verified: "bg-primary/10 text-primary border-primary/30",
  Suspended: "bg-destructive/10 text-destructive border-destructive/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  "Pending Verification": "bg-warning/15 text-warning border-warning/30",
  Rejected: "bg-destructive/10 text-destructive border-destructive/30",
  "Re-upload Required": "bg-harvest/15 text-harvest border-harvest/30",
  Expired: "bg-muted text-destructive border-destructive/30",
  "Action Required": "bg-harvest/15 text-harvest border-harvest/30",
};

export function StatusBadge({ status }: { status: string }) {
  const mapped =
    status === "PENDING"
      ? "Pending"
      : status === "IN_REVIEW"
        ? "Under Review"
        : status === "ANSWERED"
          ? "Expert Replied"
          : status === "CLOSED"
            ? "Resolved"
            : status;
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", statusTones[mapped] ?? "")}>
      {t(mapped)}
    </Badge>
  );
}

/** Subtle badge showing whether a market price moved up, down or stayed stable. */
export function TrendBadge({
  trend,
  change,
}: {
  trend: "Up" | "Down" | "Stable";
  change?: number;
}) {
  const tone =
    trend === "Up"
      ? "bg-primary/10 text-primary border-primary/30"
      : trend === "Down"
        ? "bg-destructive/10 text-destructive border-destructive/30"
        : "bg-muted text-muted-foreground border-border";
  const arrow = trend === "Up" ? "↑" : trend === "Down" ? "↓" : "—";
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", tone)}>
      {arrow} {change === undefined ? t(trend) : `${Math.abs(change)}%`}
    </Badge>
  );
}

export function trendOf(change: number): "Up" | "Down" | "Stable" {
  return change > 0 ? "Up" : change < 0 ? "Down" : "Stable";
}

export function LoaderState({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border bg-card px-6 py-14 text-sm text-muted-foreground">
      <Loader2 className="size-5 animate-spin text-primary" />
      {label ?? t("Loading...")}
    </div>
  );
}

export function ErrorState({
  title,
  desc,
  onRetry,
}: {
  title: string;
  desc: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-7" />
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{desc}</p>
      {onRetry && (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          {t("Try Again")}
        </Button>
      )}
    </div>
  );
}

export function PaginationControls({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        {t("Total")}: {total} • {t("Page")} {page} / {Math.max(totalPages, 1)}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          {t("Previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          {t("Next")}
        </Button>
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-pale text-primary">
        <Icon className="size-7" />
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  desc,
  children,
  action,
  className,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-0 p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
