import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { apiError, handleError, requireAdmin } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import {
  CATEGORIES,
  matchingDbCategories,
  normalizeCategory,
  type CategoryValue,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  FEATURED_LIMIT_MESSAGE,
  featuredLimitReached,
  generateUniqueSlug,
  withImages,
} from "@/lib/projects";
import { projectInputSchema } from "@/lib/validation";

// Public: published projects only. Admin: add ?all=1 to include drafts.
export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const includeDrafts = params.get("all") === "1" && (await isAdmin());
    const categoryParam = params.get("category");
    const query = params.get("q")?.trim();

    const normalizedCategory =
      categoryParam &&
      (CATEGORIES.includes(categoryParam as CategoryValue) ||
        categoryParam === "VIDEOGRAPHY" ||
        categoryParam === "PHOTO_EDITING")
        ? normalizeCategory(categoryParam)
        : null;

    const where: Prisma.ProjectWhereInput = {
      ...(includeDrafts ? {} : { published: true }),
      ...(normalizedCategory
        ? { category: { in: matchingDbCategories(normalizedCategory) } }
        : {}),
      ...(params.get("featured") === "1" ? { featured: true } : {}),
      ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
    };

    const projects = await prisma.project.findMany({
      where,
      include: withImages,
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ projects });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const { images, slug: requestedSlug, ...data } = projectInputSchema.parse(
      await req.json(),
    );
    if (data.featured && (await featuredLimitReached())) {
      return apiError(FEATURED_LIMIT_MESSAGE, 409);
    }

    const slug = await generateUniqueSlug(requestedSlug || data.title);

    const project = await prisma.project.create({
      data: {
        ...data,
        slug,
        images: {
          create: images.map((image, position) => ({ ...image, position })),
        },
      },
      include: withImages,
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
