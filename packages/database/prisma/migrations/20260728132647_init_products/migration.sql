/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Product";

-- CreateTable
CREATE TABLE "starter_records" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "county" TEXT,
    "zip" TEXT,
    "apn" TEXT,
    "owner" TEXT,
    "subdivision" TEXT,
    "block" TEXT,
    "lot" TEXT,
    "title_co" TEXT,
    "amount" TEXT,
    "policy" TEXT,
    "date" TEXT,
    "legal" TEXT,
    "notes" TEXT,
    "filed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdf" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "exowners" TEXT[],

    CONSTRAINT "starter_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "starter_records_owner_idx" ON "starter_records"("owner");

-- CreateIndex
CREATE INDEX "starter_records_apn_idx" ON "starter_records"("apn");

-- CreateIndex
CREATE INDEX "starter_records_address_idx" ON "starter_records"("address");
