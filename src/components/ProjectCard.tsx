import Link from "next/link";
import type { ProjectCardData } from "@/lib/projects";
import { Cover } from "./Cover";
import { categoryLabel, rolesLabel } from "./ProjectMeta";

/** A project with gallery photos and no video is shown as a photo album ("folder"). */
export function isPhotoAlbum(project: Pick<ProjectCardData, "videoUrl" | "_count">) {
  return project._count.images > 0 && !project.videoUrl;
}

export function ProjectCard({ project, priority }: { project: ProjectCardData; priority?: boolean }) {
  const photos = project._count.images;
  const album = isPhotoAlbum(project);

  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="relative">
        {album && (
          <>
            {/* Stacked "sheets" behind the cover make the card read as a folder of photos */}
            <div
              aria-hidden
              className="absolute inset-0 translate-x-3 -translate-y-3 border border-neutral-800 bg-neutral-950 transition-transform duration-500 ease-out group-hover:translate-x-4 group-hover:-translate-y-4"
            />
            <div
              aria-hidden
              className="absolute inset-0 translate-x-1.5 -translate-y-1.5 border border-neutral-800 bg-neutral-900 transition-transform duration-500 ease-out group-hover:translate-x-2 group-hover:-translate-y-2"
            />
          </>
        )}

        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-950">
          <Cover
            src={project.thumbnailUrl}
            alt={`${project.title} thumbnail`}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority={priority}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/35" />

          {album && (
            <>
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-black/70 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-bone backdrop-blur-sm">
                <svg aria-hidden viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" className="h-3.5 w-3.5">
                  <rect x="1.5" y="4.5" width="10" height="10" />
                  <path d="M4.5 1.5h10v10" />
                </svg>
                {photos} {photos === 1 ? "photo" : "photos"}
              </span>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-medium tracking-[0.2em] text-bone opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                OPEN ALBUM
              </span>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-2xl sm:text-3xl md:text-4xl leading-tight break-words min-w-0">{project.title}</h3>
        <span className="text-sm tabular-nums text-smoke shrink-0">{project.year}</span>
      </div>
      <p className="mt-2 text-sm text-smoke">
        {categoryLabel(project.category)}
        {project.roles.length > 0 && <> · {rolesLabel(project.roles)}</>}
      </p>
    </Link>
  );
}
