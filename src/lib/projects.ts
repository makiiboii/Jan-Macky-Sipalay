import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { slugify } from "./slug";

export const withImages = {
  images: { orderBy: { position: "asc" } },
} satisfies Prisma.ProjectInclude;

export const cardSelect = {
  id: true,
  title: true,
  slug: true,
  category: true,
  year: true,
  roles: true,
  thumbnailUrl: true,
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

export function getFeaturedProject() {
  return prisma.project.findFirst({
    where: { published: true, featured: true },
    select: cardSelect,
    orderBy: { updatedAt: "desc" },
  });
}

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
