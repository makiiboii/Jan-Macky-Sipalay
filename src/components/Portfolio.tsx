"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_LABELS, type CategoryValue } from "@/lib/constants";
import type { ProjectCardData } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";

type Filter = "ALL" | CategoryValue;
const FILTERS: Filter[] = ["ALL", ...CATEGORIES];

type ViewMode = "reel" | "grid";

export function Portfolio({ projects }: { projects: ProjectCardData[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("reel");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects.filter(
      (project) =>
        (filter === "ALL" || project.category === filter) &&
        (!term || project.title.toLowerCase().includes(term)),
    );
  }, [projects, filter, query]);

  // For the infinite filmstrip: duplicate visible list so it loops seamlessly (-50% translation)
  const marqueeList = useMemo(() => {
    if (visible.length === 0) return [];
    let items = [...visible];
    // Ensure we have at least 6 items per half so wide screens never run out
    while (items.length < 5) {
      items = [...items, ...visible];
    }
    return [...items, ...items];
  }, [visible]);

  return (
    <div>
      {/* Controls Bar: Categories + Search + View Switcher */}
      <div className="flex flex-col gap-6 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter by category"
          className="no-scrollbar -mx-5 flex gap-7 overflow-x-auto px-5 md:mx-0 md:px-0"
        >
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              className={cn(
                "shrink-0 border-b py-2 text-sm tracking-[0.16em] transition-colors",
                filter === item ? "border-bone text-bone" : "border-transparent text-smoke hover:text-bone",
              )}
            >
              {item === "ALL" ? "ALL" : CATEGORY_LABELS[item].toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-5 sm:gap-6">
          {/* Search bar */}
          <label className="block flex-1 sm:w-60 md:w-64">
            <span className="sr-only">Search projects by title</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects..."
              className="w-full border-b border-neutral-800 bg-transparent py-2 text-sm text-bone placeholder:text-neutral-600 focus:border-bone focus:outline-none"
            />
          </label>

          {/* View mode toggle: Reel vs Grid */}
          <div className="flex items-center gap-1 border border-neutral-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("reel")}
              aria-pressed={viewMode === "reel"}
              className={cn(
                "px-3 py-1.5 tracking-wider transition-colors",
                viewMode === "reel"
                  ? "bg-bone text-black font-semibold"
                  : "text-smoke hover:text-bone",
              )}
            >
              REEL
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              className={cn(
                "px-3 py-1.5 tracking-wider transition-colors",
                viewMode === "grid"
                  ? "bg-bone text-black font-semibold"
                  : "text-smoke hover:text-bone",
              )}
            >
              GRID
            </button>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-24 text-smoke">No projects match. Try another category or clear the search.</p>
      ) : viewMode === "reel" ? (
        /* Infinite Continuous Moving Filmstrip */
        <div className="mt-10">
          <div className="relative -mx-5 px-5 md:-mx-10 md:px-10 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
            <div
              className="animate-marquee gap-6 sm:gap-8"
              style={
                {
                  "--marquee-duration": `${Math.max(22, marqueeList.length * 4.2)}s`,
                } as React.CSSProperties
              }
            >
              {marqueeList.map((project, idx) => (
                <div
                  key={`${project.id}-${idx}`}
                  className="w-[280px] sm:w-[380px] md:w-[460px] shrink-0"
                >
                  <ProjectCard project={project} priority={idx < 3} />
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-xs tracking-widest text-neutral-500 uppercase">
            Hover or touch to pause · Click to view project
          </p>
        </div>
      ) : (
        /* Classic 2-Column Grid */
        <div key={filter} className="mt-10 grid gap-x-6 gap-y-14 md:grid-cols-2 md:gap-y-20">
          {visible.map((project, index) => (
            <Reveal key={project.id} delay={(index % 2) * 90}>
              <ProjectCard project={project} priority={index < 2} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
