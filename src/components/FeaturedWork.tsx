"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { normalizeCategory } from "@/lib/constants";
import type { ProjectCardData } from "@/lib/projects";
import { cn, truncate } from "@/lib/utils";
import { Cover } from "./Cover";
import { categoryLabel, rolesLabel } from "./ProjectMeta";
import { Reveal } from "./Reveal";

const pad = (n: number) => String(n).padStart(2, "0");

export function FeaturedWork({ projects }: { projects: ProjectCardData[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const touchingRef = useRef(false);
  const manualPauseUntilRef = useRef(0);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
    moved: boolean;
  } | null>(null);

  function scrollByCards(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    manualPauseUntilRef.current = performance.now() + 1400;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const cardWidth = track.querySelector<HTMLElement>(
      "[data-featured-card]",
    )?.offsetWidth;
    const step = cardWidth ? cardWidth + 24 : track.clientWidth * 0.75;
    track.scrollBy({
      left: step * direction,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: track.scrollLeft,
      moved: false,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 6) {
      drag.moved = true;
    }
    if (drag.moved) {
      track.scrollLeft = drag.startScroll - delta;
    }
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    setTimeout(() => {
      dragRef.current = null;
    }, 0);
  }

  // Smooth continuous 60fps horizontal carousel motion (no duplicate cards), paused on mouse hover or active touch
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    let previousTime = 0;
    let position = track.scrollLeft;
    let currentSign = 1;
    const speedPxPerSec = 36;

    const animate = (time: number) => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      const paused =
        dragRef.current !== null ||
        hoveredRef.current ||
        touchingRef.current ||
        time < manualPauseUntilRef.current;

      if (paused) {
        position = track.scrollLeft;
      } else if (previousTime && maxScroll > 4) {
        const dt = Math.min(time - previousTime, 50) / 1000;
        position += currentSign * speedPxPerSec * dt;
        if (position >= maxScroll) {
          position = maxScroll;
          currentSign = -1;
        } else if (position <= 0) {
          position = 0;
          currentSign = 1;
        }
        track.scrollLeft = position;
      }

      previousTime = time;
      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [projects.length]);

  if (projects.length === 0) return null;

  return (
    <section
      id="featured"
      aria-labelledby="featured-heading"
      className="border-t border-line px-5 py-16 md:px-10 md:py-24"
    >
      <Reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5 md:mb-10">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-smoke">
              02 / Curated highlights · {pad(projects.length)}
            </p>
            <h2
              id="featured-heading"
              className="font-display text-4xl leading-none sm:text-5xl"
            >
              Featured projects
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              aria-label="Previous featured project"
              className="flex h-10 w-10 items-center justify-center border border-line text-sm text-smoke transition-colors hover:border-bone hover:text-bone"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              aria-label="Next featured project"
              className="flex h-10 w-10 items-center justify-center border border-line text-sm text-smoke transition-colors hover:border-bone hover:text-bone"
            >
              &rarr;
            </button>
          </div>
        </div>
      </Reveal>

      <div
        ref={trackRef}
        role="region"
        aria-label="Featured projects carousel"
        tabIndex={0}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") hoveredRef.current = true;
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") hoveredRef.current = false;
        }}
        onTouchStart={() => {
          touchingRef.current = true;
        }}
        onTouchEnd={() => {
          touchingRef.current = false;
          manualPauseUntilRef.current = performance.now() + 1400;
        }}
        onTouchCancel={() => {
          touchingRef.current = false;
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            scrollByCards(-1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            scrollByCards(1);
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="project-focus-deck no-scrollbar flex cursor-grab gap-6 overflow-x-auto px-2 py-3 select-none active:cursor-grabbing focus-visible:outline-offset-4"
      >
        {projects.map((project, index) => {
          const cat = normalizeCategory(project.category);
          const isPortrait = cat === "PORTRAIT_VIDEOS";
          const summary = project.description?.trim()
            ? truncate(project.description, 110)
            : project.roles.length > 0
              ? rolesLabel(project.roles)
              : `${categoryLabel(cat)} project`;

          return (
            <article
              key={project.id}
              data-featured-card
              className={cn(
                "project-focus-item group flex shrink-0 flex-col justify-between border border-line bg-[#080808] p-4 transition-colors hover:border-bone/60",
                isPortrait
                  ? "w-[min(76vw,17.5rem)] sm:w-[18.5rem]"
                  : "w-[min(85vw,21.5rem)] sm:w-[23rem] lg:w-[24.5rem]",
              )}
            >
              <div>
                <Link
                  href={`/projects/${project.slug}`}
                  onClick={(e) => {
                    if (dragRef.current?.moved) e.preventDefault();
                  }}
                  className="block overflow-hidden bg-black"
                >
                  <div
                    className={cn(
                      "relative w-full overflow-hidden bg-black",
                      isPortrait ? "aspect-[9/16] max-h-[22rem]" : "aspect-video",
                    )}
                  >
                    <Cover
                      src={project.thumbnailUrl}
                      alt={`${project.title} thumbnail`}
                      sizes={
                        isPortrait
                          ? "(min-width: 768px) 280px, 75vw"
                          : "(min-width: 1024px) 390px, (min-width: 640px) 360px, 85vw"
                      }
                      priority={index < 3}
                      className={cn(
                        "transition-transform duration-700 ease-out group-hover:scale-[1.03]",
                        isPortrait ? "object-contain" : "object-cover",
                      )}
                    />
                    <span className="absolute left-2.5 top-2.5 bg-black/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-bone backdrop-blur-sm">
                      {categoryLabel(cat)}
                    </span>
                  </div>
                </Link>

                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <Link
                    href={`/projects/${project.slug}`}
                    onClick={(e) => {
                      if (dragRef.current?.moved) e.preventDefault();
                    }}
                    className="min-w-0"
                  >
                    <h3 className="font-display break-words text-2xl leading-tight text-bone transition-colors group-hover:text-white">
                      {project.title}
                    </h3>
                  </Link>
                  <span className="shrink-0 text-xs tabular-nums text-smoke">
                    {project.year}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-smoke">
                  {summary}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
                <span className="text-muted">
                  {project.videoUrl
                    ? isPortrait
                      ? "9:16 Portrait Video"
                      : "16:9 Film"
                    : project._count.images > 0
                      ? `${project._count.images} Photos`
                      : "Still Image"}
                </span>
                <Link
                  href={`/projects/${project.slug}`}
                  onClick={(e) => {
                    if (dragRef.current?.moved) e.preventDefault();
                  }}
                  className="inline-flex items-center gap-1.5 text-bone transition-colors hover:text-white"
                >
                  <span>Open project</span>
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    &rarr;
                  </span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
