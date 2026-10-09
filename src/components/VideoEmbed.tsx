"use client";

import { useState } from "react";
import { Cover } from "./Cover";
import { cn } from "@/lib/utils";
import { getVideoEmbed } from "@/lib/video";

function isPortraitVideoUrl(url: string) {
  return /\/(shorts|reel|reels)\//i.test(url);
}

export function VideoEmbed({
  url,
  title,
  posterUrl,
  portrait = false,
}: {
  url: string;
  title: string;
  posterUrl?: string | null;
  portrait?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const embedInfo = getVideoEmbed(url);
  const isPortrait = portrait || isPortraitVideoUrl(url);

  if (!embedInfo) {
    return (
      <div className="mx-auto flex aspect-video max-w-4xl items-center justify-center border border-line p-6 text-center text-smoke">
        This video link is not valid or supported, so the player can&rsquo;t
        load.
      </div>
    );
  }

  const providerLabel =
    embedInfo.provider === "facebook"
      ? "Facebook"
      : embedInfo.provider === "youtube"
        ? "YouTube"
        : embedInfo.provider === "vimeo"
          ? "Vimeo"
          : "Google Drive";

  const showPoster = Boolean(posterUrl && !playing);

  const activeEmbedUrl =
    playing &&
    (embedInfo.provider === "youtube" || embedInfo.provider === "vimeo")
      ? `${embedInfo.embedUrl}${embedInfo.embedUrl.includes("?") ? "&" : "?"}autoplay=1`
      : embedInfo.embedUrl;

  return (
    <div
      className={cn(
        "mx-auto w-full space-y-3",
        isPortrait ? "max-w-[340px] sm:max-w-[360px]" : "max-w-4xl",
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden border border-line bg-black",
          isPortrait ? "aspect-[9/16]" : "aspect-video",
        )}
      >
        {showPoster ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title} video`}
            className="group relative block h-full w-full text-left"
          >
            <Cover
              src={posterUrl}
              alt={`${title} video poster`}
              sizes={isPortrait ? "360px" : "(min-width: 1024px) 896px, 100vw"}
              priority
              className={cn(
                "transition-transform duration-700 ease-out group-hover:scale-[1.02]",
                isPortrait ? "object-contain" : "object-cover",
              )}
            />
            <span className="absolute inset-0 bg-black/35 transition-colors duration-300 group-hover:bg-black/20" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex items-center gap-2.5 border border-bone/80 bg-black/80 px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-bone backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path d="M4 2.5v11l9-5.5-9-5.5Z" />
                </svg>
                Play video
              </span>
            </span>
          </button>
        ) : (
          <iframe
            src={activeEmbedUrl}
            title={`${title} video`}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-smoke">
        <span className="uppercase tracking-[0.14em] text-muted">
          {isPortrait ? "9:16 Portrait Format" : "16:9 Landscape Format"}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-smoke transition-colors hover:text-bone"
        >
          <span>Watch directly on {providerLabel}</span>
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </div>
  );
}
