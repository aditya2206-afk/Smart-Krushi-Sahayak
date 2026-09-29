import type { Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { AppError } from "../services/authService.js";
import {
  listAdminListings,
  updateAdminListingStatus,
} from "../services/adminListingService.js";
import { listAdminOrders, listAdminQueries } from "../services/adminMonitorService.js";
import {
  adminListingFilterSchema,
  adminOrderFilterSchema,
  adminQueryFilterSchema,
  updateListingStatusSchema,
} from "../validators/adminValidator.js";
import type { ListingStatus } from "../generated/prisma/client.js";

function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  return first?.message ?? "Validation failed";
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  console.error("Admin error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
}

function parseId(raw: string | string[] | undefined): number | null {
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (typeof first !== "string") return null;
  const id = Number(first);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function clean(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first !== "string") return undefined;
  const t = first.trim();
  return t === "" ? undefined : t;
}

export async function getListings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const category = clean(req.query["category"]);
    const status = clean(req.query["status"]);
    const parsed = adminListingFilterSchema.safeParse({
      search: clean(req.query["search"]),
      seller: clean(req.query["seller"]),
      category: category ? category.toUpperCase() : undefined,
      status: status ? status.toUpperCase() : undefined,
      page: req.query["page"],
      limit: req.query["limit"],
    });
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const result = await listAdminListings(parsed.data);
    res.status(200).json({ success: true, ...result });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function patchListingStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseId(req.params["id"]);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid listing id" });
      return;
    }
    const rawStatus = (req.body as { status?: unknown } | undefined)?.status;
    const parsed = updateListingStatusSchema.safeParse({
      status: typeof rawStatus === "string" ? rawStatus.toUpperCase() : rawStatus,
    });
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const listing = await updateAdminListingStatus(id, parsed.data.status as ListingStatus);
    res.status(200).json({ success: true, message: "Listing status updated", listing });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const status = clean(req.query["status"]);
    const parsed = adminOrderFilterSchema.safeParse({
      status: status ? status.toUpperCase() : undefined,
      buyer: clean(req.query["buyer"]),
      seller: clean(req.query["seller"]),
      date: clean(req.query["date"]),
      page: req.query["page"],
      limit: req.query["limit"],
    });
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const result = await listAdminOrders(parsed.data);
    res.status(200).json({ success: true, ...result });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getQueries(req: AuthRequest, res: Response): Promise<void> {
  try {
    const status = clean(req.query["status"]);
    const parsed = adminQueryFilterSchema.safeParse({
      status: status ? status.toUpperCase() : undefined,
      farmer: clean(req.query["farmer"]),
      officer: clean(req.query["officer"]),
      search: clean(req.query["search"]),
      page: req.query["page"],
      limit: req.query["limit"],
    });
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const result = await listAdminQueries(parsed.data);
    res.status(200).json({ success: true, ...result });
  } catch (error: unknown) {
    handleError(res, error);
  }
}
