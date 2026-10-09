"use client";

import Link from "next/link";
import { MAX_FEATURED, normalizeCategory } from "@/lib/constants";
import type { ProjectCardData } from "@/lib/projects";
import { cn, truncate } from "@/lib/utils";
import { Cover } from "./Cover";
import { categoryLabel, rolesLabel } from "./ProjectMeta";
import { Reveal } from "./Reveal";

const pad = (n: number) => String(n).padStart(2, "0");

export function FeaturedWork({ projects }: { projects: ProjectCardData[] }) {
  const featured = projects.slice(0, MAX_FEATURED);
  if (featured.length === 0) return null;

  const count = featured.length;

  return (
    <section
      id="featured"
      aria-labelledby="featured-heading"
      className="scroll-mt-16 border-t border-line px-4 py-12 sm:px-5 sm:py-16 md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4 sm:mb-8 sm:pb-5 md:mb-10">
            <div>
              <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-smoke sm:mb-2 sm:text-xs">
                02 / Curated highlights · {pad(count)} / {pad(MAX_FEATURED)}
              </p>
              <h2
                id="featured-heading"
                className="font-display text-3xl leading-none sm:text-5xl"
              >
                Featured works
              </h2>
            </div>

            <p className="max-w-xs text-[11px] leading-relaxed text-smoke sm:text-right sm:text-xs">
              Hand-picked spotlight projects — up to {MAX_FEATURED} signature works.
            </p>
          </div>
        </Reveal>

        <div
          className={cn(
            "project-focus-deck grid gap-3 sm:gap-5",
            count === 1 && "mx-auto max-w-2xl grid-cols-1",
            count === 2 && "mx-auto max-w-5xl grid-cols-2",
            count === 3 && "grid-cols-2 lg:grid-cols-3",
            count >= 4 && "grid-cols-2 lg:grid-cols-4",
          )}
        >
          {featured.map((project, index) => {
            const cat = normalizeCategory(project.category);
            const isPortrait = cat === "PORTRAIT_VIDEOS";
            const summary = project.description?.trim()
              ? truncate(project.description, 85)
              : project.roles.length > 0
                ? rolesLabel(project.roles)
                : `${categoryLabel(cat)} project`;

            return (
              <Reveal key={project.id} delay={index * 70}>
                <article className="project-focus-item group relative flex h-full flex-col justify-between border border-white/12 bg-gradient-to-b from-white/[0.03] to-[#070707] p-2.5 transition-colors hover:border-bone/65 sm:p-4">
                  <div>
                    {/* Editorial Index + Category Top Bar */}
                    <div className="mb-2 flex items-center justify-between gap-1.5 text-[8px] uppercase tracking-[0.12em] sm:mb-3 sm:gap-2 sm:text-[10px] sm:tracking-[0.16em]">
                      <span className="inline-flex items-center gap-1 font-medium text-bone/90 sm:gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-bone sm:h-1.5 sm:w-1.5" />
                        {pad(index + 1)} / Featured
                      </span>
                      <span className="truncate border border-white/15 bg-black/70 px-1.5 py-0.5 text-[7px] text-smoke sm:px-2 sm:text-[9px]">
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
                            ? "mx-auto aspect-[9/16] max-h-[12rem] sm:max-h-[18rem]"
                            : "aspect-video",
                        )}
                      >
                        <Cover
                          src={project.thumbnailUrl}
                          alt={`${project.title} thumbnail`}
                          sizes={
                            count >= 4
                              ? "(min-width: 1024px) 24vw, 48vw"
                              : "(min-width: 768px) 44vw, 48vw"
                          }
                          priority={index < 4}
                          className={cn(
                            "transition-transform duration-700 ease-out group-hover:scale-[1.04]",
                            isPortrait ? "object-contain" : "object-cover",
                          )}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-85" />

                        {/* Subtle Play / View Badge */}
                        <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 border border-white/20 bg-black/80 px-1.5 py-0.5 text-[7px] uppercase tracking-[0.12em] text-bone backdrop-blur-sm transition-colors group-hover:border-bone group-hover:bg-bone group-hover:text-black sm:bottom-2.5 sm:right-2.5 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[9px] sm:tracking-[0.16em]">
                          {project.videoUrl ? "Play" : "View"} &rarr;
                        </span>
                      </div>
                    </Link>

                    {/* Compact Title + Year + Summary */}
                    <div className="mt-2 flex items-baseline justify-between gap-1.5 sm:mt-3.5 sm:gap-2.5">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="min-w-0"
                      >
                        <h3 className="font-display truncate text-sm leading-tight text-bone transition-colors group-hover:text-white sm:whitespace-normal sm:text-xl md:text-2xl">
                          {project.title}
                        </h3>
                      </Link>
                      <span className="shrink-0 text-[9px] tabular-nums text-smoke sm:text-[11px]">
                        {project.year}
                      </span>
                    </div>

                    <p className="mt-1 line-clamp-1 text-[10px] leading-relaxed text-smoke/90 sm:mt-1.5 sm:line-clamp-2 sm:text-xs">
                      {summary}
                    </p>
                  </div>

                  {/* Compact Footer Meta */}
                  <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[9px] sm:mt-3.5 sm:pt-2.5 sm:text-[11px]">
                    <span className="truncate text-muted">
                      {project.client
                        ? project.client
                        : project.videoUrl
                          ? isPortrait
                            ? "9:16 Vertical"
                            : "16:9 Cinema"
                          : `${Math.max(project._count.images, 1)} Photos`}
                    </span>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="shrink-0 inline-flex items-center gap-0.5 uppercase tracking-[0.12em] text-bone transition-colors hover:text-white sm:gap-1 sm:tracking-[0.14em]"
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
