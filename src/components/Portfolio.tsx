"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_LABELS, type CategoryValue } from "@/lib/constants";
import type { ProjectCardData } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";

type Filter = "ALL" | CategoryValue;
const FILTERS: Filter[] = ["ALL", ...CATEGORIES];

export function Portfolio({ projects }: { projects: ProjectCardData[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects.filter(
      (project) =>
        (filter === "ALL" || project.category === filter) && (!term || project.title.toLowerCase().includes(term)),
    );
  }, [projects, filter, query]);

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-line pb-4 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-5 flex gap-7 overflow-x-auto px-5 md:mx-0 md:px-0">
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

        <label className="block md:w-64">
          <span className="sr-only">Search projects by title</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects..."
            className="w-full border-b border-neutral-800 bg-transparent py-2 text-sm text-bone placeholder:text-neutral-600 focus:border-bone focus:outline-none"
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="py-24 text-smoke">No projects match. Try another category or clear the search.</p>
      ) : (
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
