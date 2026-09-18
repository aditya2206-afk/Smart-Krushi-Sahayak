import type { Prisma, QueryPriority, QueryStatus } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "./authService.js";
import type {
  CreateQueryInput,
  OfficerQueryFilterInput,
  RespondToQueryInput,
} from "../validators/queryValidator.js";

export const VALID_STATUS_TRANSITIONS: Record<QueryStatus, QueryStatus[]> = {
  PENDING: ["IN_REVIEW"],
  IN_REVIEW: ["ANSWERED"],
  ANSWERED: ["CLOSED"],
  CLOSED: [],
};

const safeFarmerSelect = {
  id: true,
  name: true,
  email: true,
  farmerProfile: { select: { village: true, district: true } },
} satisfies Prisma.UserSelect;

const recommendationSelect = {
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
} satisfies Prisma.RecommendationSelect;

const queryWithRelations = {
  recommendation: { select: recommendationSelect },
  farmer: { select: safeFarmerSelect },
} satisfies Prisma.FarmerQueryInclude;

export type QueryWithRelations = Prisma.FarmerQueryGetPayload<{ include: typeof queryWithRelations }>;

export async function createFarmerQuery(farmerId: number, input: CreateQueryInput) {
  const query = await prisma.farmerQuery.create({
    data: {
      farmerId,
      title: input.title.trim(),
      cropName: input.cropName.trim(),
      category: input.category.trim(),
      description: input.description.trim(),
      priority: (input.priority ?? "MEDIUM") as QueryPriority,
    },
    include: { recommendation: true },
  });
  return query;
}

export async function getMyQueries(farmerId: number) {
  return prisma.farmerQuery.findMany({
    where: { farmerId },
    orderBy: { createdAt: "desc" },
    include: { recommendation: { select: recommendationSelect } },
  });
}

export async function getQueryByIdForFarmer(queryId: number, farmerId: number) {
  const query = await prisma.farmerQuery.findUnique({
    where: { id: queryId },
    include: { recommendation: { select: recommendationSelect } },
  });
  if (!query) throw new AppError("Query not found", 404);
  if (query.farmerId !== farmerId) {
    throw new AppError("You do not have permission to access this resource", 403);
  }
  return query;
}

export async function getQueryByIdForStaff(queryId: number) {
  const query = (await prisma.farmerQuery.findUnique({
    where: { id: queryId },
    include: queryWithRelations,
  })) as QueryWithRelations | null;
  if (!query) throw new AppError("Query not found", 404);
  return query;
}

export async function listOfficerQueries(filters: OfficerQueryFilterInput) {
  const where: Prisma.FarmerQueryWhereInput = {};
  if (filters.status) where.status = filters.status as QueryStatus;
  if (filters.priority) where.priority = filters.priority as QueryPriority;
  if (filters.cropName) where.cropName = { contains: filters.cropName, mode: "insensitive" };
  return (await prisma.farmerQuery.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: queryWithRelations,
  })) as QueryWithRelations[];
}

export async function updateQueryStatus(queryId: number, nextStatus: QueryStatus) {
  const query = await prisma.farmerQuery.findUnique({ where: { id: queryId } });
  if (!query) throw new AppError("Query not found", 404);

  if (query.status === nextStatus) return query;

  const allowed = VALID_STATUS_TRANSITIONS[query.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      `Invalid status transition from ${query.status} to ${nextStatus}. Allowed: ${allowed.length > 0 ? allowed.join(", ") : "none"}`,
      400,
    );
  }

  return prisma.farmerQuery.update({
    where: { id: queryId },
    data: { status: nextStatus },
    include: { recommendation: { select: recommendationSelect } },
  });
}

function emptyToNull(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function respondToQuery(queryId: number, officerId: number, input: RespondToQueryInput) {
  const query = await prisma.farmerQuery.findUnique({
    where: { id: queryId },
    include: { recommendation: true },
  });
  if (!query) throw new AppError("Query not found", 404);
  if (query.recommendation) {
    throw new AppError("This query already has a recommendation. Editing is not supported in this version.", 409);
  }

  const recommendation = await prisma.recommendation.create({
    data: {
      queryId,
      officerId,
      diagnosis: input.diagnosis.trim(),
      recommendation: input.recommendation.trim(),
      fertilizerAdvice: emptyToNull(input.fertilizerAdvice),
      pesticideAdvice: emptyToNull(input.pesticideAdvice),
      additionalNotes: emptyToNull(input.additionalNotes),
    },
    select: recommendationSelect,
  });

  const updatedQuery = await prisma.farmerQuery.update({
    where: { id: queryId },
    data: { status: "ANSWERED", answeredAt: new Date() },
    include: {
      recommendation: { select: recommendationSelect },
      farmer: { select: safeFarmerSelect },
    },
  });

  return { recommendation, query: updatedQuery };
}
