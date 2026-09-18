import productImg from "@/assets/product-generic.jpg";
import tomatoImg from "@/assets/produce-tomato.jpg";
import potatoImg from "@/assets/produce-potato.jpg";
import chilliImg from "@/assets/produce-chilli.jpg";
import wheatImg from "@/assets/produce-wheat.jpg";
import sugarcaneImg from "@/assets/produce-sugarcane.jpg";
import onionImg from "@/assets/crop-onion.jpg";
import grapesImg from "@/assets/produce-grapes.jpg";
import { API_BASE_URL, getStoredToken } from "./auth";

export type BackendProductCategory =
  | "VEGETABLE"
  | "FRUIT"
  | "GRAIN"
  | "PULSE"
  | "COMMERCIAL_CROP"
  | "OTHER";

export type BackendProductUnit = "KG" | "QUINTAL" | "TON" | "PIECE";

export type BackendListingStatus = "ACTIVE" | "OUT_OF_STOCK" | "INACTIVE";

export interface BackendSellerInfo {
  id: number;
  name: string;
  sellerProfile: {
    businessName: string | null;
    district: string | null;
    state: string | null;
  } | null;
}

export interface BackendProduct {
  id: number;
  sellerId: number;
  name: string;
  category: BackendProductCategory;
  grade: string | null;
  description: string | null;
  quantity: number;
  unit: BackendProductUnit;
  price: number;
  location: string;
  imageUrl: string | null;
  status: BackendListingStatus;
  createdAt: string;
  updatedAt: string;
  seller?: BackendSellerInfo;
}

export interface CreateProductPayload {
  name: string;
  category: BackendProductCategory;
  grade?: string | undefined;
  description?: string | undefined;
  quantity: number;
  unit: BackendProductUnit;
  price: number;
  location: string;
}

export type UpdateProductPayload = Partial<
  CreateProductPayload & { status: BackendListingStatus }
>;

export interface MyProductsParams {
  status?: BackendListingStatus | "";
  category?: BackendProductCategory | "";
  search?: string | undefined;
}

export interface MarketplaceParams {
  search?: string | undefined;
  category?: BackendProductCategory | "";
  location?: string | undefined;
  minPrice?: string | undefined;
  maxPrice?: string | undefined;
}

const CATEGORIES: BackendProductCategory[] = [
  "VEGETABLE",
  "FRUIT",
  "GRAIN",
  "PULSE",
  "COMMERCIAL_CROP",
  "OTHER",
];

const UNITS: BackendProductUnit[] = ["KG", "QUINTAL", "TON", "PIECE"];

export const PRODUCT_CATEGORY_OPTIONS = CATEGORIES.map((v) => ({ value: v, label: v }));
export const PRODUCT_UNIT_OPTIONS = UNITS.map((v) => ({ value: v, label: v }));
export const LISTING_STATUS_OPTIONS: BackendListingStatus[] = [
  "ACTIVE",
  "OUT_OF_STOCK",
  "INACTIVE",
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
async function publicRequest<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(await parseError(res, "Request failed."));
  return (await res.json()) as T;
}

function toQuery(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v.trim() !== "") q.set(k, v.trim());
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function sellerDisplayName(seller?: BackendSellerInfo): string {
  if (!seller) return "Seller";
  return seller.sellerProfile?.businessName?.trim() || seller.name;
}

export function categoryPlaceholderImage(name: string): string {
  const n = name.trim().toLowerCase();
  if (n.includes("tomato")) return tomatoImg;
  if (n.includes("onion")) return onionImg;
  if (n.includes("potato") || n.includes("brinjal") || n.includes("cabbage")) return potatoImg;
  if (n.includes("chilli")) return chilliImg;
  if (n.includes("wheat") || n.includes("soybean") || n.includes("pulse")) return wheatImg;
  if (n.includes("sugarcane")) return sugarcaneImg;
  if (n.includes("grape")) return grapesImg;
  return productImg;
}

export function backendCategoryLabel(c: string): string {
  switch (c) {
    case "VEGETABLE":
      return "Vegetable";
    case "FRUIT":
      return "Fruit";
    case "GRAIN":
      return "Grain";
    case "PULSE":
      return "Pulse";
    case "COMMERCIAL_CROP":
      return "Commercial Crop";
    default:
      return "Other";
  }
}

export function backendStatusLabel(s: BackendListingStatus): string {
  switch (s) {
    case "ACTIVE":
      return "Available";
    case "OUT_OF_STOCK":
      return "Sold Out";
    default:
      return "Unavailable";
  }
}

export function friendlyProductError(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return "Cannot reach the server at http://localhost:5000. Is the backend running?";
  }
  return msg || fallback;
}

export async function createProduct(payload: CreateProductPayload): Promise<BackendProduct> {
  const body = await request<{ success: boolean; product: BackendProduct }>("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return body.product;
}

export async function fetchMyProducts(params: MyProductsParams = {}): Promise<BackendProduct[]> {
  const query = toQuery({
    status: params.status || undefined,
    category: params.category || undefined,
    search: params.search,
  });
  const body = await request<{ success: boolean; products: BackendProduct[] }>(
    `/api/products/my${query}`,
  );
  return body.products;
}

export async function fetchMarketplaceProducts(
  params: MarketplaceParams = {},
): Promise<BackendProduct[]> {
  const query = toQuery({
    search: params.search,
    category: params.category || undefined,
    location: params.location,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
  });
  const body = await publicRequest<{ success: boolean; products: BackendProduct[] }>(
    `/api/products${query}`,
  );
  return body.products;
}

export async function fetchProductById(id: number): Promise<BackendProduct> {
  const headers = authHeaders();
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { headers });
  if (!res.ok) throw new Error(await parseError(res, "Product not found."));
  const body = (await res.json()) as { success: boolean; product: BackendProduct };
  return body.product;
}

export async function updateProduct(
  id: number,
  payload: UpdateProductPayload,
): Promise<BackendProduct> {
  const body = await request<{ success: boolean; product: BackendProduct }>(
    `/api/products/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
  return body.product;
}

export async function deleteProduct(id: number): Promise<void> {
  await request<{ success: boolean }>(`/api/products/${id}`, { method: "DELETE" });
}

