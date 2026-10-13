-- AlterTable
ALTER TABLE "Project" ADD COLUMN "isPortrait" BOOLEAN NOT NULL DEFAULT false;

-- Auto-enable isPortrait for existing portrait video category projects
UPDATE "Project" SET "isPortrait" = true WHERE "category" = 'PORTRAIT_VIDEOS';
