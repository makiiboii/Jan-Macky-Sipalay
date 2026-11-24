"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import type { ProjectCardData } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SmartAutoplayVideo } from "./SmartAutoplayVideo";

export interface RealEstateItem {
  id: string;
  part: string;
  title: string;
  fileTag: string;
  slug: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  description: string;
  location: string;
  roles: string[];
}

export const REAL_ESTATE_ITEMS: RealEstateItem[] = [
  {
    id: "re-acp004-1-4",
    part: "01",
    title: "Open Workspace & Workstation Pods",
    fileTag: "#ACP004 1_4",
    slug: "real-estate-walkthrough-open-workspace-acp004-1-4",
    videoUrl: "/videos/real-estate/acp004-1-4.mp4",
    thumbnailUrl: "/videos/real-estate/acp004-1-4-thumb.jpg",
    duration: "0:40",
    description: "",
    location: "Commercial Real Estate",
    roles: ["Videographer", "Editor", "Colorist"],
  },
  {
    id: "re-acp004-2-3",
    part: "02",
    title: "Interior Finishes & Brand Collateral",
    fileTag: "#ACP004 2_3",
    slug: "real-estate-walkthrough-property-details-acp004-2-3",
    videoUrl: "/videos/real-estate/acp004-2-3.mp4",
    thumbnailUrl: "/videos/real-estate/acp004-2-3-thumb.jpg",
    duration: "0:39",
    description: "",
    location: "Commercial Real Estate",
    roles: ["Videographer", "Editor", "Colorist"],
  },
  {
    id: "re-acp004-4-4",
    part: "03",
    title: "Breakout Lounge & Arched Feature Wall",
    fileTag: "#ACP004 4_4",
    slug: "real-estate-walkthrough-breakout-lounge-acp004-4-4",
    videoUrl: "/videos/real-estate/acp004-4-4.mp4",
    thumbnailUrl: "/videos/real-estate/acp004-4-4-thumb.jpg",
    duration: "0:41",
    description: "",
    location: "Commercial Real Estate",
    roles: ["Videographer", "Editor", "Colorist"],
  },
  {
    id: "re-acp004-5-4",
    part: "04",
    title: "Executive Boardroom & Meeting Suite",
    fileTag: "#ACP004 5_4",
    slug: "real-estate-walkthrough-executive-suite-acp004-5-4",
    videoUrl: "/videos/real-estate/acp004-5-4.mp4",
    thumbnailUrl: "/videos/real-estate/acp004-5-4-thumb.jpg",
    duration: "0:55",
    description: "",
    location: "Commercial Real Estate",
    roles: ["Videographer", "Editor", "Colorist"],
  },
];

export function RealEstateWalkthrough({
  projects,
}: {
  projects?: ProjectCardData[];
}) {
  const [activeModalVideo, setActiveModalVideo] = useState<RealEstateItem | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  // Close modal on Escape key
  useEffect(() => {
    if (!activeModalVideo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveModalVideo(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeModalVideo]);

  return (
    <section
      id="real-estate"
      aria-labelledby="real-estate-heading"
      className="scroll-mt-16 border-t border-line px-3.5 py-10 sm:px-6 sm:py-16 md:px-10 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4 sm:mb-8 sm:pb-6 md:mb-10">
            <div>
              <p className="mb-1 text-[9px] uppercase tracking-[0.18em] text-smoke sm:text-xs">
                02 / Architectural Cinematography • 04 Walkthrough Films
              </p>
              <h2
                id="real-estate-heading"
                className="font-display text-2xl leading-none sm:text-4xl md:text-5xl"
              >
                Real Estate Walkthroughs
              </h2>
            </div>
          </div>
        </Reveal>

        {/* 2x2 Grid for 16:9 Landscape Videos */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:gap-8">
          {REAL_ESTATE_ITEMS.map((item, index) => (
            <Reveal key={item.id} delay={index * 80}>
              <article className="group relative flex h-full flex-col justify-between border border-white/12 bg-gradient-to-b from-white/[0.03] to-[#070707] p-2.5 sm:p-4">
                <div>
                  {/* Editorial Index + Category Top Bar */}
                  <div className="mb-2 flex items-center justify-between gap-1 text-[8px] uppercase tracking-[0.12em] sm:mb-3 sm:text-[10px] sm:tracking-[0.14em]">
                    <span className="inline-flex items-center gap-1.5 font-medium text-bone/90">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Part {item.part} / 04 • {item.fileTag}
                    </span>
                    <span className="border border-white/15 bg-black/75 px-1.5 py-0.5 text-[7px] text-smoke sm:text-[9px]">
                      16:9 • 4K • {item.duration}
                    </span>
                  </div>

                  {/* 16:9 Video Player Frame */}
                  <div className="relative aspect-video w-full overflow-hidden border border-line/60 bg-black">
                    <SmartAutoplayVideo
                      src={item.videoUrl}
                      poster={item.thumbnailUrl}
                      className="h-full w-full object-cover"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />

                    {/* Autoplay status badge */}
                    <div className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 border border-white/15 bg-black/75 px-1.5 py-0.5 text-[7px] uppercase tracking-[0.12em] text-bone backdrop-blur-sm sm:bottom-2.5 sm:left-2.5 sm:gap-1.5 sm:px-2 sm:text-[9px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Autoplay</span>
                    </div>

                    {/* Interactive Watch with Audio / Expand Button */}
                    <button
                      type="button"
                      onClick={() => setActiveModalVideo(item)}
                      aria-label={`Watch ${item.title} with audio and full controls`}
                      className="absolute bottom-2 right-2 inline-flex items-center gap-1 border border-white/20 bg-black/80 px-2 py-1 text-[7.5px] uppercase tracking-[0.12em] text-bone backdrop-blur-sm transition-all duration-200 hover:border-bone hover:bg-bone hover:text-black sm:bottom-2.5 sm:right-2.5 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[9px]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-3 w-3"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span>Watch with Sound</span>
                    </button>
                  </div>

                  {/* Title & Metadata */}
                  <div className="mt-3 flex items-baseline justify-between gap-2 sm:mt-4">
                    <Link
                      href={`/projects/${item.slug}`}
                      className="group-hover:text-white transition-colors"
                    >
                      <h3 className="font-display text-base leading-snug text-bone sm:text-lg md:text-xl">
                        {item.title}
                      </h3>
                    </Link>
                    <span className="shrink-0 text-[9px] tabular-nums text-smoke sm:text-xs">
                      2026
                    </span>
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[8px] sm:mt-4 sm:pt-2.5 sm:text-[10px]">
                  <span className="truncate text-muted">
                    {item.location}
                  </span>
                  <Link
                    href={`/projects/${item.slug}`}
                    className="inline-flex items-center gap-1 text-smoke transition-colors hover:text-bone"
                  >
                    <span>View project</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Cinematic Modal Player with Audio & Controls */}
      {activeModalVideo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeModalVideo.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-6"
          onClick={() => setActiveModalVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl border border-white/20 bg-[#0d0d0d] p-3 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-smoke sm:text-xs">
                  Part {activeModalVideo.part} / 04 • {activeModalVideo.fileTag}
                </p>
                <h3 className="font-display text-base text-bone sm:text-xl md:text-2xl">
                  {activeModalVideo.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalVideo(null)}
                aria-label="Close video player"
                className="inline-flex h-8 w-8 items-center justify-center border border-white/20 text-smoke transition-colors hover:border-bone hover:text-bone"
              >
                &times;
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full overflow-hidden border border-line bg-black">
              <video
                ref={modalVideoRef}
                src={activeModalVideo.videoUrl}
                poster={activeModalVideo.thumbnailUrl}
                controls
                autoPlay
                playsInline
                className="h-full w-full object-contain"
              />
            </div>

            {/* Modal Footer */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-smoke sm:mt-4">
              <span className="text-[10px] text-muted sm:text-xs">
                {activeModalVideo.location} • 4K Real Estate Walkthrough
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href={`/projects/${activeModalVideo.slug}`}
                  onClick={() => setActiveModalVideo(null)}
                  className="inline-flex items-center gap-1.5 border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-bone transition-colors hover:border-bone hover:bg-white/10"
                >
                  <span>Open Full Project Details</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
