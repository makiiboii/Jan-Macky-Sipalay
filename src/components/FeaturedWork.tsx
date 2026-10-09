import type { ProjectCardData } from "@/lib/projects";
import { MAX_FEATURED } from "@/lib/constants";
import { ProjectCard } from "./ProjectCard";

export function FeaturedWork({ projects }: { projects: ProjectCardData[] }) {
  return (
    <section aria-labelledby="featured-heading" className="px-5 pb-24 pt-8 md:px-10 md:pb-36">
      <h2 id="featured-heading" className="mb-8 text-sm text-smoke">
        Featured work
      </h2>
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2">
        {projects.slice(0, MAX_FEATURED).map((project, index) => (
          <ProjectCard key={project.id} project={project} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}
