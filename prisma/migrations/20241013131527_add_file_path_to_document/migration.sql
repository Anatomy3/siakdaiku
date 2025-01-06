-- AlterTable
ALTER TABLE "Document" ADD COLUMN "filePath" TEXT;

-- Update existing rows
UPDATE "Document" SET "filePath" = CONCAT('/uploads/', name) WHERE "filePath" IS NULL;

-- Make filePath NOT NULL after updating existing rows
ALTER TABLE "Document" ALTER COLUMN "filePath" SET NOT NULL;

-- Remove the content column
ALTER TABLE "Document" DROP COLUMN "content";