/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ProjectRowActions } from "@/components/admin/ProjectRowActions";
import { CATEGORY_LABELS } from "@/lib/constants";
import { resolveImageUrl } from "@/lib/drive";
import { getAdminProjects } from "@/lib/projects";

export default async function AdminHome() {
  let projects: Awaited<ReturnType<typeof getAdminProjects>> = [];
  let failed = false;
  try {
    projects = await getAdminProjects();
  } catch (error) {
    console.error(error);
    failed = true;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-5xl leading-none">Projects</h1>
        <Link href="/admin/projects/new" className="btn btn-solid">
          Add project
        </Link>
      </div>

      {failed ? (
        <p className="mt-10 text-red-400">The database is unavailable. Check DATABASE_URL and try again.</p>
      ) : projects.length === 0 ? (
        <p className="mt-10 text-smoke">No projects yet. Add your first one.</p>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {projects.map((project) => (
            <li key={project.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
              <div className="h-16 w-28 shrink-0 overflow-hidden bg-neutral-950">
                {project.thumbnailUrl && (
                  <img src={resolveImageUrl(project.thumbnailUrl)} alt="" className="h-full w-full object-cover" loading="lazy" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/projects/${project.id}`} className="block truncate text-lg hover:underline">
                  {project.title}
                </Link>
                <p className="mt-1 text-sm text-smoke">
                  {CATEGORY_LABELS[project.category]} · {project.year} ·{" "}
                  <span className={project.published ? "text-green-400" : "text-amber-400"}>
                    {project.published ? "Published" : "Draft"}
                  </span>
                  {project.featured && " · Featured"}
                </p>
              </div>
              <ProjectRowActions id={project.id} slug={project.slug} published={project.published} featured={project.featured} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
