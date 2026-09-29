import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "./authService.js";
import type { AdminUserFilterInput } from "../validators/adminValidator.js";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

function paginationMeta(total: number, page: number, limit: number) {
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
  return { total, page, limit, totalPages };
}

export async function getAdminDashboard() {
  const [
    totalUsers,
    farmers,
    sellers,
    buyers,
    officers,
    admins,
    activeUsers,
    inactiveUsers,
    totalQueries,
    pendingQueries,
    answeredQueries,
    totalListings,
    activeListings,
    totalOrders,
    pendingOrders,
    completedOrders,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { role: "FARMER" } }),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.user.count({ where: { role: "OFFICER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.farmerQuery.count(),
    prisma.farmerQuery.count({ where: { status: "PENDING" } }),
    prisma.farmerQuery.count({ where: { status: "ANSWERED" } }),
    prisma.produceListing.count(),
    prisma.produceListing.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
  ]);

  return {
    totalUsers,
    farmers,
    sellers,
    buyers,
    officers,
    admins,
    activeUsers,
    inactiveUsers,
    queries: { total: totalQueries, pending: pendingQueries, answered: answeredQueries },
    listings: { total: totalListings, active: activeListings },
    orders: { total: totalOrders, pending: pendingOrders, completed: completedOrders },
  };
}

export async function listAdminUsers(filters: AdminUserFilterInput) {
  const where: Prisma.UserWhereInput = {};
  if (filters.role) where.role = filters.role;
  if (filters.status === "active") where.isActive = true;
  if (filters.status === "inactive") where.isActive = false;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      select: safeUserSelect,
    }),
  ]);
  return { users, pagination: paginationMeta(total, filters.page, filters.limit) };
}

export async function getAdminUserById(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      farmerProfile: true,
      sellerProfile: true,
      buyerProfile: true,
      officerProfile: true,
    },
  });
  if (!user) throw new AppError("User not found", 404);
  const { id, name, email, role, isActive, createdAt } = user;
  const out: Record<string, unknown> = { id, name, email, role, isActive, createdAt };
  if (user.farmerProfile) out["farmerProfile"] = user.farmerProfile;
  if (user.sellerProfile) out["sellerProfile"] = user.sellerProfile;
  if (user.buyerProfile) out["buyerProfile"] = user.buyerProfile;
  if (user.officerProfile) out["officerProfile"] = user.officerProfile;
  return out;
}

export async function updateAdminUserStatus(
  targetUserId: number,
  isActive: boolean,
  currentAdminId: number,
) {
  if (targetUserId === currentAdminId) {
    throw new AppError("You cannot deactivate your own admin account", 400);
  }
  const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!existing) throw new AppError("User not found", 404);
  if (existing.role === "ADMIN" && !isActive && existing.isActive) {
    const activeAdmins = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });
    if (activeAdmins <= 1) {
      throw new AppError("Cannot deactivate the last active admin account", 400);
    }
  }
  return prisma.user.update({
    where: { id: targetUserId },
    data: { isActive },
    select: safeUserSelect,
  });
}
