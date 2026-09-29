import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
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
import { fetchAdminOrders } from "@/lib/skl/adminMonitor";
import { orderStatusLabel, type BackendOrder } from "@/lib/skl/orders";

export function AdminRealOrdersPage() {
  const [status, setStatus] = useState("All");
  const [buyer, setBuyer] = useState("");
  const [seller, setSeller] = useState("");
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<BackendOrder[]>([]);
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
        const res = await fetchAdminOrders({ status, buyer, seller, page, limit: 20 });
        if (cancelled) return;
        setOrders(res.orders);
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
  }, [status, buyer, seller, page]);

  return (
    <>
      <PageHeader title="Orders" subtitle={t("Monitor all buyer/seller orders.")} breadcrumb={["Admin", "Orders"]} />
      <Card className="mb-4 grid gap-3 p-4 md:grid-cols-3">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["All", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={buyer} onChange={(e) => { setBuyer(e.target.value); setPage(1); }} placeholder="Filter by buyer" />
        <Input value={seller} onChange={(e) => { setSeller(e.target.value); setPage(1); }} placeholder="Filter by seller" />
      </Card>
      {loading && <LoaderState label="Loading orders..." />}
      {!loading && error && <ErrorState title="Failed to load orders" desc={error} />}
      {!loading && !error && orders.length === 0 && (
        <EmptyState icon={Receipt} title="No orders found" desc="Try different filters." />
      )}
      {!loading && !error && orders.length > 0 && (
        <SectionCard title={`${total} Orders`}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">#{o.id}</TableCell>
                    <TableCell>{o.buyer?.name ?? o.buyerId}</TableCell>
                    <TableCell>{o.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}</TableCell>
                    <TableCell>Rs.{o.totalAmount}</TableCell>
                    <TableCell>{orderStatusLabel(o.status)}</TableCell>
                    <TableCell>{new Date(o.createdAt).toLocaleDateString("en-IN")}</TableCell>
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
