import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
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
  PaginationControls,
  SectionCard,
} from "@/components/skl/common";
import { useStore } from "@/lib/skl/store";
import { t } from "@/lib/skl/i18n";
import { fetchAdminUsers, updateAdminUserStatus, type AdminUser } from "@/lib/skl/admin";

const ROLE_OPTIONS = ["All", "FARMER", "SELLER", "BUYER", "OFFICER", "ADMIN"];
const STATUS_OPTIONS = ["All", "active", "inactive"];

export function AdminRealUsersPage({ presetRole }: { presetRole?: string }) {
  const { authUser } = useStore();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(presetRole ? presetRole.toUpperCase() : "All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    setRole(presetRole ? presetRole.toUpperCase() : "All");
    setPage(1);
  }, [presetRole]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchAdminUsers({ role, status, search, page, limit: 20 });
        if (cancelled) return;
        setUsers(res.users);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load users.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [role, status, search, page]);
  async function toggleStatus(u: AdminUser) {
    if (authUser && u.id === authUser.id) {
      toast.error("You cannot deactivate your own admin account.");
      return;
    }
    setBusyId(u.id);
    try {
      const updated = await updateAdminUserStatus(u.id, !u.isActive);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: updated.isActive } : x)));
      toast.success(updated.isActive ? "User activated." : "User deactivated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status.");
    } finally {
      setBusyId(null);
    }
  }

  const title = presetRole ? `${presetRole}s` : "User Management";

  return (
    <>
      <PageHeader
        title={title}
        subtitle={t("Live users from PostgreSQL. Search, filter and activate/deactivate accounts.")}
        breadcrumb={["Admin", title]}
      />
      <Card className="mb-4 flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t("Search by name or email")}
            className="pl-9"
          />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
          <SelectTrigger className="lg:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="lg:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>
      {loading && <LoaderState label={t("Loading users...")} />}
      {!loading && error && <ErrorState title={t("Failed to load users")} desc={error} />}
      {!loading && !error && users.length === 0 && (
        <EmptyState icon={Users} title={t("No users found")} desc={t("Try a different keyword or filter.")} />
      )}
      {!loading && !error && users.length > 0 && (
        <SectionCard title={`${total} Users`}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Name")}</TableHead>
                  <TableHead>{t("Email")}</TableHead>
                  <TableHead>{t("Role")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead>{t("Joined")}</TableHead>
                  <TableHead className="text-right">{t("Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{u.isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className={u.isActive ? "text-destructive" : "text-primary"}
                        disabled={busyId === u.id}
                        onClick={() => toggleStatus(u)}
                      >
                        {u.isActive ? t("Deactivate") : t("Activate")}
                      </Button>
                    </TableCell>
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
