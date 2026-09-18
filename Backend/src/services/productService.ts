import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "./authService.js";
import type {
  CreateProductInput,
  MyProductsFilterInput,
  UpdateProductInput,
} from "../validators/productValidator.js";

const safeSellerSelect = {
  id: true,
  name: true,
  sellerProfile: {
    select: { businessName: true, district: true, state: true },
  },
} satisfies Prisma.UserSelect;

const listingInclude = {
  seller: { select: safeSellerSelect },
} satisfies Prisma.ProduceListingInclude;

export type ProductWithSeller = Prisma.ProduceListingGetPayload<{
  include: typeof listingInclude;
}>;

function emptyToNull(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function toProductJson(listing: ProductWithSeller) {
  return {
    ...listing,
    quantity: Number(listing.quantity),
    price: Number(listing.price),
  };
}

export async function createProduct(sellerId: number, input: CreateProductInput) {
  const listing = await prisma.produceListing.create({
    data: {
      sellerId,
      name: input.name.trim(),
      category: input.category,
      grade: emptyToNull(input.grade) ?? null,
      description: emptyToNull(input.description) ?? null,
      quantity: input.quantity,
      unit: input.unit,
      price: input.price,
      location: input.location.trim(),
      imageUrl: emptyToNull(input.imageUrl) ?? null,
      status: "ACTIVE",
    },
    include: listingInclude,
  });
  return toProductJson(listing);
}

export async function listMyProducts(sellerId: number, filters: MyProductsFilterInput) {
  const where: Prisma.ProduceListingWhereInput = { sellerId };
  if (filters.status) where.status = filters.status;
  if (filters.category) where.category = filters.category;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { location: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  const listings = await prisma.produceListing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: listingInclude,
  });
  return listings.map(toProductJson);
}

export async function listMarketplaceProducts(
  filters: import("../validators/productValidator.js").MarketplaceFilterInput,
) {
  const where: Prisma.ProduceListingWhereInput = { status: "ACTIVE" };
  if (filters.category) where.category = filters.category;
  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }
  const andClauses: Prisma.ProduceListingWhereInput[] = [];
  if (filters.search) {
    andClauses.push({
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { location: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    andClauses.push({
      price: {
        ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
      },
    });
  }
  if (andClauses.length > 0) where.AND = andClauses;
  const listings = await prisma.produceListing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: listingInclude,
  });
  return listings.map(toProductJson);
}

export async function getMarketplaceProductById(productId: number) {
  const listing = await prisma.produceListing.findUnique({
    where: { id: productId },
    include: listingInclude,
  });
  if (!listing) throw new AppError("Product not found", 404);
  if (listing.status !== "ACTIVE") throw new AppError("Product not found", 404);
  return toProductJson(listing);
}

export async function getOwnProductById(productId: number, sellerId: number) {
  const listing = await prisma.produceListing.findUnique({
    where: { id: productId },
    include: listingInclude,
  });
  if (!listing) throw new AppError("Product not found", 404);
  if (listing.sellerId !== sellerId) {
    throw new AppError("You do not have permission to access this resource", 403);
  }
  return toProductJson(listing);
}

export async function updateOwnProduct(
  productId: number,
  sellerId: number,
  input: import("../validators/productValidator.js").UpdateProductInput,
) {
  const existing = await prisma.produceListing.findUnique({ where: { id: productId } });
  if (!existing) throw new AppError("Product not found", 404);
  if (existing.sellerId !== sellerId) {
    throw new AppError("You do not have permission to access this resource", 403);
  }
  const data: Prisma.ProduceListingUpdateInput = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.category !== undefined) data.category = input.category;
  if (input.grade !== undefined) data.grade = emptyToNull(input.grade) ?? null;
  if (input.description !== undefined) data.description = emptyToNull(input.description) ?? null;
  if (input.quantity !== undefined) data.quantity = input.quantity;
  if (input.unit !== undefined) data.unit = input.unit;
  if (input.price !== undefined) data.price = input.price;
  if (input.location !== undefined) data.location = input.location.trim();
  if (input.imageUrl !== undefined) data.imageUrl = emptyToNull(input.imageUrl) ?? null;
  const nextQuantity =
    input.quantity !== undefined ? input.quantity : Number(existing.quantity);
  if (input.status !== undefined) {
    data.status = input.status;
  } else if (input.quantity !== undefined) {
    if (nextQuantity === 0) data.status = "OUT_OF_STOCK";
    else if (existing.status === "OUT_OF_STOCK" && nextQuantity > 0) data.status = "ACTIVE";
  }
  const updated = await prisma.produceListing.update({
    where: { id: productId },
    data,
    include: listingInclude,
  });
  return toProductJson(updated);
}

export async function deactivateOwnProduct(productId: number, sellerId: number) {
  const existing = await prisma.produceListing.findUnique({ where: { id: productId } });
  if (!existing) throw new AppError("Product not found", 404);
  if (existing.sellerId !== sellerId) {
    throw new AppError("You do not have permission to access this resource", 403);
  }
  await prisma.produceListing.update({
    where: { id: productId },
    data: { status: "INACTIVE" },
  });
}
