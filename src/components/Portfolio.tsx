"use client";

import { useMemo, useRef, useState } from "react";
import { CATEGORIES, CATEGORY_LABELS, type CategoryValue } from "@/lib/constants";
import type { ProjectCardData } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";

type Filter = "ALL" | CategoryValue;
const FILTERS: Filter[] = ["ALL", ...CATEGORIES];

type ViewMode = "reel" | "grid";

// Categories with fewer projects than this use the grid even in reel mode,
// so one or two projects are not repeated over and over in a looping filmstrip.
const MIN_REEL_ITEMS = 3;

const pad = (n: number) => String(n).padStart(2, "0");

export function Portfolio({ projects }: { projects: ProjectCardData[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("reel");
  const top = useRef<HTMLDivElement>(null);

  const matching = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? projects.filter((project) => project.title.toLowerCase().includes(term)) : projects;
  }, [projects, query]);

  const counts = useMemo(() => {
    const result = { ALL: matching.length } as Record<Filter, number>;
    for (const category of CATEGORIES) {
      result[category] = matching.filter((project) => project.category === category).length;
    }
    return result;
  }, [matching]);

  // "All" shows every category as its own section; a category tab shows just that category.
  const groups = useMemo(() => {
    const categories = filter === "ALL" ? CATEGORIES : [filter];
    return categories
      .map((category) => ({ category, projects: matching.filter((project) => project.category === category) }))
      .filter((group) => group.projects.length > 0);
  }, [matching, filter]);

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
          className="no-scrollbar -mx-5 flex gap-7 overflow-x-auto px-5 md:mx-0 md:px-0"
        >
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              className={cn(
                "group flex shrink-0 items-start gap-1.5 border-b py-2 text-sm tracking-[0.16em] transition-colors",
                filter === item ? "border-bone text-bone" : "border-transparent text-smoke hover:text-bone",
              )}
            >
              {item === "ALL" ? "ALL" : CATEGORY_LABELS[item].toUpperCase()}
              <span
                className={cn(
                  "text-[10px] tabular-nums tracking-normal transition-colors",
                  filter === item ? "text-bone/70" : "text-neutral-600 group-hover:text-smoke",
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
              className="w-full border-b border-neutral-800 bg-transparent py-2 text-sm text-bone placeholder:text-neutral-600 focus:border-bone focus:outline-none"
            />
          </label>

          {/* View mode toggle: Reel vs Grid */}
          <div className="flex items-center gap-1 border border-neutral-800 p-1 text-xs">
            {(["reel", "grid"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                className={cn(
                  "px-3 py-1.5 uppercase tracking-wider transition-colors",
                  viewMode === mode ? "bg-bone font-semibold text-black" : "text-smoke hover:text-bone",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {matching.length === 0 ? (
        <p className="py-24 text-smoke">No projects match. Try a different search.</p>
      ) : groups.length === 0 ? (
        <div className="py-24">
          <p className="text-smoke">No {CATEGORY_LABELS[filter as CategoryValue]} projects yet.</p>
          <button type="button" onClick={() => setFilter("ALL")} className="btn btn-outline mt-6">
            Show all projects
          </button>
        </div>
      ) : (
        <div key={filter} className={cn(filter === "ALL" ? "mt-14 space-y-20 md:mt-20 md:space-y-28" : "mt-10")}>
          {groups.map(({ category, projects: items }, groupIndex) => (
            <section key={category} aria-labelledby={filter === "ALL" ? `category-${category}` : undefined}>
              {/* Section header only in "All", where several categories are stacked */}
              {filter === "ALL" && (
                <Reveal>
                  <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-line pb-5 md:mb-10">
                    <div className="flex items-baseline gap-4">
                      <span className="text-sm tabular-nums text-neutral-600">{pad(groupIndex + 1)}</span>
                      <h3 id={`category-${category}`} className="font-display text-[clamp(1.9rem,4.5vw,3.75rem)] leading-none">
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
                        className="group inline-flex items-center gap-1.5 border-b border-neutral-700 pb-0.5 tracking-wide text-bone transition-colors hover:border-bone"
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

              {viewMode === "reel" && items.length >= MIN_REEL_ITEMS ? (
                <Filmstrip projects={items} eager={groupIndex === 0} />
              ) : (
                <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 md:gap-y-20">
                  {items.map((project, index) => (
                    <Reveal key={project.id} delay={(index % 2) * 90}>
                      <ProjectCard project={project} priority={groupIndex === 0 && index < 2} />
                    </Reveal>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** Infinite moving filmstrip. The list is repeated so it loops seamlessly (-50% translation). */
function Filmstrip({ projects, eager }: { projects: ProjectCardData[]; eager: boolean }) {
  const items = useMemo(() => {
    let list = [...projects];
    // Ensure each half has at least 5 cards so wide screens never run out
    while (list.length < 5) list = [...list, ...projects];
    return [...list, ...list];
  }, [projects]);

  return (
    <div>
      <div className="relative -mx-5 overflow-hidden px-5 pb-2 pt-5 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] md:-mx-10 md:px-10">
        <div
          className="animate-marquee gap-6 sm:gap-8"
          style={{ "--marquee-duration": `${Math.max(22, items.length * 4.2)}s` } as React.CSSProperties}
        >
          {items.map((project, idx) => (
            // Repeated copies are only visual: hide them from screen readers and keyboard focus.
            <div key={`${project.id}-${idx}`} inert={idx >= projects.length} className="w-[280px] shrink-0 sm:w-[380px] md:w-[460px]">
              <ProjectCard project={project} priority={eager && idx < 3} />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-xs uppercase tracking-widest text-neutral-500">
        Hover or touch to pause · Click to view project
      </p>
    </div>
  );
}
