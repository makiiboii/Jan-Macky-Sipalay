import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { MAX_FEATURED } from "./constants";
import { prisma } from "./prisma";
import { slugify } from "./slug";

export const withImages = {
  images: { orderBy: { position: "asc" } },
} satisfies Prisma.ProjectInclude;

export const cardSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  category: true,
  year: true,
  client: true,
  featured: true,
  isPortrait: true,
  roles: true,
  thumbnailUrl: true,
  videoUrl: true,
  images: {
    orderBy: { position: "asc" },
    select: { id: true, url: true, caption: true },
  },
  _count: { select: { images: true } },
} satisfies Prisma.ProjectSelect;

export type ProjectWithImages = Prisma.ProjectGetPayload<{ include: typeof withImages }>;
export type ProjectCardData = Prisma.ProjectGetPayload<{ select: typeof cardSelect }>;

export function getPublishedProjects() {
  return prisma.project.findMany({
    where: { published: true },
    select: cardSelect,
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
  });
}

export function getFeaturedProjects() {
  return prisma.project.findMany({
    where: { published: true, featured: true },
    select: cardSelect,
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    take: MAX_FEATURED,
  });
}

/** True when MAX_FEATURED other projects are already featured, so this one can't be. */
export async function featuredLimitReached(excludeId?: string) {
  const count = await prisma.project.count({
    where: { featured: true, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
  });
  return count >= MAX_FEATURED;
}

export const FEATURED_LIMIT_MESSAGE = `You can feature up to ${MAX_FEATURED} projects. Unfeature one first.`;

export const getPublishedProjectBySlug = cache((slug: string) =>
  prisma.project.findFirst({ where: { slug, published: true }, include: withImages }),
);

export function getAdminProjects() {
  return prisma.project.findMany({
    select: { ...cardSelect, published: true, featured: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function getProjectById(id: string) {
  return prisma.project.findUnique({ where: { id }, include: withImages });
}

export async function generateUniqueSlug(source: string, excludeId?: string) {
  const base = slugify(source) || "project";
  let slug = base;
  let suffix = 2;
  while (
    await prisma.project.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}
