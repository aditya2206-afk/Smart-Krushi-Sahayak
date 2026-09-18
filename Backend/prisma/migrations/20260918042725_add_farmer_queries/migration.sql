-- CreateEnum
CREATE TYPE "QueryStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'ANSWERED', 'CLOSED');

-- CreateEnum
CREATE TYPE "QueryPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "FarmerQuery" (
    "id" SERIAL NOT NULL,
    "farmerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "QueryStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "QueryPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "FarmerQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" SERIAL NOT NULL,
    "queryId" INTEGER NOT NULL,
    "officerId" INTEGER NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "fertilizerAdvice" TEXT,
    "pesticideAdvice" TEXT,
    "additionalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FarmerQuery_farmerId_idx" ON "FarmerQuery"("farmerId");

-- CreateIndex
CREATE INDEX "FarmerQuery_status_idx" ON "FarmerQuery"("status");

-- CreateIndex
CREATE INDEX "FarmerQuery_priority_idx" ON "FarmerQuery"("priority");

-- CreateIndex
CREATE INDEX "FarmerQuery_createdAt_idx" ON "FarmerQuery"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_queryId_key" ON "Recommendation"("queryId");

-- CreateIndex
CREATE INDEX "Recommendation_officerId_idx" ON "Recommendation"("officerId");

-- AddForeignKey
ALTER TABLE "FarmerQuery" ADD CONSTRAINT "FarmerQuery_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "FarmerQuery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
