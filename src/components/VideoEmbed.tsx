import { getGoogleDriveEmbedUrl } from "@/lib/drive";

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const embedUrl = getGoogleDriveEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center border border-line p-6 text-center text-smoke">
        This video link is not valid, so the player can&rsquo;t load.
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden bg-neutral-950">
      <iframe
        src={embedUrl}
        title={`${title} video`}
        loading="lazy"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
