"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CATEGORIES, CATEGORY_LABELS, type CategoryValue } from "@/lib/constants";
import { resolveImageUrl } from "@/lib/drive";
import type { ProjectCardData } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { Lightbox, type GalleryImage } from "./Gallery";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

type Filter = "ALL" | CategoryValue;
const FILTERS: Filter[] = ["ALL", ...CATEGORIES];

type ViewMode = "carousel" | "grid";

const pad = (n: number) => String(n).padStart(2, "0");

export function Portfolio({ projects }: { projects: ProjectCardData[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");
  // Reel ("carousel") is the standard default view when opened
  const [viewMode, setViewMode] = useState<ViewMode>("carousel");
  const top = useRef<HTMLDivElement>(null);

  const matching = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? projects.filter(
          (project) =>
            project.title.toLowerCase().includes(term) ||
            project.description.toLowerCase().includes(term) ||
            (project.client && project.client.toLowerCase().includes(term)),
        )
      : projects;
  }, [projects, query]);

  const counts = useMemo(() => {
    const result = { ALL: matching.length } as Record<Filter, number>;
    for (const category of CATEGORIES) {
      result[category] = matching.filter((project) => project.category === category).length;
    }
    return result;
  }, [matching]);

  // "ALL" shows every category that has projects.
  const groups = useMemo(() => {
    const categories = filter === "ALL" ? CATEGORIES : [filter];
    return categories
      .map((category) => ({
        category,
        projects: matching.filter((project) => project.category === category),
      }))
      .filter((group) => group.projects.length > 0);
  }, [matching, filter]);

  // Keep GSAP ScrollTrigger positions accurate when filtering or switching views
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [filter, query, viewMode]);

  function showCategory(next: Filter) {
    setFilter(next);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={top} className="scroll-mt-24">
      {/* Controls Bar: Categories + Search + View Switcher */}
      <div className="flex flex-col gap-6 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter by category"
          className="flex flex-wrap gap-x-5 gap-y-1"
        >
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              className={cn(
                "group flex min-h-11 items-start gap-1.5 border-b py-2 text-xs sm:text-sm tracking-[0.16em] transition-colors",
                filter === item ? "border-bone text-bone" : "border-transparent text-smoke hover:text-bone",
              )}
            >
              {item === "ALL" ? "ALL PROJECTS" : CATEGORY_LABELS[item].toUpperCase()}
              <span
                className={cn(
                  "text-[10px] tabular-nums tracking-normal transition-colors",
                  filter === item ? "text-bone/70" : "text-muted group-hover:text-smoke",
                )}
              >
                {pad(counts[item])}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-5 sm:gap-6">
          {/* Search bar */}
          <label className="block flex-1 sm:w-60 sm:flex-none md:w-64">
            <span className="sr-only">Search projects by title</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects..."
              className="w-full border-b border-line bg-transparent py-2 text-sm text-bone placeholder:text-muted focus:border-bone focus:outline-none"
            />
          </label>

          {/* View mode toggle: Reel (default) vs Grid */}
          <div role="group" aria-label="Project view" className="flex items-center gap-1 border border-line p-1 text-xs">
            {(["carousel", "grid"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                className={cn(
                  "min-h-9 px-3 uppercase tracking-wider transition-colors",
                  viewMode === mode ? "bg-bone font-semibold text-black" : "text-smoke hover:text-bone",
                )}
              >
                {mode === "carousel" ? "Reel" : "Grid"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {matching.length === 0 ? (
        <p className="py-24 text-smoke">No projects match. Try a different search.</p>
      ) : groups.length === 0 ? (
        <div className="py-20">
          <p className="text-smoke">
            No {CATEGORY_LABELS[filter as CategoryValue]} projects published yet.
            {filter === "PORTRAIT_VIDEOS" && " You can add 9:16 vertical videos anytime from the Admin Panel."}
          </p>
          <button type="button" onClick={() => setFilter("ALL")} className="btn btn-outline mt-6">
            Show all projects
          </button>
        </div>
      ) : (
        <div key={filter} className={cn(filter === "ALL" ? "mt-14 space-y-20 md:mt-20 md:space-y-24" : "mt-10")}>
          {groups.map(({ category, projects: items }, groupIndex) => {
            // Alternate starting direction per category row
            const direction: "left" | "right" = groupIndex % 2 === 0 ? "right" : "left";

            return (
              <section key={category} aria-labelledby={filter === "ALL" ? `category-${category}` : undefined}>
                {filter === "ALL" && (
                  <Reveal>
                    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-line pb-5 md:mb-10">
                      <div className="flex items-baseline gap-4">
                        <span className="text-sm tabular-nums text-muted">{pad(groupIndex + 1)}</span>
                        <h3 id={`category-${category}`} className="font-display text-[clamp(1.9rem,4vw,3.4rem)] leading-none">
                          {CATEGORY_LABELS[category]}
                        </h3>
                      </div>
                      <div className="flex items-center gap-5 text-sm">
                        <span className="tabular-nums text-smoke">
                          {pad(items.length)} {items.length === 1 ? "project" : "projects"}
                        </span>
                        <button
                          type="button"
                          onClick={() => showCategory(category)}
                          className="group inline-flex items-center gap-1.5 border-b border-line pb-0.5 tracking-wide text-bone transition-colors hover:border-bone"
                        >
                          View only {CATEGORY_LABELS[category]}
                          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                            &rarr;
                          </span>
                        </button>
                      </div>
                    </div>
                  </Reveal>
                )}

                {category === "PHOTOGRAPHY" ? (
                  <PhotographyCarousel projects={items} direction={direction} />
                ) : category === "PORTRAIT_VIDEOS" ? (
                  <PortraitVideosShowcase
                    projects={items}
                    viewMode={viewMode}
                    eager={groupIndex === 0}
                    direction={direction}
                  />
                ) : viewMode === "carousel" ? (
                  <Filmstrip projects={items} eager={groupIndex === 0} direction={direction} />
                ) : (
                  <div className="project-focus-deck grid gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-14">
                    {items.map((project, index) => (
                      <Reveal key={project.id} delay={(index % 2) * 90}>
                        <div className="project-focus-item">
                          <ProjectCard project={project} priority={groupIndex === 0 && index < 2} />
                        </div>
                      </Reveal>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PortraitVideosShowcase({
  projects,
  viewMode,
  eager,
  direction,
}: {
  projects: ProjectCardData[];
  viewMode: ViewMode;
  eager: boolean;
  direction: "left" | "right";
}) {
  if (viewMode === "grid") {
    return (
      <div className="project-focus-deck grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((project, index) => (
          <Reveal key={project.id} delay={(index % 4) * 70}>
            <div className="project-focus-item">
              <ProjectCard project={project} compact priority={eager && index < 2} />
            </div>
          </Reveal>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-smoke">
        9:16 Vertical Format · Reels, TikTok &amp; Shorts
      </p>
      <Filmstrip projects={projects} eager={eager} direction={direction} />
    </div>
  );
}

function PhotographyCarousel({
  projects,
  direction,
}: {
  projects: ProjectCardData[];
  direction: "left" | "right";
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const touchingRef = useRef(false);
  const manualPauseUntilRef = useRef(0);
  const [activeAlbumSlug, setActiveAlbumSlug] = useState<string>("ALL");
  const [lightboxState, setLightboxState] = useState<{
    images: GalleryImage[];
    title: string;
    index: number;
  } | null>(null);

  const isDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);

  // Build flat list of unique still photography items from the photography projects (no duplicates)
  const photoSlides = useMemo(() => {
    const filteredProjects =
      activeAlbumSlug === "ALL"
        ? projects
        : projects.filter((project) => project.slug === activeAlbumSlug);

    const slides: Array<{
      id: string;
      url: string;
      caption: string | null;
      projectTitle: string;
      projectSlug: string;
      albumImages: GalleryImage[];
      indexInAlbum: number;
      totalInAlbum: number;
    }> = [];

    for (const project of filteredProjects) {
      const albumImages: GalleryImage[] =
        project.images && project.images.length > 0
          ? project.images.map((img) => ({
              id: img.id,
              url: img.url,
              caption: img.caption || `${project.title}`,
            }))
          : project.thumbnailUrl
            ? [
                {
                  id: project.id,
                  url: project.thumbnailUrl,
                  caption: project.title,
                },
              ]
            : [];

      albumImages.forEach((img, idx) => {
        slides.push({
          id: `${project.id}-${img.id}`,
          url: img.url,
          caption: img.caption,
          projectTitle: project.title,
          projectSlug: project.slug,
          albumImages,
          indexInAlbum: idx,
          totalInAlbum: albumImages.length,
        });
      });
    }

    return slides;
  }, [projects, activeAlbumSlug]);

  function scrollByDirection(stepDir: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    manualPauseUntilRef.current = performance.now() + 1400;
    track.scrollBy({
      left: track.clientWidth * 0.72 * stepDir,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  // Smooth horizontal carousel animation when there are enough photos to scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track || photoSlides.length < 2) return;

    let frame = 0;
    let previousTime = 0;
    let initialized = false;
    let position = track.scrollLeft;
    let currentSign = direction === "left" ? 1 : -1;
    const speedPxPerSec = 32;

    const animate = (time: number) => {
      const maxScroll = track.scrollWidth - track.clientWidth;

      if (!initialized && maxScroll > 4) {
        position = direction === "right" ? maxScroll : 0;
        track.scrollLeft = position;
        initialized = true;
      }

      const paused =
        isDraggingRef.current ||
        hoveredRef.current ||
        touchingRef.current ||
        lightboxState !== null ||
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
  }, [photoSlides.length, lightboxState, direction]);

  return (
    <div className="mt-4">
      {/* Album Filter Pills + Carousel Navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveAlbumSlug("ALL")}
            aria-pressed={activeAlbumSlug === "ALL"}
            className={cn(
              "border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition-colors",
              activeAlbumSlug === "ALL"
                ? "border-bone bg-bone text-black font-medium"
                : "border-line text-smoke hover:border-bone hover:text-bone",
            )}
          >
            All Stills ({photoSlides.length})
          </button>
          {projects.map((project) => {
            const count = Math.max(project._count.images, 1);
            const active = activeAlbumSlug === project.slug;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setActiveAlbumSlug(project.slug)}
                aria-pressed={active}
                className={cn(
                  "border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition-colors",
                  active
                    ? "border-bone bg-bone text-black font-medium"
                    : "border-line text-smoke hover:border-bone hover:text-bone",
                )}
              >
                {project.title} ({pad(count)})
              </button>
            );
          })}
        </div>

        {photoSlides.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByDirection(-1)}
              aria-label="Previous photos"
              className="flex h-10 w-10 items-center justify-center border border-line text-base text-smoke transition-colors hover:border-bone hover:text-bone"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={() => scrollByDirection(1)}
              aria-label="Next photos"
              className="flex h-10 w-10 items-center justify-center border border-line text-base text-smoke transition-colors hover:border-bone hover:text-bone"
            >
              &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Still Photography Carousel — each photo rendered once */}
      <div
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-label="Photography horizontal carousel"
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
            scrollByDirection(-1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            scrollByDirection(1);
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "touch" || event.button !== 0) return;
          const track = trackRef.current;
          if (!track) return;
          isDraggingRef.current = true;
          dragMovedRef.current = false;
          dragStartXRef.current = event.clientX;
          dragStartScrollRef.current = track.scrollLeft;
        }}
        onPointerMove={(event) => {
          if (!isDraggingRef.current) return;
          const track = trackRef.current;
          if (!track) return;
          const deltaX = event.clientX - dragStartXRef.current;
          if (Math.abs(deltaX) > 6) {
            dragMovedRef.current = true;
          }
          track.scrollLeft = dragStartScrollRef.current - deltaX;
        }}
        onPointerUp={() => {
          isDraggingRef.current = false;
        }}
        onPointerCancel={() => {
          isDraggingRef.current = false;
        }}
        onClickCapture={(event) => {
          if (dragMovedRef.current) {
            event.preventDefault();
            event.stopPropagation();
            dragMovedRef.current = false;
          }
        }}
        className="project-focus-deck no-scrollbar flex cursor-grab gap-5 overflow-x-auto px-2 py-3 select-none active:cursor-grabbing focus-visible:outline-none"
      >
        {photoSlides.map((slide, idx) => (
          <figure
            key={slide.id}
            className="project-focus-item group relative w-[min(78vw,22rem)] shrink-0 sm:w-[20rem] md:w-[22rem]"
          >
            <button
              type="button"
              onClick={() =>
                setLightboxState({
                  images: slide.albumImages,
                  title: slide.projectTitle,
                  index: slide.indexInAlbum,
                })
              }
              aria-label={`Preview ${slide.projectTitle} photo ${slide.indexInAlbum + 1} of ${slide.totalInAlbum}`}
              className="relative block aspect-[4/5] w-full overflow-hidden border border-line/70 bg-[#080808] text-left focus-visible:outline-offset-4"
            >
              <img
                src={resolveImageUrl(slide.url)}
                alt={slide.caption || `${slide.projectTitle} photo ${idx + 1}`}
                loading={idx < 4 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />
              <span className="absolute left-3 top-3 border border-white/15 bg-black/75 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-bone backdrop-blur-sm">
                {slide.projectTitle}
              </span>
              <span className="absolute bottom-3 left-3 text-[11px] tabular-nums tracking-[0.14em] text-smoke">
                {pad(slide.indexInAlbum + 1)} / {pad(slide.totalInAlbum)}
              </span>
              <span className="absolute bottom-3 right-3 border border-white/20 bg-black/75 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-bone opacity-85 transition-all duration-300 group-hover:border-bone group-hover:bg-bone group-hover:text-black">
                Preview
              </span>
            </button>

            <figcaption className="mt-3 flex items-center justify-between gap-3">
              <span className="truncate text-xs uppercase tracking-[0.14em] text-smoke">
                {slide.projectTitle}
              </span>
              <Link
                href={`/projects/${slide.projectSlug}`}
                className="shrink-0 text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-bone"
              >
                Open Album &rarr;
              </Link>
            </figcaption>
          </figure>
        ))}
      </div>

      {lightboxState && (
        <Lightbox
          images={lightboxState.images}
          title={lightboxState.title}
          index={lightboxState.index}
          onChange={(nextIndex) =>
            setLightboxState((prev) => (prev ? { ...prev, index: nextIndex } : null))
          }
          onClose={() => setLightboxState(null)}
        />
      )}
    </div>
  );
}

function Filmstrip({
  projects,
  eager,
  direction = "left",
}: {
  projects: ProjectCardData[];
  eager: boolean;
  direction?: "left" | "right";
}) {
  const track = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const touchingRef = useRef(false);
  const manualPauseUntilRef = useRef(0);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
    moved: boolean;
  } | null>(null);

  function move(stepDir: -1 | 1) {
    if (!track.current) return;
    manualPauseUntilRef.current = performance.now() + 1400;
    track.current.scrollBy({
      left: track.current.clientWidth * 0.72 * stepDir,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  useEffect(() => {
    const scrollElement = track.current;
    if (!scrollElement || projects.length < 2) return;

    let frame = 0;
    let previousTime = 0;
    let initialized = false;
    let position = scrollElement.scrollLeft;
    let currentSign = direction === "left" ? 1 : -1;
    const speedPxPerSec = 36;

    const animate = (time: number) => {
      const maxScroll = scrollElement.scrollWidth - scrollElement.clientWidth;

      if (!initialized && maxScroll > 4) {
        // Start at the right end if direction is "right" so it glides rightward
        position = direction === "right" ? maxScroll : 0;
        scrollElement.scrollLeft = position;
        initialized = true;
      }

      const paused =
        dragRef.current !== null ||
        hoveredRef.current ||
        touchingRef.current ||
        time < manualPauseUntilRef.current;

      if (paused) {
        position = scrollElement.scrollLeft;
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
        scrollElement.scrollLeft = position;
      }

      previousTime = time;
      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [projects.length, direction]);

  return (
    <div className="mt-4">
      {projects.length > 1 && (
        <div className="mb-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous projects"
            className="flex h-10 w-10 items-center justify-center border border-line text-base text-smoke transition-colors hover:border-bone hover:text-bone"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next projects"
            className="flex h-10 w-10 items-center justify-center border border-line text-base text-smoke transition-colors hover:border-bone hover:text-bone"
          >
            &rarr;
          </button>
        </div>
      )}
      <div
        ref={track}
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
            move(-1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          if (!track.current) return;
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startScroll: track.current.scrollLeft,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || !track.current || drag.pointerId !== event.pointerId) return;
          const delta = event.clientX - drag.startX;
          if (Math.abs(delta) > 6) drag.moved = true;
          if (drag.moved) track.current.scrollLeft = drag.startScroll - delta;
        }}
        onPointerUp={(event) => {
          if (dragRef.current?.pointerId !== event.pointerId) return;
          setTimeout(() => {
            dragRef.current = null;
          }, 0);
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
        onClickCapture={(event) => {
          if (dragRef.current?.moved) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        className="project-focus-deck no-scrollbar flex cursor-grab gap-6 overflow-x-auto px-2 py-3 select-none active:cursor-grabbing focus-visible:outline-none"
      >
        {projects.map((project, index) => (
          <div
            key={project.id}
            className={cn(
              "project-focus-item shrink-0",
              project.category === "PORTRAIT_VIDEOS"
                ? "w-[min(72vw,18.5rem)]"
                : "w-[min(82vw,26rem)]",
            )}
          >
            <ProjectCard project={project} compact priority={eager && index < 2} />
          </div>
        ))}
      </div>
    </div>
  );
}
