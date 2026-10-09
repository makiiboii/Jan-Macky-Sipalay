import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { featuredLimitReached } from "@/lib/projects";

export default async function NewProjectPage() {
  const limitReached = await featuredLimitReached();

  return (
    <>
      <Link href="/admin" className="text-sm text-smoke hover:text-bone">
        Back to projects
      </Link>
      <h1 className="font-display mb-10 mt-4 text-5xl leading-none">Add project</h1>
      <ProjectForm featureLimitReached={limitReached} />
    </>
  );
}
