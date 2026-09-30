import Link from "next/link";
import type { ProjectCardData } from "@/lib/projects";
import { Cover } from "./Cover";
import { categoryLabel, rolesLabel } from "./ProjectMeta";
import { Reveal } from "./Reveal";

export function FeaturedWork({ project }: { project: ProjectCardData }) {
  return (
    <section aria-labelledby="featured-heading" className="px-5 pb-24 pt-8 md:px-10 md:pb-36">
      <h2 id="featured-heading" className="mb-5 text-sm text-smoke">
        Featured work
      </h2>
      <Reveal>
        <Link href={`/projects/${project.slug}`} className="group block">
          <div className="relative aspect-[4/3] overflow-hidden bg-neutral-950 sm:aspect-[16/9] lg:aspect-[21/9]">
            <Cover
              src={project.thumbnailUrl}
              alt={`${project.title} thumbnail`}
              sizes="100vw"
              priority
              className="transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
            />
          </div>
          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h3 className="font-display text-[clamp(2.6rem,8vw,7rem)] leading-[0.9]">{project.title}</h3>
            <p className="text-smoke md:pb-2 md:text-right">
              {categoryLabel(project.category)} · {project.year}
              {project.roles.length > 0 && <span className="block">{rolesLabel(project.roles)}</span>}
            </p>
          </div>
        </Link>
      </Reveal>
    </section>
  );
}
