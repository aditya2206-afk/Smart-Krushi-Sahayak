import { API_BASE_URL, getStoredToken } from "./auth";

export type BackendOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface BackendOrderSellerInfo {
  id: number;
  name: string;
  email?: string;
  sellerProfile?: {
    businessName: string | null;
    district: string | null;
    state: string | null;
  } | null;
}

export interface BackendOrderBuyerInfo {
  id: number;
  name: string;
  email: string;
}

export interface BackendOrderItem {
  id: number;
  orderId: number;
  productId: number;
  sellerId: number;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  seller?: BackendOrderSellerInfo;
}

export interface BackendOrder {
  id: number;
  buyerId: number;
  status: BackendOrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  buyer?: BackendOrderBuyerInfo;
  items: BackendOrderItem[];
}

export const BACKEND_ORDER_STATUSES: BackendOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string };
    if (body && typeof body.message === "string" && body.message.trim()) return body.message;
  } catch {
    /* non-JSON body */
  }
  return fallback;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) throw new Error(await parseError(res, "Request failed."));
  return (await res.json()) as T;
}

export function orderStatusLabel(s: BackendOrderStatus): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export function friendlyOrderError(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return "Cannot reach the server at http://localhost:5000. Is the backend running?";
  }
  return msg || fallback;
}

export async function placeOrder(productId: number, quantity: number): Promise<BackendOrder> {
  const body = await request<{ success: boolean; message?: string; order: BackendOrder }>(
    "/api/orders",
    { method: "POST", body: JSON.stringify({ items: [{ productId, quantity }] }) },
  );
  return body.order;
}

export async function fetchMyOrders(): Promise<BackendOrder[]> {
  const body = await request<{ success: boolean; orders: BackendOrder[] }>("/api/orders/my");
  return body.orders;
}

export async function fetchBuyerOrderById(id: number): Promise<BackendOrder> {
  const body = await request<{ success: boolean; order: BackendOrder }>(`/api/orders/${id}`);
  return body.order;
}

export async function cancelMyOrder(id: number): Promise<void> {
  await request<{ success: boolean }>(`/api/orders/${id}/cancel`, { method: "PATCH" });
}

export interface SellerOrdersParams {
  status?: BackendOrderStatus | "";
  search?: string | undefined;
}

export async function fetchSellerOrders(params: SellerOrdersParams = {}): Promise<BackendOrder[]> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.search && params.search.trim()) q.set("search", params.search.trim());
  const suffix = q.toString() ? `?${q.toString()}` : "";
  const body = await request<{ success: boolean; orders: BackendOrder[] }>(
    `/api/seller/orders${suffix}`,
  );
  return body.orders;
}

export async function fetchSellerOrderById(id: number): Promise<BackendOrder> {
  const body = await request<{ success: boolean; order: BackendOrder }>(
    `/api/seller/orders/${id}`,
  );
  return body.order;
}

export async function updateSellerOrderStatus(
  id: number,
  status: "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
): Promise<BackendOrder> {
  const body = await request<{ success: boolean; order: BackendOrder }>(
    `/api/seller/orders/${id}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
  return body.order;
}
