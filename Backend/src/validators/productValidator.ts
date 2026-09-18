import { z } from "zod";

export const productCategories = [
  "VEGETABLE",
  "FRUIT",
  "GRAIN",
  "PULSE",
  "COMMERCIAL_CROP",
  "OTHER",
] as const;

export const productUnits = ["KG", "QUINTAL", "TON", "PIECE"] as const;

export const listingStatuses = ["ACTIVE", "OUT_OF_STOCK", "INACTIVE"] as const;

/**
 * Quantity/price behaviour: quantity is never allowed below 0.
 * If quantity is set to exactly 0, the listing automatically becomes
 * OUT_OF_STOCK (unless the caller explicitly deactivates it with INACTIVE).
 * See productService for the enforcement.
 */
const quantityField = z.coerce
  .number({ error: "Quantity must be a number" })
  .min(0, "Quantity cannot be negative")
  .max(1000000000, "Quantity is too large");

const priceField = z.coerce
  .number({ error: "Price must be a number" })
  .gt(0, "Price must be greater than 0")
  .max(1000000000, "Price is too large");

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(100),
  category: z.enum(productCategories, {
    error: "Category must be one of: VEGETABLE, FRUIT, GRAIN, PULSE, COMMERCIAL_CROP, OTHER",
  }),
  grade: z.string().trim().max(20).optional(),
  description: z.string().trim().max(5000).optional(),
  quantity: quantityField.refine((v) => v > 0, {
    message: "Quantity must be greater than 0",
  }),
  unit: z.enum(productUnits, { error: "Unit must be one of: KG, QUINTAL, TON, PIECE" }),
  price: priceField,
  location: z.string().trim().min(1, "Location is required").max(200),
  // Optional placeholder only — no upload handling in this module.
  imageUrl: z.string().trim().max(2000).optional(),
});

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1, "Product name is required").max(100).optional(),
    category: z
      .enum(productCategories, {
        error: "Category must be one of: VEGETABLE, FRUIT, GRAIN, PULSE, COMMERCIAL_CROP, OTHER",
      })
      .optional(),
    grade: z.string().trim().max(20).optional(),
    description: z.string().trim().max(5000).optional(),
    quantity: quantityField.optional(),
    unit: z
      .enum(productUnits, { error: "Unit must be one of: KG, QUINTAL, TON, PIECE" })
      .optional(),
    price: priceField.optional(),
    location: z.string().trim().min(1, "Location is required").max(200).optional(),
    status: z
      .enum(listingStatuses, {
        error: "Status must be one of: ACTIVE, OUT_OF_STOCK, INACTIVE",
      })
      .optional(),
    imageUrl: z.string().trim().max(2000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const myProductsFilterSchema = z.object({
  status: z
    .enum(listingStatuses, {
      error: "Status must be one of: ACTIVE, OUT_OF_STOCK, INACTIVE",
    })
    .optional(),
  category: z
    .enum(productCategories, {
      error: "Category must be one of: VEGETABLE, FRUIT, GRAIN, PULSE, COMMERCIAL_CROP, OTHER",
    })
    .optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export const marketplaceFilterSchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  category: z
    .enum(productCategories, {
      error: "Category must be one of: VEGETABLE, FRUIT, GRAIN, PULSE, COMMERCIAL_CROP, OTHER",
    })
    .optional(),
  location: z.string().trim().min(1).max(200).optional(),
  minPrice: z.coerce.number({ error: "minPrice must be a number" }).min(0).optional(),
  maxPrice: z.coerce.number({ error: "maxPrice must be a number" }).min(0).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type MyProductsFilterInput = z.infer<typeof myProductsFilterSchema>;
export type MarketplaceFilterInput = z.infer<typeof marketplaceFilterSchema>;
