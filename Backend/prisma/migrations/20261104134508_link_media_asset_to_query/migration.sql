-- Add optional farmerQueryId to MediaAsset to link media attachments to a FarmerQuery.
-- Additive change: no existing tables, columns, or data are modified or removed.

ALTER TABLE "MediaAsset" ADD COLUMN "farmerQueryId" INTEGER;

-- Add foreign key from MediaAsset.farmerQueryId to FarmerQuery.id (cascade on delete).
ALTER TABLE "MediaAsset"
  ADD CONSTRAINT "MediaAsset_farmerQueryId_fkey"
  FOREIGN KEY ("farmerQueryId") REFERENCES "FarmerQuery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Index for lookups of media attached to a query.
CREATE INDEX "MediaAsset_farmerQueryId_idx" ON "MediaAsset"("farmerQueryId");
