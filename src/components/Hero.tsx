"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { site } from "@/config/site";
import { resolveImageUrl } from "@/lib/drive";
import { gsap } from "@/lib/gsap";
import type { ProjectCardData } from "@/lib/projects";
import { cn } from "@/lib/utils";

const lines = ["Making visuals", "that move people."];

type WallTile = {
  id: string;
  src: string;
  aspect: "landscape" | "portrait" | "editorial";
};

const COLUMN_CONFIGS = [
  { direction: "up" as const, duration: "68s", mobileVisible: true },
  { direction: "down" as const, duration: "78s", mobileVisible: true },
  { direction: "up" as const, duration: "62s", mobileVisible: true },
  { direction: "down" as const, duration: "84s", mobileVisible: false },
  { direction: "up" as const, duration: "72s", mobileVisible: false },
];

function toLightweightThumb(url: string): string {
  const resolved = resolveImageUrl(url);
  return resolved.replace("&sz=w2000", "&sz=w700");
}

export function Hero({ projects = [] }: { projects?: ProjectCardData[] }) {
  const container = useRef<HTMLElement>(null);
  const [pageHidden, setPageHidden] = useState(false);

  // Pause wall animations when browser tab is hidden to save GPU/CPU
  useEffect(() => {
    const onVisibilityChange = () => {
      setPageHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // Build unique thumbnail pool from actual uploaded projects + album images
  const columns = useMemo(() => {
    const seen = new Set<string>();
    const rawTiles: WallTile[] = [];

    for (const project of projects) {
      if (project.thumbnailUrl && project.thumbnailUrl.trim()) {
        const src = toLightweightThumb(project.thumbnailUrl);
        if (!seen.has(src)) {
          seen.add(src);
          const aspect: WallTile["aspect"] =
            project.category === "PORTRAIT_VIDEOS"
              ? "portrait"
              : project.category === "PHOTOGRAPHY"
                ? "editorial"
                : "landscape";
          rawTiles.push({
            id: `thumb-${project.id}`,
            src,
            aspect,
          });
        }
      }

      if (project.images && project.images.length > 0) {
        for (const image of project.images) {
          if (!image.url || !image.url.trim()) continue;
          const src = toLightweightThumb(image.url);
          if (!seen.has(src)) {
            seen.add(src);
            rawTiles.push({
              id: `img-${image.id}`,
              src,
              aspect: "editorial",
            });
          }
        }
      }
    }

    if (rawTiles.length === 0) return [];

    // Mix aspect ratios per column so landscape & portrait frames interlock like a cinematic collage
    const aspectPattern: WallTile["aspect"][] = [
      "landscape",
      "editorial",
      "landscape",
      "portrait",
      "landscape",
      "editorial",
    ];

    const minItemsPerCol = 8;

    return COLUMN_CONFIGS.map((config, colIndex) => {
      const colTiles: WallTile[] = [];
      const count = Math.max(minItemsPerCol, Math.ceil(rawTiles.length / 2));
      for (let i = 0; i < count; i++) {
        const sourceIndex = (colIndex * 3 + i * 2) % rawTiles.length;
        const base = rawTiles[sourceIndex];
        const variedAspect =
          base.aspect === "portrait"
            ? "portrait"
            : aspectPattern[(colIndex + i) % aspectPattern.length];
        colTiles.push({
          id: `col-${colIndex}-tile-${i}-${base.id}`,
          src: base.src,
          aspect: variedAspect,
        });
      }
      return {
        ...config,
        tiles: colTiles,
      };
    });
  }, [projects]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(".hero-line > span", {
        yPercent: 110,
        duration: 1.05,
        stagger: 0.13,
      }).from(
        ".hero-sub",
        { opacity: 0, y: 22, duration: 0.8, ease: "power3.out" },
        "-=0.55",
      );
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="hero-section relative isolate flex min-h-[82svh] flex-col justify-between overflow-hidden px-5 pb-14 pt-24 sm:px-8 sm:pt-28 md:min-h-[88svh] md:px-10 md:pb-16"
    >
      {/* Layer 0: Multi-Column Animated Project Thumbnail Wall */}
      {columns.length > 0 && (
        <div
          aria-hidden="true"
          data-paused={pageHidden ? "true" : "false"}
          className="hero-wall pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
        >
          <div className="hero-wall__plane">
            {columns.map((column, colIdx) => (
              <div
                key={colIdx}
                className={cn(
                  "hero-wall__column",
                  !column.mobileVisible && "hidden md:flex",
                )}
              >
                <div
                  className={cn(
                    "hero-wall__track",
                    column.direction === "up"
                      ? "hero-wall__track--up"
                      : "hero-wall__track--down",
                  )}
                  style={
                    {
                      "--wall-duration": column.duration,
                    } as React.CSSProperties
                  }
                >
                  {/* Stack A + Stack B for seamless -50% GPU transform loop */}
                  {[0, 1].map((stackIndex) => (
                    <div key={stackIndex} className="hero-wall__stack">
                      {column.tiles.map((tile, tileIdx) => (
                        <div
                          key={`${stackIndex}-${tile.id}`}
                          className={cn(
                            "hero-wall__tile",
                            tile.aspect === "portrait" && "aspect-[9/14]",
                            tile.aspect === "editorial" && "aspect-[4/5]",
                            tile.aspect === "landscape" && "aspect-[16/10]",
                          )}
                        >
                          <img
                            src={tile.src}
                            alt=""
                            loading={
                              stackIndex === 0 && colIdx < 3 && tileIdx < 2
                                ? "eager"
                                : "lazy"
                            }
                            decoding="async"
                            draggable={false}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layer 1: Dark Cinematic Overlay & Soft Edge Vignette */}
      <div
        aria-hidden="true"
        className="hero-wall__overlay pointer-events-none absolute inset-0 z-[1]"
      />

      {/* Layer 2: Crisp Foreground Hero Content */}
      <div className="relative z-10 mb-10 flex items-center justify-between border-b border-white/15 pb-3 text-[11px] uppercase tracking-[0.18em] text-smoke">
        <p className="hero-sub">Independent visual creative</p>
        <p className="hero-sub">Digos City · Philippines</p>
      </div>

      <div className="relative z-10 my-auto grid items-end gap-8 py-6 md:grid-cols-12 md:gap-8">
        <h1 className="font-display text-[clamp(3rem,9vw,7.25rem)] leading-[0.88] text-bone drop-shadow-[0_12px_36px_rgba(0,0,0,0.9)] md:col-span-8">
          {lines.map((line) => (
            <span key={line} className="hero-line">
              <span>{line}</span>
            </span>
          ))}
        </h1>

        <div className="hero-sub max-w-md md:col-span-4 md:pb-1">
          <p className="text-base leading-relaxed text-bone/90 drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] sm:text-lg">
            {site.heroDescription}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-smoke/80">
            {site.disciplines.slice(0, 4).join(" · ")}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/#work"
              className="btn btn-solid px-6 py-3 text-xs uppercase tracking-[0.16em]"
            >
              Explore work
            </Link>
            <Link
              href="/#contact"
              className="btn btn-outline bg-black/45 px-6 py-3 text-xs uppercase tracking-[0.16em] backdrop-blur-sm"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
