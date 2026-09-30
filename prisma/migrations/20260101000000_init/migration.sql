-- CreateEnum
CREATE TYPE "Category" AS ENUM ('VIDEOGRAPHY', 'VIDEO_EDITING', 'PHOTOGRAPHY');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VIDEOGRAPHER', 'VIDEO_EDITOR', 'PHOTOGRAPHER', 'DIRECTOR', 'COLORIST', 'CAMERA_OPERATOR');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" "Category" NOT NULL,
    "year" INTEGER NOT NULL,
    "client" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "roles" "Role"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_published_featured_idx" ON "Project"("published", "featured");

-- CreateIndex
CREATE INDEX "Project_category_idx" ON "Project"("category");

-- CreateIndex
CREATE INDEX "ProjectImage_projectId_position_idx" ON "ProjectImage"("projectId", "position");

-- AddForeignKey
ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
