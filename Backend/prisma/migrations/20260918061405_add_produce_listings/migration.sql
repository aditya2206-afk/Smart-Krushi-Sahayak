-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('VEGETABLE', 'FRUIT', 'GRAIN', 'PULSE', 'COMMERCIAL_CROP', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductUnit" AS ENUM ('KG', 'QUINTAL', 'TON', 'PIECE');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'OUT_OF_STOCK', 'INACTIVE');

-- CreateTable
CREATE TABLE "ProduceListing" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "grade" TEXT,
    "description" TEXT,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit" "ProductUnit" NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "location" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProduceListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProduceListing_sellerId_idx" ON "ProduceListing"("sellerId");

-- CreateIndex
CREATE INDEX "ProduceListing_status_idx" ON "ProduceListing"("status");

-- CreateIndex
CREATE INDEX "ProduceListing_category_idx" ON "ProduceListing"("category");

-- CreateIndex
CREATE INDEX "ProduceListing_createdAt_idx" ON "ProduceListing"("createdAt");

-- CreateIndex
CREATE INDEX "ProduceListing_name_idx" ON "ProduceListing"("name");

-- AddForeignKey
ALTER TABLE "ProduceListing" ADD CONSTRAINT "ProduceListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
