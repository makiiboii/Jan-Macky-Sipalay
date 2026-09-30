"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = { id: string; slug: string; published: boolean; featured: boolean };

export function ProjectRowActions({ id, slug, published, featured }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function send(method: "PATCH" | "DELETE", body?: object) {
    setError("");
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
  }

  const small = "px-3 py-2 text-xs";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {published && (
        <Link href={`/projects/${slug}`} target="_blank" className={`btn btn-outline ${small}`}>
          View
        </Link>
      )}
      <Link href={`/admin/projects/${id}`} className={`btn btn-outline ${small}`}>
        Edit
      </Link>
      <button disabled={pending} onClick={() => send("PATCH", { published: !published })} className={`btn btn-outline ${small}`}>
        {published ? "Unpublish" : "Publish"}
      </button>
      <button disabled={pending} onClick={() => send("PATCH", { featured: !featured })} className={`btn btn-outline ${small}`}>
        {featured ? "Unfeature" : "Feature"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this project and its gallery? This cannot be undone.")) send("DELETE");
        }}
        className={`btn btn-danger ${small}`}
      >
        Delete
      </button>
      {error && <span className="w-full text-xs text-red-400">{error}</span>}
    </div>
  );
}
