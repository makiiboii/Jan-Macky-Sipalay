import { NextResponse } from "next/server";
import { apiError, handleError, requireAdmin } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug, withImages } from "@/lib/projects";
import { projectInputSchema, projectPatchSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

// [id] accepts either the project id or its slug.
export async function GET(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: withImages,
    });
    if (!project || (!project.published && !(await isAdmin()))) {
      return apiError("Project not found.", 404);
    }
    return NextResponse.json({ project });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: Request, { params }: Context) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const { id } = await params;
    const { images, slug: requestedSlug, ...data } = projectInputSchema.parse(await req.json());
    const slug = requestedSlug === undefined ? undefined : await generateUniqueSlug(requestedSlug || data.title, id);

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        ...(slug ? { slug } : {}),
        images: {
          deleteMany: {},
          create: images.map((image, position) => ({ ...image, position })),
        },
      },
      include: withImages,
    });
    return NextResponse.json({ project });
  } catch (error) {
    return handleError(error);
  }
}

// Partial update used by the dashboard for publish and featured toggles.
export async function PATCH(req: Request, { params }: Context) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const { id } = await params;
    const data = projectPatchSchema.parse(await req.json());
    const project = await prisma.project.update({ where: { id }, data, include: withImages });
    return NextResponse.json({ project });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: Request, { params }: Context) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    const { id } = await params;
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
