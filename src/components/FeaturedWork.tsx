"use client";

import Link from "next/link";
import { MAX_FEATURED, isProjectPortrait, normalizeCategory } from "@/lib/constants";
import type { ProjectCardData } from "@/lib/projects";
import { cn, truncate } from "@/lib/utils";
import { getDirectVideoUrl } from "@/lib/video";
import { Cover } from "./Cover";
import { categoryLabel, rolesLabel } from "./ProjectMeta";
import { Reveal } from "./Reveal";
import { SmartAutoplayVideo } from "./SmartAutoplayVideo";

const pad = (n: number) => String(n).padStart(2, "0");

export function FeaturedWork({ projects }: { projects: ProjectCardData[] }) {
  const featured = projects.slice(0, MAX_FEATURED);
  if (featured.length === 0) return null;

  const count = featured.length;
  const anyPortrait = featured.some((p) => isProjectPortrait(p));

  return (
    <section
      id="featured"
      aria-labelledby="featured-heading"
      className="scroll-mt-16 border-t border-line px-3.5 py-10 sm:px-6 sm:py-16 md:px-10 md:py-20"
    >
      {/* Deck container: constrained to max-w-5xl for portrait videos so cards stay compact & elegant */}
      <div className={cn("mx-auto", anyPortrait ? "max-w-5xl" : "max-w-6xl")}>
        <Reveal>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2.5 border-b border-line pb-3 sm:mb-6 sm:pb-4 md:mb-8">
            <div>
              <p className="mb-1 text-[9px] uppercase tracking-[0.18em] text-smoke sm:text-xs">
                02 / Curated highlights • {pad(count)} / {pad(MAX_FEATURED)}
              </p>
              <h2
                id="featured-heading"
                className="font-display text-2xl leading-none sm:text-4xl md:text-5xl"
              >
                Featured works
              </h2>
            </div>

            <p className="max-w-xs text-[10px] leading-relaxed text-smoke sm:text-right sm:text-xs">
              Hand-picked spotlight projects — up to {MAX_FEATURED} signature works.
            </p>
          </div>
        </Reveal>

        <div
          className={cn(
            "project-focus-deck grid gap-2.5 sm:gap-4 md:gap-5",
            count === 1 && "mx-auto max-w-md grid-cols-1",
            count === 2 && "mx-auto max-w-2xl grid-cols-2",
            count === 3 && "grid-cols-2 lg:grid-cols-3",
            count >= 4 && "grid-cols-2 lg:grid-cols-4",
          )}
        >
          {featured.map((project, index) => {
            const cat = normalizeCategory(project.category);
            const isPortrait = isProjectPortrait(project);
            const isPoster = cat === "POSTER_GRAPHICS";
            const directVideo = project.videoUrl ? getDirectVideoUrl(project.videoUrl) : null;
            const summary = project.description?.trim()
              ? truncate(project.description, 70)
              : project.roles.length > 0
                ? rolesLabel(project.roles)
                : `${categoryLabel(cat)} project`;

            return (
              <Reveal key={project.id} delay={index * 60}>
                <article className="project-focus-item group relative flex h-full flex-col justify-between border border-white/12 bg-gradient-to-b from-white/[0.03] to-[#070707] p-2 transition-colors hover:border-bone/65 sm:p-3 md:p-3.5">
                  <div>
                    {/* Editorial Index + Category Top Bar */}
                    <div className="mb-1.5 flex items-center justify-between gap-1 text-[7px] uppercase tracking-[0.1em] sm:mb-2.5 sm:gap-1.5 sm:text-[9px] sm:tracking-[0.14em]">
                      <span className="inline-flex items-center gap-1 font-medium text-bone/90 sm:gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-bone sm:h-1.5 sm:w-1.5" />
                        {pad(index + 1)} / Featured
                      </span>
                      <span className="truncate border border-white/15 bg-black/70 px-1 py-0.5 text-[6.5px] text-smoke sm:px-1.5 sm:text-[8px]">
                        {categoryLabel(cat)}
                      </span>
                    </div>

                    {/* Compact Media Frame */}
                    <Link
                      href={`/projects/${project.slug}`}
                      className="block overflow-hidden border border-line/60 bg-black"
                    >
                      <div
                        className={cn(
                          "relative w-full overflow-hidden bg-black",
                          isPortrait
                            ? "aspect-[9/16]"
                            : isPoster
                              ? "aspect-[4/5]"
                              : "aspect-video",
                        )}
                      >
                        {directVideo ? (
                          <SmartAutoplayVideo
                            src={directVideo}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          />
                        ) : (
                          <Cover
                            src={project.thumbnailUrl}
                            alt={`${project.title} thumbnail`}
                            sizes={
                              count >= 4
                                ? "(min-width: 1024px) 20vw, 44vw"
                                : "(min-width: 768px) 38vw, 44vw"
                            }
                            priority={index < 4}
                            className={cn(
                              "transition-transform duration-700 ease-out group-hover:scale-[1.03]",
                              isPortrait || !isPoster ? "object-cover" : "object-contain",
                            )}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-85 pointer-events-none" />

                        {/* Compact Watch / View Badge */}
                        <span className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 border border-white/20 bg-black/80 px-1 py-0.5 text-[6.5px] uppercase tracking-[0.1em] text-bone backdrop-blur-sm transition-colors group-hover:border-bone group-hover:bg-bone group-hover:text-black sm:bottom-1.5 sm:right-1.5 sm:gap-1 sm:px-2 sm:py-0.5 sm:text-[8px] sm:tracking-[0.14em]">
                          {directVideo ? "Watch" : project.videoUrl ? "Watch" : "View"} &rarr;
                        </span>
                      </div>
                    </Link>

                    {/* Compact Title + Year */}
                    <div className="mt-1.5 flex items-baseline justify-between gap-1 sm:mt-2.5 sm:gap-2">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="min-w-0"
                      >
                        <h3 className="font-display truncate text-xs leading-tight text-bone transition-colors group-hover:text-white sm:whitespace-normal sm:text-sm md:text-base">
                          {project.title}
                        </h3>
                      </Link>
                      <span className="shrink-0 text-[8px] tabular-nums text-smoke sm:text-[10px]">
                        {project.year}
                      </span>
                    </div>

                    <p className="mt-0.5 line-clamp-1 text-[9px] leading-relaxed text-smoke/90 sm:mt-1 sm:text-[11px]">
                      {summary}
                    </p>
                  </div>

                  {/* Compact Footer Meta */}
                  <div className="mt-1.5 flex items-center justify-between border-t border-white/10 pt-1.5 text-[8px] sm:mt-2.5 sm:pt-2 sm:text-[10px]">
                    <span className="truncate text-muted">
                      {project.client
                        ? project.client
                        : project.videoUrl
                          ? isPortrait
                            ? "9:16 Vertical"
                            : "16:9 Cinema"
                          : isPoster
                            ? "Poster Graphic"
                            : `${Math.max(project._count.images, 1)} Photos`}
                    </span>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="shrink-0 inline-flex items-center gap-0.5 uppercase tracking-[0.1em] text-bone transition-colors hover:text-white sm:tracking-[0.12em]"
                    >
                      <span>Open</span>
                      <span
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        &#8599;
                      </span>
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
