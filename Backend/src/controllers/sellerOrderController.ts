import type { Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { AppError } from "../services/authService.js";
import {
  getSellerOrderById,
  listSellerOrders,
  updateSellerOrderStatus,
} from "../services/sellerOrderService.js";
import {
  sellerOrderStatusSchema,
  sellerOrdersFilterSchema,
} from "../validators/orderValidator.js";
import type { OrderStatus } from "../generated/prisma/client.js";

function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  return first?.message ?? "Validation failed";
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  console.error("Seller order error:", error);
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

export async function getSellerOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const parsed = sellerOrdersFilterSchema.safeParse({
      status: cleanQuery(req.query["status"]),
      search: cleanQuery(req.query["search"]),
    });
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const orders = await listSellerOrders(req.user.userId, parsed.data);
    res.status(200).json({ success: true, orders });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getSellerOrderDetail(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const id = parseId(req.params["id"]);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid order id" });
      return;
    }
    const order = await getSellerOrderById(req.user.userId, id);
    res.status(200).json({ success: true, order });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function patchSellerOrderStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const id = parseId(req.params["id"]);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid order id" });
      return;
    }
    const parsed = sellerOrderStatusSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const order = await updateSellerOrderStatus(
      req.user.userId,
      id,
      parsed.data.status as OrderStatus,
    );
    res.status(200).json({ success: true, message: "Order status updated", order });
  } catch (error: unknown) {
    handleError(res, error);
  }
}
