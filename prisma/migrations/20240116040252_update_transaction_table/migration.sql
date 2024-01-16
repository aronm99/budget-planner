/*
  Warnings:

  - You are about to drop the column `note` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "note",
DROP COLUMN "type",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Miscellaneous',
ADD COLUMN     "isIncome" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "subCategory" TEXT;
