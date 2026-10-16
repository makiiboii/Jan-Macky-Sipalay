"use client";
/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  MAX_FEATURED,
  ROLES,
  ROLE_LABELS,
  normalizeCategory,
  type CategoryValue,
  type RoleValue,
} from "@/lib/constants";
import { resolveImageUrl } from "@/lib/drive";
import { getVideoEmbed } from "@/lib/video";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";

type ImageRow = { url: string; caption: string };

export type ProjectFormValues = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  year: string;
  client: string;
  featured: boolean;
  published: boolean;
  isPortrait?: boolean;
  thumbnailUrl: string;
  videoUrl: string;
  roles: RoleValue[];
  images: ImageRow[];
};

export function ProjectForm({
  project,
  featureLimitReached = false,
}: {
  project?: ProjectFormValues;
  featureLimitReached?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const [description, setDescription] = useState(project?.description ?? "");
  const [category, setCategory] = useState<CategoryValue>(
    project?.category ? normalizeCategory(project.category) : "VIDEOGRAPHY",
  );
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (project?.isPortrait !== undefined) return project.isPortrait;
    if (project?.category === "PORTRAIT_VIDEOS") return true;
    if (project?.videoUrl && /\/(shorts|reel|reels)\//i.test(project.videoUrl)) return true;
    return false;
  });
  const [year, setYear] = useState(
    project?.year ?? String(new Date().getFullYear()),
  );
  const [client, setClient] = useState(project?.client ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [published, setPublished] = useState(project?.published ?? false);
  const [thumbnailUrl, setThumbnailUrl] = useState(project?.thumbnailUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(project?.videoUrl ?? "");
  const [roles, setRoles] = useState<RoleValue[]>(project?.roles ?? []);
  const [images, setImages] = useState<ImageRow[]>(project?.images ?? []);
  const [bulk, setBulk] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const trimmedVideo = videoUrl.trim();
  const videoEmbedInfo = trimmedVideo ? getVideoEmbed(trimmedVideo) : null;
  const cannotFeature = featureLimitReached && !featured;
  const isPortraitActive = isPortrait || category === "PORTRAIT_VIDEOS";

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleRole(role: RoleValue) {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    );
  }

  function updateImage(index: number, patch: Partial<ImageRow>) {
    setImages((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addBulk() {
    const urls = bulk
      .split(/\s+/)
      .map((url) => url.trim())
      .filter(Boolean);
    if (urls.length === 0) return;
    setImages((current) => [
      ...current,
      ...urls.map((url) => ({ url, caption: "" })),
    ]);
    setBulk("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFieldErrors({});

    try {
      const res = await fetch(
        project ? `/api/projects/${project.id}` : "/api/projects",
        {
          method: project ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            slug,
            description,
            category,
            year: Number(year),
            client,
            featured,
            published,
            isPortrait: isPortraitActive,
            thumbnailUrl,
            videoUrl,
            roles,
            images: images
              .filter((row) => row.url.trim())
              .map((row) => ({ url: row.url, caption: row.caption })),
          }),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Could not save the project.");
        setFieldErrors(data?.fieldErrors ?? {});
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError(
        "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (
      !project ||
      !confirm("Delete this project and its gallery? This cannot be undone.")
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Could not delete the project.");
        setBusy(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  const errorFor = (name: string) =>
    fieldErrors[name]?.[0] ? (
      <p className="mt-1 text-sm text-red-400">{fieldErrors[name][0]}</p>
    ) : null;

  return (
    <form onSubmit={submit} className="space-y-10">
      <section className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="title" className="label">
            Title
          </label>
          <input
            id="title"
            required
            maxLength={120}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="field"
          />
          {errorFor("title")}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="slug" className="label">
            Page address
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">/projects/</span>
            <input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="generated-from-title"
              className="field"
            />
          </div>
          <p className="mt-1 text-xs text-muted">
            Leave it empty to generate it from the title. If it is taken, a
            number is added.
          </p>
          {errorFor("slug")}
        </div>

        <div>
          <label htmlFor="category" className="label">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => {
              const next = normalizeCategory(e.target.value);
              setCategory(next);
              if (next === "PORTRAIT_VIDEOS") setIsPortrait(true);
            }}
            className="field bg-[#050505] text-bone"
          >
            {CATEGORIES.map((item) => (
              <option
                key={item}
                value={item}
                className="bg-[#050505] text-[#f5f5f5]"
              >
                {CATEGORY_LABELS[item]}
              </option>
            ))}
          </select>
          <div
            role="group"
            aria-label="Quick category selection"
            className="mt-2.5 flex flex-wrap gap-2"
          >
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => {
                  setCategory(item);
                  if (item === "PORTRAIT_VIDEOS") setIsPortrait(true);
                }}
                className={cn(
                  "border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors",
                  category === item
                    ? "border-bone bg-bone font-semibold text-black"
                    : "border-line text-smoke hover:border-bone hover:text-bone",
                )}
              >
                {CATEGORY_LABELS[item]}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {isPortraitActive
              ? "Portrait mode active: 9:16 vertical frame for Reels, TikTok, Shorts, and vertical thumbnails."
              : category === "AI_GENERATED"
                ? "AI Generated Hybrid Editing highlights AI-assisted video, UGC, and generative visual projects."
                : category === "POSTER_GRAPHICS"
                  ? "Posters & Graphics showcases promotional posters, graphic designs, key visual art, and cover layouts."
                  : category === "PHOTOGRAPHY"
                    ? "Photography displays still images and albums with full-screen lightbox viewing."
                    : category === "VIDEOGRAPHY"
                      ? "Videoshoot showcases on-location filming, event coverage, SDEs, and directed shoots."
                      : "Video Editing showcases cuts, color grading, and post-production edits."}
          </p>
          {errorFor("category")}
        </div>

        {/* Video & Thumbnail Orientation Selector */}
        <div className="md:col-span-2 rounded border border-line/60 bg-white/[0.015] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-bone">
                Video &amp; Thumbnail Orientation
              </span>
              <p className="mt-1 text-xs text-muted">
                Choose <strong>9:16 Portrait</strong> to post vertical Reels, TikToks, Shorts, or vertical thumbnails in <em>any</em> category (Videoshoot, Video Editing, AI Generated Hybrid Editing, etc.).
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPortrait(false)}
                aria-pressed={!isPortraitActive}
                className={cn(
                  "inline-flex items-center gap-2 border px-3.5 py-2 text-xs uppercase tracking-wider transition-colors",
                  !isPortraitActive
                    ? "border-bone bg-bone font-semibold text-black"
                    : "border-line text-smoke hover:border-bone hover:text-bone",
                )}
              >
                <span className="inline-block h-2.5 w-4 border border-current" aria-hidden="true" />
                16:9 Landscape
              </button>
              <button
                type="button"
                onClick={() => setIsPortrait(true)}
                aria-pressed={isPortraitActive}
                className={cn(
                  "inline-flex items-center gap-2 border px-3.5 py-2 text-xs uppercase tracking-wider transition-colors",
                  isPortraitActive
                    ? "border-bone bg-bone font-semibold text-black"
                    : "border-line text-smoke hover:border-bone hover:text-bone",
                )}
              >
                <span className="inline-block h-3.5 w-2 border border-current" aria-hidden="true" />
                9:16 Portrait
              </button>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="year" className="label">
            Year
          </label>
          <input
            id="year"
            type="number"
            required
            min={1990}
            max={2100}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="field"
          />
          {errorFor("year")}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="client" className="label">
            Client (optional)
          </label>
          <input
            id="client"
            maxLength={120}
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="field"
          />
        </div>

        <fieldset className="md:col-span-2">
          <legend className="label">My role</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {ROLES.map((role) => (
              <label key={role} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="h-4 w-4 accent-neutral-200"
                />
                {ROLE_LABELS[role]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="md:col-span-2">
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            rows={6}
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="field"
          />
          <p className="mt-1 text-xs text-muted">
            Plain text. Leave a blank line between paragraphs.
          </p>
          {errorFor("description")}
        </div>
      </section>

      <section className="space-y-6 border-t border-line pt-10">
        <div>
          <label htmlFor="thumbnail" className="label">
            Thumbnail image URL
          </label>
          <input
            id="thumbnail"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://..."
            className="field"
          />
          <p className="mt-1 text-xs text-muted">
            An https:// image link or a Google Drive image link (shared as
            &ldquo;Anyone with the link&rdquo;). Published thumbnails are
            automatically included in the Hero animated background wall.
          </p>
          {errorFor("thumbnailUrl")}
          {thumbnailUrl.trim() && (
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div
                className={cn(
                  "overflow-hidden border border-line bg-black",
                  isPortraitActive ? "aspect-[9/16] w-36" : "h-36 w-64",
                )}
              >
                <img
                  src={resolveImageUrl(thumbnailUrl.trim())}
                  alt="Thumbnail preview"
                  className={cn(
                    "h-full w-full",
                    isPortraitActive ? "object-contain bg-[#080808]" : "object-cover",
                  )}
                />
              </div>
              <div className="space-y-1">
                <span className="block border border-white/15 bg-white/[0.03] px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-smoke">
                  Format: {isPortraitActive ? "9:16 Portrait" : "16:9 Landscape"}
                </span>
                <span className="block border border-white/15 bg-white/[0.03] px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-smoke">
                  {published ? "Active in Hero Thumbnail Wall" : "Will appear in Hero Wall when published"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="video" className="label">
            Video URL (YouTube, Facebook, Vimeo, or Google Drive)
          </label>
          <input
            id="video"
            value={videoUrl}
            onChange={(e) => {
              const val = e.target.value;
              setVideoUrl(val);
              if (/\/(shorts|reel|reels)\//i.test(val)) {
                setIsPortrait(true);
              }
            }}
            placeholder="https://www.youtube.com/watch?v=... or Facebook or Drive link"
            className="field"
          />
          <p className="mt-1 text-xs text-muted">
            Paste a link from <strong>YouTube</strong> (videos &amp; shorts),{" "}
            <strong>Facebook</strong> (videos &amp; reels), <strong>Vimeo</strong>,
            or <strong>Google Drive</strong> (shared to &ldquo;Anyone with the
            link&rdquo;).
          </p>
          {errorFor("videoUrl")}
          {trimmedVideo && !videoEmbedInfo && (
            <p className="mt-2 text-sm text-red-400">
              Please enter a valid YouTube, Facebook, Vimeo, or Google Drive
              video link.
            </p>
          )}
          {videoEmbedInfo && (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span>
                  Provider:{" "}
                  <strong className="uppercase text-bone">
                    {videoEmbedInfo.provider}
                  </strong>
                </span>
                <span className="uppercase tracking-wider text-smoke">
                  {isPortraitActive ? "9:16 Portrait Preview" : "16:9 Landscape Preview"}
                </span>
              </div>
              <div
                className={cn(
                  "relative overflow-hidden border border-line bg-black",
                  isPortraitActive
                    ? "aspect-[9/16] max-w-[260px]"
                    : "aspect-video max-w-xl",
                )}
              >
                <iframe
                  src={videoEmbedInfo.embedUrl}
                  title="Video preview"
                  loading="lazy"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-line pt-10">
        <h2 className="text-lg">Photography gallery</h2>
        <p className="mt-1 text-sm text-smoke">
          Photos show in this order on the project page. Add photos and select
          the Photography category to showcase still images in the photography
          carousel and full-screen lightbox.
        </p>

        {images.length > 0 && (
          <ul className="mt-6 space-y-3">
            {images.map((row, index) => (
              <li
                key={index}
                className="flex flex-col gap-3 border border-line p-3 sm:flex-row sm:items-center"
              >
                <div className="h-16 w-24 shrink-0 bg-black">
                  {row.url.trim() && (
                    <img
                      src={resolveImageUrl(row.url.trim())}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <input
                    aria-label={`Photo ${index + 1} URL`}
                    value={row.url}
                    onChange={(e) => updateImage(index, { url: e.target.value })}
                    placeholder="Image URL"
                    className="field"
                  />
                  <input
                    aria-label={`Photo ${index + 1} caption`}
                    value={row.caption}
                    maxLength={300}
                    onChange={(e) =>
                      updateImage(index, { caption: e.target.value })
                    }
                    placeholder="Caption (optional)"
                    className="field"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    className="btn btn-outline px-3 py-2 text-xs"
                    aria-label="Move up"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    className="btn btn-outline px-3 py-2 text-xs"
                    aria-label="Move down"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setImages((c) => c.filter((_, i) => i !== index))
                    }
                    className="btn btn-danger px-3 py-2 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {errorFor("images")}

        <div className="mt-6">
          <label htmlFor="bulk" className="label">
            Add photos (one URL per line)
          </label>
          <textarea
            id="bulk"
            rows={3}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder="https://..."
            className="field"
          />
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={addBulk} className="btn btn-outline">
              Add photos
            </button>
            <button
              type="button"
              onClick={() => setImages((c) => [...c, { url: "", caption: "" }])}
              className="btn btn-outline"
            >
              Add one blank row
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-10">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 accent-neutral-200"
          />
          Published (visible in Selected Work &amp; Hero Wall)
        </label>
        <label
          className={`flex items-center gap-2 text-sm ${cannotFeature ? "text-smoke/60" : ""}`}
        >
          <input
            type="checkbox"
            checked={featured}
            disabled={cannotFeature}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 accent-neutral-200"
          />
          Featured in Homepage Curated Showcase (max {MAX_FEATURED})
          {cannotFeature && (
            <span>
              — limit of {MAX_FEATURED} reached; unfeature another project first
            </span>
          )}
        </label>
      </section>

      {error && (
        <p role="alert" className="border border-red-900 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-line pt-8">
        <button type="submit" disabled={busy} className="btn btn-solid">
          {busy ? "Saving..." : project ? "Save changes" : "Create project"}
        </button>
        {project && (
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            className="btn btn-danger"
          >
            Delete project
          </button>
        )}
      </div>
    </form>
  );
}
