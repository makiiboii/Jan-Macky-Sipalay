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

  return (
    <div className="relative aspect-video overflow-hidden bg-neutral-950">
      <iframe
        src={embedInfo.embedUrl}
        title={`${title} video`}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
