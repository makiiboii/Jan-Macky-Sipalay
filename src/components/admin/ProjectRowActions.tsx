"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  normalizeCategory,
  type CategoryValue,
} from "@/lib/constants";

type Props = {
  id: string;
  slug: string;
  category: string;
  published: boolean;
  featured: boolean;
  featureLimitReached: boolean;
};

export function ProjectRowActions({
  id,
  slug,
  category,
  published,
  featured,
  featureLimitReached,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const currentCategory = normalizeCategory(category);

  async function send(method: "PATCH" | "DELETE", body?: object) {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Something went wrong.");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  const isDisabled = pending || busy;
  const small = "px-3 py-2 text-xs";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor={`cat-${id}`}>
        Category
      </label>
      <select
        id={`cat-${id}`}
        aria-label="Project category"
        disabled={isDisabled}
        value={currentCategory}
        onChange={(e) =>
          send("PATCH", { category: e.target.value as CategoryValue })
        }
        className="border border-line bg-[#050505] px-2.5 py-2 text-xs text-bone focus:border-bone focus:outline-none disabled:opacity-50"
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

      {published && (
        <Link
          href={`/projects/${slug}`}
          target="_blank"
          className={`btn btn-outline ${small}`}
        >
          View
        </Link>
      )}
      <Link href={`/admin/projects/${id}`} className={`btn btn-outline ${small}`}>
        Edit
      </Link>
      <button
        disabled={isDisabled}
        onClick={() => send("PATCH", { published: !published })}
        className={`btn btn-outline ${small}`}
      >
        {published ? "Unpublish" : "Publish"}
      </button>
      <button
        disabled={isDisabled || (featureLimitReached && !featured)}
        title={
          featureLimitReached && !featured
            ? "Unfeature a project before featuring another."
            : undefined
        }
        onClick={() => send("PATCH", { featured: !featured })}
        className={`btn btn-outline ${small}`}
      >
        {featured ? "Unfeature" : "Feature"}
      </button>
      <button
        disabled={isDisabled}
        onClick={() => {
          if (
            confirm(
              "Delete this project and its gallery? This cannot be undone.",
            )
          ) {
            send("DELETE");
          }
        }}
        className={`btn btn-danger ${small}`}
      >
        Delete
      </button>
      {error && <span className="w-full text-xs text-red-400">{error}</span>}
    </div>
  );
}
