-- AlterEnum
ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'PORTRAIT_VIDEOS';
ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'AI_GENERATED';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'AI_CREATIVE_PRODUCER';

-- Migrate existing AI-generated projects and legacy photo_editing category values
UPDATE "Project"
SET "category" = 'AI_GENERATED'
WHERE "slug" IN ('joola-persues-v-ai-ugc', 'maison-cosmetic-ai-generated-videos')
  AND "category" = 'VIDEOGRAPHY';

UPDATE "Project"
SET "category" = 'PHOTOGRAPHY'
WHERE "category" = 'PHOTO_EDITING';
