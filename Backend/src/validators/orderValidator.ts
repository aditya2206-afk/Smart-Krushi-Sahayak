import { z } from "zod";

export const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatusInput = (typeof orderStatuses)[number];

const quantityField = z.coerce
  .number({ error: "Quantity must be a number" })
  .gt(0, "Quantity must be greater than 0")
  .max(1000000000, "Quantity is too large");

export const createOrderSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.coerce
            .number({ error: "productId must be a number" })
            .int("productId must be an integer")
            .positive("productId must be positive"),
          quantity: quantityField,
        }),
        { error: "items must be an array" },
      )
      .min(1, "At least one item is required")
      .max(50, "Too many items in one order"),
  })
  .strict();

export const sellerOrderStatusSchema = z
  .object({
    status: z.enum(
      ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const,
      { error: "Status must be one of: CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED" },
    ),
  })
  .strict();

export const sellerOrdersFilterSchema = z.object({
  status: z
    .enum(orderStatuses, {
      error: "Status must be one of: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED",
    })
    .optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type SellerOrderStatusInput = z.infer<typeof sellerOrderStatusSchema>;
export type SellerOrdersFilterInput = z.infer<typeof sellerOrdersFilterSchema>;
