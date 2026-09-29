import { z } from "zod";
import { listingStatuses } from "./productValidator.js";
import { queryStatuses } from "./queryValidator.js";
import { orderStatuses } from "./orderValidator.js";

export const adminRoles = ["FARMER", "SELLER", "BUYER", "OFFICER", "ADMIN"] as const;

export const updateUserStatusSchema = z
  .object({
    isActive: z.boolean({ error: "isActive must be a boolean" }),
  })
  .strict();

export const updateListingStatusSchema = z
  .object({
    status: z.enum(listingStatuses, {
      error: "Status must be one of: ACTIVE, OUT_OF_STOCK, INACTIVE",
    }),
  })
  .strict();

export const adminUserFilterSchema = z.object({
  role: z
    .enum(adminRoles, {
      error: "Role must be one of: FARMER, SELLER, BUYER, OFFICER, ADMIN",
    })
    .optional(),
  status: z
    .enum(["active", "inactive"], {
      error: "Status must be one of: active, inactive",
    })
    .optional(),
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminListingFilterSchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  seller: z.string().trim().min(1).max(100).optional(),
  category: z
    .enum(
      ["VEGETABLE", "FRUIT", "GRAIN", "PULSE", "COMMERCIAL_CROP", "OTHER"] as const,
      { error: "Invalid category" },
    )
    .optional(),
  status: z
    .enum(listingStatuses, { error: "Invalid listing status" })
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminOrderFilterSchema = z.object({
  status: z
    .enum(orderStatuses, { error: "Invalid order status" })
    .optional(),
  buyer: z.string().trim().min(1).max(100).optional(),
  seller: z.string().trim().min(1).max(100).optional(),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminQueryFilterSchema = z.object({
  status: z
    .enum(queryStatuses, { error: "Invalid query status" })
    .optional(),
  farmer: z.string().trim().min(1).max(100).optional(),
  officer: z.string().trim().min(1).max(100).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateListingStatusInput = z.infer<typeof updateListingStatusSchema>;
export type AdminUserFilterInput = z.infer<typeof adminUserFilterSchema>;
export type AdminListingFilterInput = z.infer<typeof adminListingFilterSchema>;
export type AdminOrderFilterInput = z.infer<typeof adminOrderFilterSchema>;
export type AdminQueryFilterInput = z.infer<typeof adminQueryFilterSchema>;
