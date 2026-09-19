import type { OrderStatus, Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "./authService.js";
import type { CreateOrderInput } from "../validators/orderValidator.js";

const safeBuyerSelect = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect;

const safeSellerSelect = {
  id: true,
  name: true,
  email: true,
  sellerProfile: {
    select: { businessName: true, district: true, state: true },
  },
} satisfies Prisma.UserSelect;

const orderItemInclude = {
  seller: { select: safeSellerSelect },
} satisfies Prisma.OrderItemInclude;

export const buyerOrderInclude = {
  items: { include: orderItemInclude, orderBy: { id: "asc" as const } },
  buyer: { select: safeBuyerSelect },
} satisfies Prisma.OrderInclude;

export type BuyerOrderRow = Prisma.OrderGetPayload<{ include: typeof buyerOrderInclude }>;

export function sellerOrderWhereFor(sellerId: number): Prisma.OrderWhereInput {
  return { items: { some: { sellerId } } };
}

function toItemJson(item: {
  id: number;
  orderId: number;
  productId: number;
  sellerId: number;
  productName: string;
  quantity: unknown;
  unit: string;
  unitPrice: unknown;
  subtotal: unknown;
  createdAt: Date;
  seller?: unknown;
}) {
  return {
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    sellerId: item.sellerId,
    productName: item.productName,
    quantity: Number(item.quantity),
    unit: item.unit,
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.subtotal),
    createdAt: item.createdAt,
    seller: item.seller ?? undefined,
  };
}

export function toOrderJson(order: BuyerOrderRow) {
  return {
    id: order.id,
    buyerId: order.buyerId,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    confirmedAt: order.confirmedAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    buyer: order.buyer,
    items: order.items.map(toItemJson),
  };
}

export async function placeOrder(buyerId: number, input: CreateOrderInput) {
  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const products = await prisma.produceListing.findMany({
    where: { id: { in: productIds } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
    if (product.status !== "ACTIVE") {
      throw new AppError(
        product.status === "OUT_OF_STOCK"
          ? `${product.name} is out of stock`
          : `${product.name} is not available for ordering`,
        400,
      );
    }
    const available = Number(product.quantity);
    if (item.quantity > available) {
      throw new AppError(
        `Only ${available} ${product.unit} of ${product.name} is available`,
        400,
      );
    }
  }

  const requestedSellerIds = new Set(
    input.items.map((i) => byId.get(i.productId)?.sellerId),
  );
  if (requestedSellerIds.size > 1) {
    throw new AppError("All items in one order must belong to the same seller", 400);
  }

  let total = 0;
  const itemRows = input.items.map((i) => {
    const product = byId.get(i.productId)!;
    const unitPrice = Number(product.price);
    const subtotal = unitPrice * i.quantity;
    total += subtotal;
    return {
      productId: product.id,
      sellerId: product.sellerId,
      productName: product.name,
      quantity: i.quantity,
      unit: product.unit,
      unitPrice,
      subtotal,
    };
  });

  const created = await prisma.order.create({
    data: {
      buyerId,
      status: "PENDING",
      totalAmount: total,
      items: { create: itemRows },
    },
    include: buyerOrderInclude,
  });
  return toOrderJson(created);
}

export async function listBuyerOrders(buyerId: number) {
  const orders = await prisma.order.findMany({
    where: { buyerId },
    orderBy: { createdAt: "desc" },
    include: buyerOrderInclude,
  });
  return orders.map(toOrderJson);
}

export async function getBuyerOrderById(buyerId: number, orderId: number) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, buyerId },
    include: buyerOrderInclude,
  });
  if (!order) throw new AppError("Order not found", 404);
  return toOrderJson(order);
}

export async function cancelBuyerOrder(buyerId: number, orderId: number) {
  const existing = await prisma.order.findFirst({
    where: { id: orderId, buyerId },
  });
  if (!existing) throw new AppError("Order not found", 404);
  if (existing.status !== "PENDING") {
    throw new AppError(`Cannot cancel order with status ${existing.status}`, 400);
  }
  const updated = await prisma.order.update({
    where: { id: existing.id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
    include: buyerOrderInclude,
  });
  return toOrderJson(updated);
}
