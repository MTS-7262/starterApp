/*
  Warnings:

  - You are about to drop the column `amount` on the `starter_records` table. All the data in the column will be lost.
  - You are about to drop the column `block` on the `starter_records` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `starter_records` table. All the data in the column will be lost.
  - You are about to drop the column `legal` on the `starter_records` table. All the data in the column will be lost.
  - You are about to drop the column `lot` on the `starter_records` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `starter_records` table. All the data in the column will be lost.
  - You are about to drop the column `policy` on the `starter_records` table. All the data in the column will be lost.
  - You are about to drop the column `subdivision` on the `starter_records` table. All the data in the column will be lost.
  - You are about to drop the column `title_co` on the `starter_records` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `starter_records` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "starter_records" DROP COLUMN "amount",
DROP COLUMN "block",
DROP COLUMN "date",
DROP COLUMN "legal",
DROP COLUMN "lot",
DROP COLUMN "notes",
DROP COLUMN "policy",
DROP COLUMN "subdivision",
DROP COLUMN "title_co",
DROP COLUMN "type",
ADD COLUMN     "legalBriefDescription" TEXT,
ADD COLUMN     "legalDistrict" BIGINT,
ADD COLUMN     "legalLotNumber" BIGINT,
ADD COLUMN     "legalUnit" TEXT;
