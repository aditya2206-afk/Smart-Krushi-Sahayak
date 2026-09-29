import { API_BASE_URL, authFetch } from "./auth";
import type { BackendOrder } from "./orders";
import type { BackendProduct, BackendListingStatus } from "./products";
import type { BackendQuery } from "./queries";
import { adminGet, adminParseBody, adminErrorMessage, type Pagination } from "./admin";

export interface AdminListingsParams {
  search?: string;
  seller?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function fetchAdminListings(
  params: AdminListingsParams = {},
): Promise<{ listings: BackendProduct[]; pagination: Pagination }> {
  const q = new URLSearchParams();
  if (params.search && params.search.trim()) q.set("search", params.search.trim());
  if (params.seller && params.seller.trim()) q.set("seller", params.seller.trim());
  if (params.category && params.category !== "All") q.set("category", params.category);
  if (params.status && params.status !== "All") q.set("status", params.status);
  q.set("page", String(params.page ?? 1));
  q.set("limit", String(params.limit ?? 20));
  const qs = q.toString();
  const path = qs ? `/api/admin/listings?${qs}` : "/api/admin/listings";
  const body = await adminGet<{ success: boolean; listings: BackendProduct[]; pagination: Pagination }>(
    path,
    "Failed to load listings.",
  );
  return { listings: body.listings ?? [], pagination: body.pagination };
}

export async function updateAdminListingStatus(
  id: number,
  status: BackendListingStatus,
): Promise<BackendProduct> {
  const res = await authFetch(`${API_BASE_URL}/api/admin/listings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const body = await adminParseBody(res);
  if (!res.ok) throw new Error(adminErrorMessage(res.status, body, "Failed to update listing."));
  return (body as { listing: BackendProduct }).listing;
}

export interface AdminOrdersParams {
  status?: string;
  buyer?: string;
  seller?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export async function fetchAdminOrders(
  params: AdminOrdersParams = {},
): Promise<{ orders: BackendOrder[]; pagination: Pagination }> {
  const q = new URLSearchParams();
  if (params.status && params.status !== "All") q.set("status", params.status);
  if (params.buyer && params.buyer.trim()) q.set("buyer", params.buyer.trim());
  if (params.seller && params.seller.trim()) q.set("seller", params.seller.trim());
  if (params.date && params.date.trim()) q.set("date", params.date.trim());
  q.set("page", String(params.page ?? 1));
  q.set("limit", String(params.limit ?? 20));
  const qs = q.toString();
  const path = qs ? `/api/admin/orders?${qs}` : "/api/admin/orders";
  const body = await adminGet<{ success: boolean; orders: BackendOrder[]; pagination: Pagination }>(
    path,
    "Failed to load orders.",
  );
  return { orders: body.orders ?? [], pagination: body.pagination };
}

export interface AdminQueriesParams {
  status?: string;
  farmer?: string;
  officer?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function fetchAdminQueries(
  params: AdminQueriesParams = {},
): Promise<{ queries: BackendQuery[]; pagination: Pagination }> {
  const q = new URLSearchParams();
  if (params.status && params.status !== "All") q.set("status", params.status);
  if (params.farmer && params.farmer.trim()) q.set("farmer", params.farmer.trim());
  if (params.officer && params.officer.trim()) q.set("officer", params.officer.trim());
  if (params.search && params.search.trim()) q.set("search", params.search.trim());
  q.set("page", String(params.page ?? 1));
  q.set("limit", String(params.limit ?? 20));
  const qs = q.toString();
  const path = qs ? `/api/admin/queries?${qs}` : "/api/admin/queries";
  const body = await adminGet<{ success: boolean; queries: BackendQuery[]; pagination: Pagination }>(
    path,
    "Failed to load queries.",
  );
  return { queries: body.queries ?? [], pagination: body.pagination };
}
