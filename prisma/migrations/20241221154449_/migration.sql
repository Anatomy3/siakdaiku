/*
  Warnings:

  - You are about to drop the column `input` on the `Proyek` table. All the data in the column will be lost.
  - You are about to drop the column `item` on the `Proyek` table. All the data in the column will be lost.
  - You are about to drop the column `output` on the `Proyek` table. All the data in the column will be lost.
  - You are about to drop the column `pic` on the `Proyek` table. All the data in the column will be lost.
  - Added the required column `project` to the `Proyek` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proyek" DROP COLUMN "input",
DROP COLUMN "item",
DROP COLUMN "output",
DROP COLUMN "pic",
ADD COLUMN     "bulan1" TEXT,
ADD COLUMN     "bulan10" TEXT,
ADD COLUMN     "bulan11" TEXT,
ADD COLUMN     "bulan12" TEXT,
ADD COLUMN     "bulan2" TEXT,
ADD COLUMN     "bulan3" TEXT,
ADD COLUMN     "bulan4" TEXT,
ADD COLUMN     "bulan5" TEXT,
ADD COLUMN     "bulan6" TEXT,
ADD COLUMN     "bulan7" TEXT,
ADD COLUMN     "bulan8" TEXT,
ADD COLUMN     "bulan9" TEXT,
ADD COLUMN     "project" TEXT NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'draft';
