import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { categoryLabel } from "@/components/ProjectMeta";
import { VideoEmbed } from "@/components/VideoEmbed";
import { site } from "@/config/site";
import { ROLE_LABELS, isProjectPortrait, normalizeCategory } from "@/lib/constants";
import { resolveImageUrl } from "@/lib/drive";
import { getPublishedProjectBySlug } from "@/lib/projects";
import { truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let project = null;
  try {
    project = await getPublishedProjectBySlug(slug);
  } catch {
    return { title: "Project" };
  }
  if (!project) return { title: "Project not found" };

  const description = project.description
    ? truncate(project.description, 160)
    : `${categoryLabel(project.category)} project by ${site.name}.`;

  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${project.title} — ${site.name}`,
      description,
      url: `/projects/${project.slug}`,
      ...(project.thumbnailUrl
        ? { images: [{ url: resolveImageUrl(project.thumbnailUrl) }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  const normalizedCat = normalizeCategory(project.category);
  const isPortrait = isProjectPortrait(project);
  const paragraphs = project.description.split(/\n{2,}/).filter(Boolean);
  const hasVideo = Boolean(project.videoUrl);

  // For photography or still-image projects without extra gallery rows, include the thumbnail in the lightbox gallery
  const galleryImages =
    project.images.length > 0
      ? project.images.map(({ id, url, caption }) => ({ id, url, caption }))
      : !hasVideo && project.thumbnailUrl
        ? [{ id: project.id, url: project.thumbnailUrl, caption: project.title }]
        : [];

  return (
    <article className="max-w-full overflow-hidden px-5 pb-24 pt-24 sm:pt-28 md:px-10 md:pb-36 md:pt-36">
      <Link
        href="/#work"
        className="text-sm text-smoke transition-colors hover:text-bone"
      >
        &larr; Back to work
      </Link>

      <header className="mt-8 border-b border-line pb-8 sm:mt-12 sm:pb-10">
        <p className="text-xs uppercase tracking-[0.18em] text-smoke">
          {categoryLabel(normalizedCat)} <span aria-hidden="true">/</span>{" "}
          {project.year}
        </p>
        <h1 className="font-display mt-5 max-w-6xl break-words text-4xl leading-[0.92] sm:text-6xl lg:text-7xl">
          {project.title}
        </h1>
      </header>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-6 border-b border-line py-7 sm:gap-x-6 sm:gap-y-8 sm:py-8 md:grid-cols-4">
        <div>
          <dt className="text-sm text-smoke">Year</dt>
          <dd className="mt-2 text-lg">{project.year}</dd>
        </div>
        <div>
          <dt className="text-sm text-smoke">Category</dt>
          <dd className="mt-2 break-words text-lg">
            {categoryLabel(normalizedCat)}
          </dd>
        </div>
        {project.client && (
          <div>
            <dt className="text-sm text-smoke">Client</dt>
            <dd className="mt-2 break-words text-lg">{project.client}</dd>
          </div>
        )}
        {project.roles.length > 0 && (
          <div>
            <dt className="text-sm text-smoke">My role</dt>
            <dd className="mt-2 space-y-1 text-lg">
              {project.roles.map((role) => (
                <span key={role} className="block">
                  {ROLE_LABELS[role]}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {paragraphs.length > 0 && (
        <section
          aria-label="Description"
          className="mt-8 grid gap-6 md:grid-cols-12 md:gap-10"
        >
          <h2 className="text-xs uppercase tracking-[0.18em] text-smoke md:col-span-3">
            About this project
          </h2>
          <div className="max-w-2xl space-y-5 text-base leading-relaxed text-bone/80 md:col-span-8 md:col-start-5 md:text-lg">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {project.videoUrl && (
        <section aria-label="Video" className="mt-12 md:mt-16">
          <VideoEmbed
            url={project.videoUrl}
            title={project.title}
            posterUrl={project.thumbnailUrl}
            portrait={isPortrait}
          />
        </section>
      )}

      {galleryImages.length > 0 && (
        <section aria-labelledby="photos-heading" className="mt-12 md:mt-16">
          <div className="mb-6 flex items-baseline justify-between gap-4 md:mb-8">
            <h2
              id="photos-heading"
              className="font-display text-3xl leading-none md:text-4xl"
            >
              {normalizedCat === "POSTER_GRAPHICS" ? "Posters & Graphics" : "Photos"}
            </h2>
            <span className="text-sm tabular-nums text-smoke">
              {String(galleryImages.length).padStart(2, "0")} · Click to view full screen
            </span>
          </div>
          <Gallery images={galleryImages} title={project.title} />
        </section>
      )}
    </article>
  );
}
