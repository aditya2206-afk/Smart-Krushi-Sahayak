import type { Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { AppError } from "../services/authService.js";
import {
  createProduct,
  deactivateOwnProduct,
  getMarketplaceProductById,
  getOwnProductById,
  listMarketplaceProducts,
  listMyProducts,
  updateOwnProduct,
} from "../services/productService.js";
import {
  createProductSchema,
  marketplaceFilterSchema,
  myProductsFilterSchema,
  updateProductSchema,
} from "../validators/productValidator.js";

function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  return first?.message ?? "Validation failed";
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  console.error("Product error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
}

function parseId(raw: string | string[] | undefined): number | null {
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (typeof first !== "string") return null;
  const id = Number(first);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function cleanQuery(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first !== "string") return undefined;
  const t = first.trim();
  return t === "" ? undefined : t;
}

function cleanNumber(value: unknown): number | string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first !== "string" || first.trim() === "") return undefined;
  const n = Number(first);
  if (Number.isNaN(n)) return first;
  return n;
}

export async function createListing(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const parsed = createProductSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const product = await createProduct(req.user.userId, parsed.data);
    res.status(201).json({ success: true, message: "Product listed successfully", product });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getMyListings(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const parsed = myProductsFilterSchema.safeParse({
      status: cleanQuery(req.query["status"]),
      category: cleanQuery(req.query["category"]),
      search: cleanQuery(req.query["search"]),
    });
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const products = await listMyProducts(req.user.userId, parsed.data);
    res.status(200).json({ success: true, products });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getMarketplaceListings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = marketplaceFilterSchema.safeParse({
      search: cleanQuery(req.query["search"]),
      category: cleanQuery(req.query["category"]),
      location: cleanQuery(req.query["location"]),
      minPrice: cleanNumber(req.query["minPrice"]),
      maxPrice: cleanNumber(req.query["maxPrice"]),
    });
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    if (
      parsed.data.minPrice !== undefined &&
      parsed.data.maxPrice !== undefined &&
      parsed.data.minPrice > parsed.data.maxPrice
    ) {
      res.status(400).json({ success: false, message: "minPrice cannot exceed maxPrice" });
      return;
    }
    const products = await listMarketplaceProducts(parsed.data);
    res.status(200).json({ success: true, products });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getListingById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseId(req.params["id"]);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid product id" });
      return;
    }
    if (req.user?.role === "SELLER") {
      try {
        const owned = await getOwnProductById(id, req.user.userId);
        res.status(200).json({ success: true, product: owned });
        return;
      } catch (error: unknown) {
        if (error instanceof AppError && error.statusCode === 403) throw error;
      }
    }
    const product = await getMarketplaceProductById(id);
    res.status(200).json({ success: true, product });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function updateListing(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const id = parseId(req.params["id"]);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid product id" });
      return;
    }
    const parsed = updateProductSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const product = await updateOwnProduct(id, req.user.userId, parsed.data);
    res.status(200).json({ success: true, message: "Product updated successfully", product });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function deleteListing(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const id = parseId(req.params["id"]);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid product id" });
      return;
    }
    await deactivateOwnProduct(id, req.user.userId);
    res.status(200).json({ success: true, message: "Product removed successfully" });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

