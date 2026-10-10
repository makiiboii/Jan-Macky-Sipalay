-- AlterEnum
ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'POSTER_GRAPHICS';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'GRAPHIC_DESIGNER';

-- Re-categorize shortfilm poster or existing poster projects if any
UPDATE "Project"
SET "category" = 'POSTER_GRAPHICS'
WHERE "slug" = 'pahinumdom-shortfilm-poster'
  AND "category" = 'PHOTOGRAPHY';
