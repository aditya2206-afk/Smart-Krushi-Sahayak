import type { Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { AppError } from "../services/authService.js";
import {
  getAdminDashboard,
  getAdminUserById,
  listAdminUsers,
  updateAdminUserStatus,
} from "../services/adminService.js";
import {
  adminUserFilterSchema,
  updateUserStatusSchema,
} from "../validators/adminValidator.js";

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

export async function getDashboard(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = await getAdminDashboard();
    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const roleRaw = clean(req.query["role"]);
    const statusRaw = clean(req.query["status"]);
    const parsed = adminUserFilterSchema.safeParse({
      role: roleRaw ? roleRaw.toUpperCase() : undefined,
      status: statusRaw ? statusRaw.toLowerCase() : undefined,
      search: clean(req.query["search"]),
      page: req.query["page"],
      limit: req.query["limit"],
    });
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const result = await listAdminUsers(parsed.data);
    res.status(200).json({ success: true, ...result });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseId(req.params["id"]);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid user id" });
      return;
    }
    const user = await getAdminUserById(id);
    res.status(200).json({ success: true, user });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function patchUserStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    const id = parseId(req.params["id"]);
    if (id === null) {
      res.status(400).json({ success: false, message: "Invalid user id" });
      return;
    }
    const parsed = updateUserStatusSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ success: false, message: formatZodError(parsed.error) });
      return;
    }
    const user = await updateAdminUserStatus(id, parsed.data.isActive, req.user.userId);
    res.status(200).json({ success: true, message: "User status updated", user });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

