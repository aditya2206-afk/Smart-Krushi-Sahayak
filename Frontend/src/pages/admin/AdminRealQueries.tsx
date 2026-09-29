import { useEffect, useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EmptyState,
  ErrorState,
  LoaderState,
  PageHeader,
  PaginationControls,
  SectionCard,
} from "@/components/skl/common";
import { t } from "@/lib/skl/i18n";
import { fetchAdminQueries } from "@/lib/skl/adminMonitor";
import { formatQueryDate, type BackendQuery } from "@/lib/skl/queries";

export function AdminRealQueriesPage() {
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [queries, setQueries] = useState<BackendQuery[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchAdminQueries({ status, search, page, limit: 20 });
        if (cancelled) return;
        setQueries(res.queries);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [status, search, page]);

  return (
    <>
      <PageHeader title="Farmer Queries" subtitle={t("Monitor farmer to officer workflow.")} breadcrumb={["Admin", "Queries"]} />
      <Card className="mb-4 flex flex-col gap-3 p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search title, crop" className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["All", "PENDING", "IN_REVIEW", "ANSWERED", "CLOSED"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>
      {loading && <LoaderState label="Loading queries..." />}
      {!loading && error && <ErrorState title="Failed to load queries" desc={error} />}
      {!loading && !error && queries.length === 0 && (
        <EmptyState icon={ClipboardList} title="No queries found" desc="Try different filters." />
      )}
      {!loading && !error && queries.length > 0 && (
        <SectionCard title={`${total} Queries`}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queries.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">#{q.id}</TableCell>
                    <TableCell>{q.farmer?.name ?? q.farmerId}</TableCell>
                    <TableCell>{q.title}</TableCell>
                    <TableCell>{q.cropName}</TableCell>
                    <TableCell>{q.status}</TableCell>
                    <TableCell>{q.recommendation?.officer?.name ?? "-"}</TableCell>
                    <TableCell>{formatQueryDate(q.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationControls page={page} totalPages={totalPages} total={total} onPage={setPage} />
        </SectionCard>
      )}
    </>
  );
}
