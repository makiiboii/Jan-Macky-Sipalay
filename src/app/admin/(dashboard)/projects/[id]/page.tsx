import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { normalizeCategory } from "@/lib/constants";
import { featuredLimitReached, getProjectById } from "@/lib/projects";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();
  const limitReached = await featuredLimitReached(id);

  return (
    <>
      <Link href="/admin" className="text-sm text-smoke hover:text-bone">
        Back to projects
      </Link>
      <h1 className="font-display mb-10 mt-4 text-5xl leading-none">
        Edit project
      </h1>
      <ProjectForm
        featureLimitReached={limitReached}
        project={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          description: project.description,
          category: normalizeCategory(project.category),
          year: String(project.year),
          client: project.client ?? "",
          featured: project.featured,
          published: project.published,
          thumbnailUrl: project.thumbnailUrl ?? "",
          videoUrl: project.videoUrl ?? "",
          roles: project.roles,
          images: project.images.map((image) => ({
            url: image.url,
            caption: image.caption ?? "",
          })),
        }}
      />
    </>
  );
}
