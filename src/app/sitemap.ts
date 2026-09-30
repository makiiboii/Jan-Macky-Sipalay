import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home = { url: site.url, changeFrequency: "monthly" as const, priority: 1 };
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    return [
      home,
      ...projects.map((project) => ({
        url: `${site.url}/projects/${project.slug}`,
        lastModified: project.updatedAt,
        priority: 0.7,
      })),
    ];
  } catch {
    return [home];
  }
}
