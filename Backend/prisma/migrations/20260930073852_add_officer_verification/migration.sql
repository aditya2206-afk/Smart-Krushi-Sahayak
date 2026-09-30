-- CreateEnum
CREATE TYPE "OfficerVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'REUPLOAD_REQUIRED');

-- CreateEnum
CREATE TYPE "OfficerDocumentType" AS ENUM ('DEGREE_CERTIFICATE', 'APPOINTMENT_CERTIFICATE', 'OFFICER_ID', 'EXPERIENCE_CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "OfficerDocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'REUPLOAD_REQUIRED');

-- AlterTable
ALTER TABLE "OfficerProfile" ADD COLUMN     "verificationNote" TEXT,
ADD COLUMN     "verificationStatus" "OfficerVerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" INTEGER;

-- CreateTable
CREATE TABLE "OfficerCertificate" (
    "id" SERIAL NOT NULL,
    "officerProfileId" INTEGER NOT NULL,
    "documentType" "OfficerDocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "originalFileName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "status" "OfficerDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" INTEGER,

    CONSTRAINT "OfficerCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfficerCertificate_officerProfileId_idx" ON "OfficerCertificate"("officerProfileId");

-- CreateIndex
CREATE INDEX "OfficerCertificate_documentType_idx" ON "OfficerCertificate"("documentType");

-- CreateIndex
CREATE INDEX "OfficerCertificate_status_idx" ON "OfficerCertificate"("status");

-- AddForeignKey
ALTER TABLE "OfficerCertificate" ADD CONSTRAINT "OfficerCertificate_officerProfileId_fkey" FOREIGN KEY ("officerProfileId") REFERENCES "OfficerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
