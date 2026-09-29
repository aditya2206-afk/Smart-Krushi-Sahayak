import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type {
  AdminOrderFilterInput,
  AdminQueryFilterInput,
} from "../validators/adminValidator.js";
import { buyerOrderInclude, toOrderJson } from "./orderService.js";

function paginationMeta(total: number, page: number, limit: number) {
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
  return { total, page, limit, totalPages };
}

const adminQueryInclude = {
  farmer: {
    select: {
      id: true,
      name: true,
      email: true,
      farmerProfile: { select: { village: true, district: true } },
    },
  },
  recommendation: {
    select: {
      id: true,
      queryId: true,
      officerId: true,
      diagnosis: true,
      recommendation: true,
      fertilizerAdvice: true,
      pesticideAdvice: true,
      additionalNotes: true,
      createdAt: true,
      updatedAt: true,
      officer: { select: { id: true, name: true, email: true } },
    },
  },
} satisfies Prisma.FarmerQueryInclude;

export async function listAdminQueries(filters: AdminQueryFilterInput) {
  const where: Prisma.FarmerQueryWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.farmer) {
    const asId = Number(filters.farmer);
    where.farmer =
      Number.isInteger(asId) && asId > 0
        ? {
            OR: [
              { id: asId },
              { name: { contains: filters.farmer, mode: "insensitive" } },
              { email: { contains: filters.farmer, mode: "insensitive" } },
            ],
          }
        : {
            OR: [
              { name: { contains: filters.farmer, mode: "insensitive" } },
              { email: { contains: filters.farmer, mode: "insensitive" } },
            ],
          };
  }
  if (filters.officer) {
    const asId = Number(filters.officer);
    const officerOr: Prisma.UserWhereInput[] =
      Number.isInteger(asId) && asId > 0
        ? [
            { id: asId },
            { name: { contains: filters.officer, mode: "insensitive" } },
            { email: { contains: filters.officer, mode: "insensitive" } },
          ]
        : [
            { name: { contains: filters.officer, mode: "insensitive" } },
            { email: { contains: filters.officer, mode: "insensitive" } },
          ];
    where.recommendation = { officer: { OR: officerOr } };
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { cropName: { contains: filters.search, mode: "insensitive" } },
      { category: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  const [total, queries] = await prisma.$transaction([
    prisma.farmerQuery.count({ where }),
    prisma.farmerQuery.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: adminQueryInclude,
    }),
  ]);
  return { queries, pagination: paginationMeta(total, filters.page, filters.limit) };
}

export async function listAdminOrders(filters: AdminOrderFilterInput) {
  const where: Prisma.OrderWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.buyer) {
    const asId = Number(filters.buyer);
    where.buyer =
      Number.isInteger(asId) && asId > 0
        ? {
            OR: [
              { id: asId },
              { name: { contains: filters.buyer, mode: "insensitive" } },
              { email: { contains: filters.buyer, mode: "insensitive" } },
            ],
          }
        : {
            OR: [
              { name: { contains: filters.buyer, mode: "insensitive" } },
              { email: { contains: filters.buyer, mode: "insensitive" } },
            ],
          };
  }
  if (filters.seller) {
    const asId = Number(filters.seller);
    const itemOr: Prisma.OrderItemWhereInput[] =
      Number.isInteger(asId) && asId > 0
        ? [
            { sellerId: asId },
            { seller: { name: { contains: filters.seller, mode: "insensitive" } } },
            { seller: { email: { contains: filters.seller, mode: "insensitive" } } },
            { productName: { contains: filters.seller, mode: "insensitive" } },
          ]
        : [
            { seller: { name: { contains: filters.seller, mode: "insensitive" } } },
            { seller: { email: { contains: filters.seller, mode: "insensitive" } } },
            { productName: { contains: filters.seller, mode: "insensitive" } },
          ];
    where.items = { some: { OR: itemOr } };
  }
  if (filters.date) {
    const start = new Date(`${filters.date}T00:00:00.000Z`);
    const end = new Date(`${filters.date}T23:59:59.999Z`);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      where.createdAt = { gte: start, lte: end };
    }
  }
  const [total, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: buyerOrderInclude,
    }),
  ]);
  return {
    orders: orders.map((o) => toOrderJson(o)),
    pagination: paginationMeta(total, filters.page, filters.limit),
  };
}
