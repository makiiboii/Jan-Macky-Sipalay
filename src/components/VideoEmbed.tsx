"use client";

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
  autoPlay = true,
}: {
  url: string;
  title: string;
  posterUrl?: string | null;
  portrait?: boolean;
  autoPlay?: boolean;
}) {
  const embedInfo = getVideoEmbed(url, autoPlay);
  const isPortrait = portrait || isPortraitVideoUrl(url);

  if (!embedInfo) {
    return (
      <div className="mx-auto flex aspect-video max-w-4xl items-center justify-center border border-line p-6 text-center text-smoke">
        This video link is not valid or supported, so the player can&rsquo;t load.
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
          : embedInfo.provider === "direct"
            ? "Direct Video"
            : "Google Drive";

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
        {embedInfo.provider === "direct" ? (
          <video
            src={embedInfo.embedUrl}
            title={`${title} video`}
            autoPlay={autoPlay}
            muted={autoPlay}
            loop
            playsInline
            controls
            preload="metadata"
            poster={posterUrl || undefined}
            className="absolute inset-0 h-full w-full object-contain bg-black"
          />
        ) : (
          <iframe
            src={embedInfo.embedUrl}
            title={`${title} video`}
            loading="eager"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-smoke">
        <span className="uppercase tracking-[0.14em] text-muted">
          {isPortrait ? "9:16 Portrait Format" : "16:9 Landscape Format"}
          {autoPlay && (
            <span className="ml-2 lowercase text-smoke/70 tracking-normal">
              • autoplays muted
            </span>
          )}
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
