import { cn } from "@/lib/utils";
import { getVideoEmbed } from "@/lib/video";

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const embedInfo = getVideoEmbed(url);

  if (!embedInfo) {
    return (
      <div className="flex aspect-video items-center justify-center border border-line p-6 text-center text-smoke">
        This video link is not valid or supported, so the player can&rsquo;t load.
      </div>
    );
  }

  const isDrive = embedInfo.provider === "drive";

  const providerLabel =
    embedInfo.provider === "facebook"
      ? "Facebook"
      : embedInfo.provider === "youtube"
      ? "YouTube"
      : embedInfo.provider === "vimeo"
      ? "Vimeo"
      : "Google Drive";

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative overflow-hidden bg-neutral-950",
          isDrive
            ? "aspect-[4/3] min-h-[270px] sm:min-h-0 sm:aspect-video"
            : "aspect-video",
        )}
      >
        <iframe
          src={embedInfo.embedUrl}
          title={`${title} video`}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <div className="flex justify-end">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-smoke transition-colors hover:text-bone"
        >
          <span>Watch directly on {providerLabel}</span>
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </div>
  );
}
