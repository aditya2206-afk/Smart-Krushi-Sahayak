import type { Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { AppError } from "../services/authService.js";
import {
  cancelBuyerOrder,
  getBuyerOrderById,
  listBuyerOrders,
  placeOrder,
} from "../services/orderService.js";
import { createOrderSchema } from "../validators/orderValidator.js";

function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  return first?.message ?? "Validation failed";
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  console.error("Order error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
}

function parseId(raw: string | string[] | undefined): number | null {
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (typeof first !== "string") return null;
  const id = Number(first);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const parsed = createOrderSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const order = await placeOrder(req.user.userId, parsed.data);
    res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getMyOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const orders = await listBuyerOrders(req.user.userId);
    res.status(200).json({ success: true, orders });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
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
    const order = await getBuyerOrderById(req.user.userId, id);
    res.status(200).json({ success: true, order });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function cancelOrder(req: AuthRequest, res: Response): Promise<void> {
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
    await cancelBuyerOrder(req.user.userId, id);
    res.status(200).json({ success: true, message: "Order cancelled successfully" });
  } catch (error: unknown) {
    handleError(res, error);
  }
}
