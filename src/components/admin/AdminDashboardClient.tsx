"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ProjectRowActions } from "@/components/admin/ProjectRowActions";
import { categoryLabel, rolesLabel } from "@/components/ProjectMeta";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  MAX_FEATURED,
  isProjectPortrait,
  normalizeCategory,
  type CategoryValue,
} from "@/lib/constants";
import { resolveImageUrl } from "@/lib/drive";
import type { getAdminProjects } from "@/lib/projects";
import { cn } from "@/lib/utils";

type AdminProject = Awaited<ReturnType<typeof getAdminProjects>>[number];
type CategoryFilter = "ALL" | CategoryValue;
type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "FEATURED";

const pad = (n: number) => String(n).padStart(2, "0");

export function AdminDashboardClient({
  projects,
}: {
  projects: AdminProject[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");

  const featuredProjects = useMemo(
    () => projects.filter((p) => p.featured).slice(0, MAX_FEATURED),
    [projects],
  );
  const featuredCount = projects.filter((p) => p.featured).length;
  const featureLimitReached = featuredCount >= MAX_FEATURED;
  const publishedCount = projects.filter((p) => p.published).length;
  const heroWallCount = projects.filter(
    (p) => p.published && (p.thumbnailUrl || p.images.length > 0),
  ).length;

  const categoryCounts = useMemo(() => {
    const counts = { ALL: projects.length } as Record<CategoryFilter, number>;
    for (const cat of CATEGORIES) {
      counts[cat] = projects.filter(
        (p) => normalizeCategory(p.category) === cat,
      ).length;
    }
    return counts;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects.filter((project) => {
      const cat = normalizeCategory(project.category);
      if (categoryFilter !== "ALL" && cat !== categoryFilter) return false;
      if (statusFilter === "PUBLISHED" && !project.published) return false;
      if (statusFilter === "DRAFT" && project.published) return false;
      if (statusFilter === "FEATURED" && !project.featured) return false;
      if (
        term &&
        !project.title.toLowerCase().includes(term) &&
        !(project.client && project.client.toLowerCase().includes(term))
      ) {
        return false;
      }
      return true;
    });
  }, [projects, categoryFilter, statusFilter, query]);

  async function toggleFeatured(id: string, nextFeatured: boolean) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: nextFeatured }),
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-12">
      {/* Overview Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="border border-line bg-white/[0.02] p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">
            Total Projects
          </p>
          <p className="font-display mt-1 text-3xl text-bone sm:text-4xl">
            {pad(projects.length)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {publishedCount} published · {projects.length - publishedCount} draft
          </p>
        </div>

        <div className="border border-line bg-white/[0.02] p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">
            Featured Works
          </p>
          <p className="font-display mt-1 text-3xl text-bone sm:text-4xl">
            {pad(featuredCount)} / {pad(MAX_FEATURED)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Curated showcase above Selected Work
          </p>
        </div>

        <div className="border border-line bg-white/[0.02] p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">
            Hero Thumbnail Wall
          </p>
          <p className="font-display mt-1 text-3xl text-bone sm:text-4xl">
            {pad(heroWallCount)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Active projects feeding Hero wall
          </p>
        </div>

        <div className="border border-line bg-white/[0.02] p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">
            Categories
          </p>
          <p className="font-display mt-1 text-3xl text-bone sm:text-4xl">
            {pad(CATEGORIES.length)}
          </p>
          <p className="mt-1 truncate text-xs text-muted">
            Videoshoot · Editing · 9:16 · Photo · AI
          </p>
        </div>
      </div>

      {/* Curated Featured Works (Max 4) Live Preview */}
      <section className="border border-line bg-white/[0.015] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-smoke">
              02 / Homepage Curated Showcase · {pad(featuredCount)} /{" "}
              {pad(MAX_FEATURED)}
            </p>
            <h2 className="font-display mt-1 text-2xl leading-none sm:text-3xl">
              Featured works slots
            </h2>
          </div>
          <p className="text-xs text-smoke">
            Maximum {MAX_FEATURED} projects appear in the Featured Works section
            above Selected Work.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: MAX_FEATURED }).map((_, slotIndex) => {
            const item = featuredProjects[slotIndex];
            if (!item) {
              return (
                <div
                  key={`empty-${slotIndex}`}
                  className="flex min-h-[11rem] flex-col items-center justify-center border border-dashed border-line/80 bg-black/40 p-4 text-center"
                >
                  <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
                    Slot {pad(slotIndex + 1)} / {pad(MAX_FEATURED)}
                  </span>
                  <p className="mt-1.5 text-xs text-smoke">
                    Empty featured slot
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    Click &ldquo;Feature&rdquo; on any project below
                  </p>
                </div>
              );
            }

            const cat = normalizeCategory(item.category);
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between border border-white/15 bg-[#070707] p-3"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.14em]">
                    <span className="inline-flex items-center gap-1.5 text-bone">
                      <span className="h-1.5 w-1.5 rounded-full bg-bone" />
                      {pad(slotIndex + 1)} / Featured
                    </span>
                    <span className="border border-white/15 px-1.5 py-0.5 text-[9px] text-smoke">
                      {categoryLabel(cat)}
                    </span>
                  </div>

                  <div className="relative aspect-video w-full overflow-hidden border border-line/60 bg-black">
                    {item.thumbnailUrl ? (
                      <img
                        src={resolveImageUrl(item.thumbnailUrl)}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                        No thumbnail
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/admin/projects/${item.id}`}
                    className="mt-2.5 block truncate font-medium text-sm text-bone hover:underline"
                  >
                    {item.title}
                  </Link>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5 text-xs">
                  <Link
                    href={`/admin/projects/${item.id}`}
                    className="text-smoke hover:text-bone"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={pending || busyId === item.id}
                    onClick={() => toggleFeatured(item.id, false)}
                    className="text-amber-300/90 hover:text-amber-200 disabled:opacity-50"
                  >
                    Unfeature
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Category Filter Tabs + Search + Status Filter */}
      <section>
        <div className="flex flex-col gap-4 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filter admin projects by category"
            className="flex flex-wrap gap-x-4 gap-y-1.5"
          >
            {(["ALL", ...CATEGORIES] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategoryFilter(item)}
                className={cn(
                  "flex items-center gap-1.5 border-b py-2 text-xs uppercase tracking-[0.15em] transition-colors",
                  categoryFilter === item
                    ? "border-bone font-medium text-bone"
                    : "border-transparent text-smoke hover:text-bone",
                )}
              >
                <span>
                  {item === "ALL" ? "All Categories" : CATEGORY_LABELS[item]}
                </span>
                <span className="text-[10px] tabular-nums text-muted">
                  ({pad(categoryCounts[item])})
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="border border-line bg-[#050505] px-3 py-2 text-xs uppercase tracking-wider text-bone focus:border-bone focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Drafts Only</option>
              <option value="FEATURED">Featured Only</option>
            </select>

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full border border-line bg-[#050505] px-3 py-2 text-xs text-bone placeholder:text-muted focus:border-bone focus:outline-none sm:w-56"
            />
          </div>
        </div>

        {/* Project Rows */}
        {filteredProjects.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm text-smoke">
              No projects match this filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter("ALL");
                setStatusFilter("ALL");
                setQuery("");
              }}
              className="btn btn-outline mt-4 text-xs"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-line border-b border-line">
            {filteredProjects.map((project) => {
              const cat = normalizeCategory(project.category);
              const isPortrait = isProjectPortrait(project);
              const inHeroWall =
                project.published &&
                Boolean(project.thumbnailUrl || project.images.length > 0);

              return (
                <li
                  key={project.id}
                  className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4 sm:items-center">
                    <div
                      className={cn(
                        "shrink-0 overflow-hidden border border-line/70 bg-black",
                        isPortrait ? "h-20 w-14" : "h-16 w-28",
                      )}
                    >
                      {project.thumbnailUrl ? (
                        <img
                          src={resolveImageUrl(project.thumbnailUrl)}
                          alt=""
                          className={cn(
                            "h-full w-full",
                            isPortrait ? "object-contain bg-[#080808]" : "object-cover",
                          )}
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                          No thumb
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="truncate text-lg font-medium text-bone hover:underline"
                        >
                          {project.title}
                        </Link>
                        {isPortrait && (
                          <span className="border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-smoke">
                            9:16 Portrait
                          </span>
                        )}
                        {project.featured && (
                          <span className="border border-bone/50 bg-bone/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-bone">
                            Featured
                          </span>
                        )}
                        {inHeroWall && (
                          <span className="border border-white/15 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-smoke">
                            Hero Wall
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-smoke sm:text-sm">
                        <span className="text-bone/90">
                          {categoryLabel(cat)}
                        </span>{" "}
                        · {project.year} ·{" "}
                        <span
                          className={
                            project.published
                              ? "text-green-400"
                              : "text-amber-400"
                          }
                        >
                          {project.published ? "Published" : "Draft"}
                        </span>
                        {project.roles.length > 0 && (
                          <span className="text-muted">
                            {" "}
                            · {rolesLabel(project.roles)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <ProjectRowActions
                    id={project.id}
                    slug={project.slug}
                    category={cat}
                    published={project.published}
                    featured={project.featured}
                    featureLimitReached={featureLimitReached}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
