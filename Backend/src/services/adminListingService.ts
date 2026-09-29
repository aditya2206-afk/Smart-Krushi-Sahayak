import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "./authService.js";
import type { AdminListingFilterInput } from "../validators/adminValidator.js";
import { toProductJson } from "./productService.js";

function paginationMeta(total: number, page: number, limit: number) {
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
  return { total, page, limit, totalPages };
}

const adminListingInclude = {
  seller: {
    select: {
      id: true,
      name: true,
      email: true,
      sellerProfile: {
        select: { businessName: true, district: true, state: true },
      },
    },
  },
} satisfies Prisma.ProduceListingInclude;

export async function listAdminListings(filters: AdminListingFilterInput) {
  const where: Prisma.ProduceListingWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.category) where.category = filters.category;
  if (filters.seller) {
    const asId = Number(filters.seller);
    const sellerOr: Prisma.UserWhereInput[] =
      Number.isInteger(asId) && asId > 0
        ? [
            { id: asId },
            { name: { contains: filters.seller, mode: "insensitive" } },
            { email: { contains: filters.seller, mode: "insensitive" } },
          ]
        : [
            { name: { contains: filters.seller, mode: "insensitive" } },
            { email: { contains: filters.seller, mode: "insensitive" } },
          ];
    where.seller = { OR: sellerOr };
  }
  if (filters.search) {
    where.AND = [
      {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { location: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ],
      },
    ];
  }
  const [total, listings] = await prisma.$transaction([
    prisma.produceListing.count({ where }),
    prisma.produceListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: adminListingInclude,
    }),
  ]);
  return {
    listings: listings.map((l) =>
      toProductJson(l as unknown as Parameters<typeof toProductJson>[0]),
    ),
    pagination: paginationMeta(total, filters.page, filters.limit),
  };
}

export async function updateAdminListingStatus(
  listingId: number,
  status: "ACTIVE" | "OUT_OF_STOCK" | "INACTIVE",
) {
  const existing = await prisma.produceListing.findUnique({ where: { id: listingId } });
  if (!existing) throw new AppError("Listing not found", 404);
  const updated = await prisma.produceListing.update({
    where: { id: listingId },
    data: { status },
    include: adminListingInclude,
  });
  return toProductJson(updated as unknown as Parameters<typeof toProductJson>[0]);
}
