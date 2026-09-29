import { useEffect, useState } from "react";
import { Search, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  SectionCard,
} from "@/components/skl/common";
import { t } from "@/lib/skl/i18n";
import { fetchAdminListings, updateAdminListingStatus } from "@/lib/skl/adminMonitor";
import {
  backendCategoryLabel,
  backendStatusLabel,
  sellerDisplayName,
  type BackendProduct,
} from "@/lib/skl/products";

export function AdminRealProductsPage() {
  const [search, setSearch] = useState("");
  const [seller, setSeller] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState<BackendProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchAdminListings({ search, seller, category, status, page, limit: 20 });
        if (cancelled) return;
        setListings(res.listings);
        setTotal(res.pagination.total);
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
  }, [search, seller, category, status, page]);

  async function toggleListing(l: BackendProduct) {
    const next = l.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setBusyId(l.id);
    try {
      const updated = await updateAdminListingStatus(l.id, next as BackendProduct["status"]);
      setListings((prev) => prev.map((x) => (x.id === l.id ? updated : x)));
      toast.success(next === "ACTIVE" ? "Listing enabled." : "Listing hidden.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update listing.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Produce Listings"
        subtitle={t("All seller listings from PostgreSQL. Hide inappropriate listings.")}
        breadcrumb={["Admin", "Produce Listings"]}
      />
      <Card className="mb-4 grid gap-3 p-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search produce" className="pl-9" />
        </div>
        <Input value={seller} onChange={(e) => { setSeller(e.target.value); setPage(1); }} placeholder="Filter by seller" />
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["All", "VEGETABLE", "FRUIT", "GRAIN", "PULSE", "COMMERCIAL_CROP", "OTHER"].map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["All", "ACTIVE", "OUT_OF_STOCK", "INACTIVE"].map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>
      {loading && <LoaderState label="Loading listings..." />}
      {!loading && error && <ErrorState title="Failed to load listings" desc={error} />}
      {!loading && !error && listings.length === 0 && (
        <EmptyState icon={Package} title="No listings found" desc="Try different filters." />
      )}
      {!loading && !error && listings.length > 0 && (
        <SectionCard title={`${total} Listings`}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell>{sellerDisplayName(l.seller)}</TableCell>
                    <TableCell>{backendCategoryLabel(l.category)}</TableCell>
                    <TableCell>{l.quantity} {l.unit}</TableCell>
                    <TableCell>Rs.{l.price}</TableCell>
                    <TableCell>{backendStatusLabel(l.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" disabled={busyId === l.id} onClick={() => toggleListing(l)}>
                        {l.status === "ACTIVE" ? "Hide" : "Enable"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}
    </>
  );
}
