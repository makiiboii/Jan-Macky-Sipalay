import Link from "next/link";
import type { ProjectCardData } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { Cover } from "./Cover";
import { categoryLabel, rolesLabel } from "./ProjectMeta";

/** A project with gallery photos and no video is shown as a photo album ("folder"). */
export function isPhotoAlbum(project: Pick<ProjectCardData, "videoUrl" | "_count">) {
  return project._count.images > 0 && !project.videoUrl;
}

export function ProjectCard({
  project,
  priority,
  compact = false,
  onOpenAlbum,
}: {
  project: ProjectCardData;
  priority?: boolean;
  compact?: boolean;
  onOpenAlbum?: (project: ProjectCardData) => void;
}) {
  const photos = project._count.images;
  const album = isPhotoAlbum(project);
  const isPortrait = project.category === "PORTRAIT_VIDEOS";
  const isPhotography = project.category === "PHOTOGRAPHY";

  const aspectClass = isPortrait
    ? "aspect-[9/16]"
    : isPhotography
      ? "aspect-[3/2]"
      : "aspect-video";

  return (
    <div
      className={cn(
        "group relative flex flex-col",
        isPortrait && !compact && "mx-auto w-full max-w-[21rem]",
      )}
    >
      <Link
        href={`/projects/${project.slug}`}
        draggable={false}
        onClick={(event) => {
          if (onOpenAlbum && (album || isPhotography)) {
            event.preventDefault();
            onOpenAlbum(project);
          }
        }}
        className="block focus-visible:outline-offset-4"
      >
        <div className="relative">
          <div className={cn("relative overflow-hidden border border-line/70 bg-black", aspectClass)}>
            <Cover
              src={project.thumbnailUrl}
              alt={`${project.title} thumbnail`}
              sizes={
                isPortrait
                  ? "(min-width: 1024px) 280px, (min-width: 640px) 45vw, 80vw"
                  : "(min-width: 768px) 45vw, 92vw"
              }
              priority={priority}
              className={cn(
                "transition-transform duration-700 ease-out group-hover:scale-[1.03]",
                isPortrait ? "object-contain bg-[#080808]" : "object-cover",
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

            <span className="absolute left-3 top-3 border border-white/15 bg-black/75 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-bone backdrop-blur-sm">
              {categoryLabel(project.category)}
            </span>

            {isPortrait && (
              <span className="absolute right-3 top-3 border border-white/15 bg-black/75 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-smoke backdrop-blur-sm">
                9:16
              </span>
            )}

            {album ? (
              <>
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-black/75 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-bone backdrop-blur-sm">
                  <svg aria-hidden viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" className="h-3.5 w-3.5">
                    <rect x="1.5" y="4.5" width="10" height="10" />
                    <path d="M4.5 1.5h10v10" />
                  </svg>
                  {photos} {photos === 1 ? "photo" : "photos"}
                </span>
                <span className="absolute bottom-3 right-3 border border-white/20 bg-black/75 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-bone opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {onOpenAlbum ? "View Photos" : "Open Album"}
                </span>
              </>
            ) : (
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 border border-white/20 bg-black/75 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-bone opacity-85 transition-all duration-300 group-hover:border-bone group-hover:bg-bone group-hover:text-black">
                {project.videoUrl ? "Watch" : "View"} &rarr;
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="font-display min-w-0 break-words text-2xl leading-tight text-bone transition-colors group-hover:text-white sm:text-[1.75rem]">
            {project.title}
          </h3>
          <span className="shrink-0 text-xs tabular-nums text-smoke">{project.year}</span>
        </div>

        {project.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-smoke/90 sm:text-sm">
            {project.description}
          </p>
        )}

        <p className="mt-2 text-xs leading-relaxed text-muted">
          {categoryLabel(project.category)}
          {project.roles.length > 0 && <> · {rolesLabel(project.roles)}</>}
        </p>
      </Link>
    </div>
  );
}
