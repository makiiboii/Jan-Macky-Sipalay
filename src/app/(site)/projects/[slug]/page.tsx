import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cover } from "@/components/Cover";
import { Gallery } from "@/components/Gallery";
import { categoryLabel } from "@/components/ProjectMeta";
import { VideoEmbed } from "@/components/VideoEmbed";
import { site } from "@/config/site";
import { ROLE_LABELS } from "@/lib/constants";
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
      ...(project.thumbnailUrl ? { images: [{ url: resolveImageUrl(project.thumbnailUrl) }] } : {}),
    },
    twitter: { card: "summary_large_image", title: project.title, description },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  const paragraphs = project.description.split(/\n{2,}/).filter(Boolean);

  return (
    <article className="px-5 pb-24 pt-24 sm:pt-28 md:px-10 md:pb-36 md:pt-36 max-w-full overflow-hidden">
      <Link href="/#work" className="text-sm text-smoke transition-colors hover:text-bone">
        Back to work
      </Link>

      <h1 className="font-display mt-6 text-[clamp(2.2rem,8.5vw,11rem)] leading-[0.9] break-words">{project.title}</h1>

      <div className="relative mt-8 sm:mt-10 aspect-[4/3] overflow-hidden bg-neutral-950 sm:aspect-[16/9] md:mt-14">
        <Cover src={project.thumbnailUrl} alt={`${project.title} thumbnail`} sizes="100vw" priority />
      </div>

      <dl className="mt-8 sm:mt-10 grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8 border-b border-line pb-10 md:grid-cols-4">
        <div>
          <dt className="text-sm text-smoke">Year</dt>
          <dd className="mt-2 text-lg">{project.year}</dd>
        </div>
        <div>
          <dt className="text-sm text-smoke">Category</dt>
          <dd className="mt-2 text-lg break-words">{categoryLabel(project.category)}</dd>
        </div>
        {project.client && (
          <div>
            <dt className="text-sm text-smoke">Client</dt>
            <dd className="mt-2 text-lg break-words">{project.client}</dd>
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
        <section aria-label="Description" className="mt-10 grid md:grid-cols-12">
          <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-bone/80 md:col-span-8 md:col-start-5">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {project.videoUrl && (
        <section aria-label="Video" className="mt-16 md:mt-24">
          <VideoEmbed url={project.videoUrl} title={project.title} />
        </section>
      )}

      {project.images.length > 0 && (
        <section aria-label="Photo gallery" className="mt-16 md:mt-24">
          <Gallery images={project.images} title={project.title} />
        </section>
      )}
    </article>
  );
}
