import type { OrderStatus, Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "./authService.js";
import type { SellerOrdersFilterInput } from "../validators/orderValidator.js";
import {
  buyerOrderInclude,
  sellerOrderWhereFor,
  toOrderJson,
  type BuyerOrderRow,
} from "./orderService.js";

type TransitionTarget = Exclude<OrderStatus, "PENDING">;

const ALLOWED_TRANSITIONS: Record<OrderStatus, TransitionTarget[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function assertTransition(from: OrderStatus, to: OrderStatus): void {
  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!(allowed as string[]).includes(to)) {
    throw new AppError(`Cannot change order status from ${from} to ${to}`, 400);
  }
}

export async function listSellerOrders(sellerId: number, filters: SellerOrdersFilterInput) {
  const where: Prisma.OrderWhereInput = { ...sellerOrderWhereFor(sellerId) };
  if (filters.status) where.status = filters.status as OrderStatus;
  if (filters.search) {
    const s = filters.search;
    const asId = Number(s);
    where.AND = [
      {
        OR: [
          ...(Number.isInteger(asId) && asId > 0 ? [{ id: asId }] : []),
          { buyer: { name: { contains: s, mode: "insensitive" } } },
          { buyer: { email: { contains: s, mode: "insensitive" } } },
          { items: { some: { productName: { contains: s, mode: "insensitive" } } } },
        ],
      },
    ];
  }
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: buyerOrderInclude,
  });
  return orders.map(toOrderJson);
}

export async function getSellerOrderById(sellerId: number, orderId: number) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, ...sellerOrderWhereFor(sellerId) },
    include: buyerOrderInclude,
  });
  if (!order) throw new AppError("Order not found", 404);
  return toOrderJson(order);
}

export async function updateSellerOrderStatus(
  sellerId: number,
  orderId: number,
  nextStatus: OrderStatus,
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, ...sellerOrderWhereFor(sellerId) },
      include: { items: { orderBy: { id: "asc" } } },
    });
    if (!order) throw new AppError("Order not found", 404);
    const current = order.status as OrderStatus;
    assertTransition(current, nextStatus);

    if (nextStatus === "CONFIRMED") {
      for (const item of order.items) {
        const qty = Number(item.quantity);
        const res = await tx.produceListing.updateMany({
          where: {
            id: item.productId,
            sellerId,
            status: "ACTIVE",
            quantity: { gte: qty },
          },
          data: { quantity: { decrement: qty } },
        });
        if (res.count === 0) {
          const currentProduct = await tx.produceListing.findUnique({
            where: { id: item.productId },
          });
          if (!currentProduct || currentProduct.sellerId !== sellerId) {
            throw new AppError(`Product for ${item.productName} not found`, 404);
          }
          if (currentProduct.status !== "ACTIVE") {
            throw new AppError(`${item.productName} is no longer available`, 400);
          }
          throw new AppError(
            `Insufficient stock for ${item.productName}. Only ${Number(currentProduct.quantity)} available`,
            400,
          );
        }
      }
      for (const item of order.items) {
        const refreshed = await tx.produceListing.findUnique({
          where: { id: item.productId },
        });
        if (refreshed && Number(refreshed.quantity) <= 0 && refreshed.status === "ACTIVE") {
          await tx.produceListing.update({
            where: { id: item.productId },
            data: { status: "OUT_OF_STOCK" },
          });
        }
      }
      const updated = await tx.order.update({
        where: { id: order.id },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
        include: buyerOrderInclude,
      });
      return toOrderJson(updated as unknown as BuyerOrderRow);
    }

    if (nextStatus === "CANCELLED") {
      const needsRestore = current === "CONFIRMED" || current === "PROCESSING";
      if (needsRestore) {
        for (const item of order.items) {
          const qty = Number(item.quantity);
          await tx.produceListing.update({
            where: { id: item.productId },
            data: { quantity: { increment: qty } },
          });
          const refreshed = await tx.produceListing.findUnique({
            where: { id: item.productId },
          });
          if (
            refreshed &&
            refreshed.status === "OUT_OF_STOCK" &&
            Number(refreshed.quantity) > 0
          ) {
            await tx.produceListing.update({
              where: { id: item.productId },
              data: { status: "ACTIVE" },
            });
          }
        }
      }
      const updated = await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
        include: buyerOrderInclude,
      });
      return toOrderJson(updated as unknown as BuyerOrderRow);
    }

    const data: Prisma.OrderUpdateInput = { status: nextStatus };
    if (nextStatus === "SHIPPED") data.shippedAt = new Date();
    if (nextStatus === "DELIVERED") data.deliveredAt = new Date();
    const updated = await tx.order.update({
      where: { id: order.id },
      data,
      include: buyerOrderInclude,
    });
    return toOrderJson(updated as unknown as BuyerOrderRow);
  });
}
