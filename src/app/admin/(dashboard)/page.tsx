import Link from "next/link";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { MAX_FEATURED } from "@/lib/constants";
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
  const featuredCount = projects.filter((project) => project.featured).length;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-smoke">
            Portfolio Management · Curated Featured ({featuredCount}/{MAX_FEATURED})
          </p>
          <h1 className="font-display mt-2 text-5xl leading-none sm:text-6xl">
            Projects
          </h1>
        </div>
        <Link href="/admin/projects/new" className="btn btn-solid">
          + Add project
        </Link>
      </div>

      {failed ? (
        <p className="mt-10 text-red-400">
          The database is unavailable. Check DATABASE_URL and try again.
        </p>
      ) : projects.length === 0 ? (
        <p className="mt-10 text-smoke">No projects yet. Add your first one.</p>
      ) : (
        <AdminDashboardClient projects={projects} />
      )}
    </div>
  );
}
