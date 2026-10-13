import Link from "next/link";
import { isProjectPortrait } from "@/lib/constants";
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
  const isPortraitProject = isProjectPortrait(project);
  const isPortraitCategory = project.category === "PORTRAIT_VIDEOS";
  const isPhotography = project.category === "PHOTOGRAPHY";
  const isPoster = project.category === "POSTER_GRAPHICS";

  // Only the dedicated PORTRAIT_VIDEOS section uses a 9:16 vertical card frame.
  // In all other categories (AI-Generated, Videoshoot, Video Editing, etc.),
  // cards use the standard 16:9 landscape frame so every card in the row is completely uniform.
  const isPortraitFrame = isPortraitCategory;

  const aspectClass = isPortraitFrame
    ? "aspect-[9/16]"
    : isPoster
      ? "aspect-[4/5]"
      : isPhotography
        ? "aspect-[3/2]"
        : "aspect-video";

  return (
    <div
      className={cn(
        "group relative flex flex-col",
        isPortraitFrame && !compact && "mx-auto w-full max-w-[16rem] sm:max-w-[21rem]",
      )}
    >
      <Link
        href={`/projects/${project.slug}`}
        draggable={false}
        onClick={(event) => {
          if (onOpenAlbum && (album || isPhotography || isPoster)) {
            event.preventDefault();
            onOpenAlbum(project);
          }
        }}
        className="block focus-visible:outline-offset-4"
      >
        <div className="relative">
          <div className={cn("relative overflow-hidden border border-line/70 bg-black", aspectClass)}>
            {isPortraitProject && !isPortraitFrame ? (
              <>
                {/* Ambient blurred backdrop of the portrait thumbnail filling the 16:9 landscape frame */}
                <Cover
                  src={project.thumbnailUrl}
                  alt=""
                  sizes="120px"
                  aria-hidden="true"
                  className="object-cover blur-xl opacity-35 scale-125 brightness-75 pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                {/* Centered crisp 9:16 portrait thumbnail fitting cleanly inside the uniform 16:9 landscape card */}
                <div className="relative mx-auto flex h-full w-full items-center justify-center p-1 sm:p-1.5 pointer-events-none">
                  <div className="relative h-full aspect-[9/16] overflow-hidden rounded-[2px] border border-white/15 bg-black shadow-2xl">
                    <Cover
                      src={project.thumbnailUrl}
                      alt={`${project.title} thumbnail`}
                      sizes="(min-width: 768px) 30vw, 45vw"
                      priority={priority}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                </div>
              </>
            ) : (
              <Cover
                src={project.thumbnailUrl}
                alt={`${project.title} thumbnail`}
                sizes={
                  isPortraitFrame
                    ? "(min-width: 1024px) 280px, (min-width: 640px) 45vw, 48vw"
                    : "(min-width: 768px) 45vw, 60vw"
                }
                priority={priority}
                className={cn(
                  "transition-transform duration-700 ease-out group-hover:scale-[1.03]",
                  isPortraitFrame ? "object-contain bg-[#080808]" : "object-cover",
                )}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90 pointer-events-none" />

            <span className="absolute left-2 top-2 border border-white/15 bg-black/75 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.14em] text-bone backdrop-blur-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.16em]">
              {categoryLabel(project.category)}
            </span>

            {isPortraitProject && (
              <span className="absolute right-2 top-2 border border-white/15 bg-black/75 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.12em] text-smoke backdrop-blur-sm sm:right-3 sm:top-3 sm:px-2 sm:text-[10px]">
                9:16
              </span>
            )}

            {album ? (
              <>
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-black/75 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-bone backdrop-blur-sm sm:bottom-3 sm:left-3 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[11px]">
                  <svg aria-hidden viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" className="h-3 w-3 sm:h-3.5 sm:w-3.5">
                    <rect x="1.5" y="4.5" width="10" height="10" />
                    <path d="M4.5 1.5h10v10" />
                  </svg>
                  {photos} {photos === 1 ? "photo" : "photos"}
                </span>
                <span className="absolute bottom-2 right-2 border border-white/20 bg-black/75 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-[0.14em] text-bone opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:bottom-3 sm:right-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
                  {onOpenAlbum ? "View Photos" : "Open Album"}
                </span>
              </>
            ) : (
              <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 border border-white/20 bg-black/75 px-2 py-0.5 text-[8px] uppercase tracking-[0.14em] text-bone opacity-85 transition-all duration-300 group-hover:border-bone group-hover:bg-bone group-hover:text-black sm:bottom-3 sm:right-3 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[10px]">
                {project.videoUrl ? "Watch" : "View"} &rarr;
              </span>
            )}
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between gap-2 sm:mt-4 sm:gap-4">
          <h3 className="font-display min-w-0 truncate text-base leading-tight text-bone transition-colors group-hover:text-white sm:whitespace-normal sm:text-2xl md:text-[1.75rem]">
            {project.title}
          </h3>
          <span className="shrink-0 text-[10px] tabular-nums text-smoke sm:text-xs">{project.year}</span>
        </div>

        {project.description && (
          <p className="mt-1 line-clamp-1 text-[11px] leading-relaxed text-smoke/90 sm:mt-1.5 sm:line-clamp-2 sm:text-sm">
            {project.description}
          </p>
        )}

        <p className="mt-1 truncate text-[10px] leading-relaxed text-muted sm:mt-2 sm:whitespace-normal sm:text-xs">
          {categoryLabel(project.category)}
          {project.roles.length > 0 && <> · {rolesLabel(project.roles)}</>}
        </p>
      </Link>
    </div>
  );
}
