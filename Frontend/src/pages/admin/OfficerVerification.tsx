import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Search, ShieldCheck, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent } from "@/components/ui/select";
import { SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, PageHeader, StatCard } from "@/components/skl/common";
import { SectionCard } from "@/components/skl/common";
import { adminFetchOfficers } from "@/lib/skl/adminVerification";
import type { AdminOfficerRow } from "@/lib/skl/adminVerification";
import { t } from "@/lib/skl/i18n";

const FILTERS = ["All", "Pending", "Verified", "Rejected", "Re-upload Required"];
const BADGE: Record<string, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  REUPLOAD_REQUIRED: "Re-upload Required",
};

export function AdminOfficerVerificationPage() {
  const [rows, setRows] = useState<AdminOfficerRow[]>([]);
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetchOfficers({ status, search, page, limit: 20 });
      setRows(res.officers);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load officers.");
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <>
      <PageHeader
        title={t("Krushi Adhikari Verification")}
        subtitle={t("Review real officer accounts, documents and verification status.")}
        breadcrumb={["Admin", "Krushi Adhikaris"]}
      />
      <OfficerStats rows={rows} total={total} />
      <Card className="my-4 gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                setSearch(q);
              }
            }}
            placeholder={t("Search by name or email")}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => { setPage(1); setSearch(q); }}>{t("Search")}</Button>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="lg:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FILTERS.map((v) => <SelectItem key={v} value={v}>{t(v)}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>
      {loading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Loading officers…</Card>
      ) : error ? (
        <EmptyState icon={Users} title="Could not load officers" desc={error}
          action={<Button variant="outline" onClick={() => void load()}>Retry</Button>} />
      ) : rows.length === 0 ? (
        <EmptyState icon={Users} title={t("No Krushi Adhikaris found")} desc={t("Try a different keyword or filter.")} />
      ) : (
        <OfficerTable rows={rows} page={page} totalPages={totalPages} total={total} setPage={setPage} />
      )}
    </>
  );
}

function OfficerStats(props: { rows: AdminOfficerRow[]; total: number }) {
  const { rows, total } = props;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Users} label={t("Officers")} value={total} />
      <StatCard icon={ShieldCheck} label={t("Pending")} value={rows.filter((r) => r.verificationStatus === "PENDING").length} tone="warning" />
      <StatCard icon={BadgeCheck} label={t("Verified")} value={rows.filter((r) => r.verificationStatus === "VERIFIED").length} tone="forest" />
      <StatCard icon={XCircle} label={t("Needs Action")} value={rows.filter((r) => r.verificationStatus === "REJECTED" || r.verificationStatus === "REUPLOAD_REQUIRED").length} tone="harvest" />
    </div>
  );
}

function OfficerTable(props: {
  rows: AdminOfficerRow[];
  page: number;
  totalPages: number;
  total: number;
  setPage: (fn: (p: number) => number) => void;
}) {
  const { rows, page, totalPages, total, setPage } = props;
  return (
    <SectionCard title={`${total} Krushi Adhikaris`}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Name")}</TableHead>
              <TableHead>{t("Email")}</TableHead>
              <TableHead>{t("Verification")}</TableHead>
              <TableHead>{t("Documents")}</TableHead>
              <TableHead className="text-right">{t("Action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="rounded-full">{BADGE[r.verificationStatus] ?? r.verificationStatus}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {r.documentSummary.total} docs • {r.documentSummary.VERIFIED} verified
                </TableCell>
                <TableCell className="text-right">
                  <Link to="/app/$" params={{ _splat: `admin/officers/${r.id}` }}>
                    <Button size="sm" variant="outline">{t("View")}</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </SectionCard>
  );
}
