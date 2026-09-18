import type { Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { AppError } from "../services/authService.js";
import {
  createFarmerQuery,
  getMyQueries,
  getQueryByIdForFarmer,
  getQueryByIdForStaff,
} from "../services/queryService.js";
import { createQuerySchema } from "../validators/queryValidator.js";

function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  return first?.message ?? "Validation failed";
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  console.error("Query error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
}

function requireAuth(req: AuthRequest): number | null {
  if (!req.user) return null;
  return req.user.userId;
}

export async function createQuery(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = requireAuth(req);
    if (userId === null) {
      res.status(401).json({ success: false, message: "Authentication required. Please provide a valid Bearer token." });
      return;
    }
    const parsed = createQuerySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const query = await createFarmerQuery(userId, parsed.data);
    res.status(201).json({ success: true, message: "Query submitted successfully", query });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getMyFarmerQueries(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = requireAuth(req);
    if (userId === null) {
      res.status(401).json({ success: false, message: "Authentication required. Please provide a valid Bearer token." });
      return;
    }
    const queries = await getMyQueries(userId);
    res.status(200).json({ success: true, queries });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getFarmerQueryById(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required. Please provide a valid Bearer token." });
      return;
    }
    const queryId = Number(req.params.id);
    if (!Number.isInteger(queryId) || queryId <= 0) {
      res.status(400).json({ success: false, message: "Invalid query id" });
      return;
    }

    if (req.user.role === "FARMER") {
      const query = await getQueryByIdForFarmer(queryId, req.user.userId);
      res.status(200).json({ success: true, query });
      return;
    }

    const query = await getQueryByIdForStaff(queryId);
    res.status(200).json({ success: true, query });
  } catch (error: unknown) {
    handleError(res, error);
  }
}
