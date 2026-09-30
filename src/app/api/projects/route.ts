import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { apiError, handleError, requireAdmin } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import { CATEGORIES, type CategoryValue } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug, withImages } from "@/lib/projects";
import { projectInputSchema } from "@/lib/validation";

// Public: published projects only. Admin: add ?all=1 to include drafts.
export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const includeDrafts = params.get("all") === "1" && (await isAdmin());
    const category = params.get("category");
    const query = params.get("q")?.trim();

    const where: Prisma.ProjectWhereInput = {
      ...(includeDrafts ? {} : { published: true }),
      ...(category && CATEGORIES.includes(category as CategoryValue) ? { category: category as CategoryValue } : {}),
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

    const { images, slug: requestedSlug, ...data } = projectInputSchema.parse(await req.json());
    const slug = await generateUniqueSlug(requestedSlug || data.title);

    const project = await prisma.project.create({
      data: {
        ...data,
        slug,
        images: { create: images.map((image, position) => ({ ...image, position })) },
      },
      include: withImages,
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
