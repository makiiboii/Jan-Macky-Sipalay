import Link from "next/link";
import type { ProjectCardData } from "@/lib/projects";
import { Cover } from "./Cover";
import { categoryLabel, rolesLabel } from "./ProjectMeta";

export function ProjectCard({ project, priority }: { project: ProjectCardData; priority?: boolean }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-950">
        <Cover
          src={project.thumbnailUrl}
          alt={`${project.title} thumbnail`}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority={priority}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/25" />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-6">
        <h3 className="font-display text-3xl leading-none md:text-4xl">{project.title}</h3>
        <span className="text-sm tabular-nums text-smoke">{project.year}</span>
      </div>
      <p className="mt-2 text-sm text-smoke">
        {categoryLabel(project.category)}
        {project.roles.length > 0 && <> · {rolesLabel(project.roles)}</>}
      </p>
    </Link>
  );
}
