import type { Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import type { QueryStatus } from "../generated/prisma/client.js";
import { AppError } from "../services/authService.js";
import {
  getQueryByIdForStaff,
  listOfficerQueries,
  respondToQuery,
  updateQueryStatus,
} from "../services/queryService.js";
import {
  officerQueryFilterSchema,
  respondToQuerySchema,
  updateQueryStatusSchema,
} from "../validators/queryValidator.js";

function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  return first?.message ?? "Validation failed";
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  console.error("Officer query error:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
}

export async function listQueries(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = officerQueryFilterSchema.safeParse(req.query ?? {});
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const queries = await listOfficerQueries(parsed.data);
    res.status(200).json({ success: true, queries });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getQueryDetail(req: AuthRequest, res: Response): Promise<void> {
  try {
    const queryId = Number(req.params.id);
    if (!Number.isInteger(queryId) || queryId <= 0) {
      res.status(400).json({ success: false, message: "Invalid query id" });
      return;
    }
    const query = await getQueryByIdForStaff(queryId);
    res.status(200).json({ success: true, query });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function changeQueryStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const queryId = Number(req.params.id);
    if (!Number.isInteger(queryId) || queryId <= 0) {
      res.status(400).json({ success: false, message: "Invalid query id" });
      return;
    }
    const parsed = updateQueryStatusSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const query = await updateQueryStatus(queryId, parsed.data.status as QueryStatus);
    res.status(200).json({ success: true, message: "Query status updated successfully", query });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function answerQuery(req: AuthRequest, res: Response): Promise<void> {
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
    const parsed = respondToQuerySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const result = await respondToQuery(queryId, req.user.userId, parsed.data);
    res.status(201).json({
      success: true,
      message: "Recommendation submitted successfully",
      recommendation: result.recommendation,
      query: result.query,
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}
