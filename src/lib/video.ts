import { getGoogleDriveEmbedUrl } from "./drive";

export type VideoProvider = "youtube" | "facebook" | "drive" | "vimeo" | "direct";

export type VideoEmbedInfo = {
  embedUrl: string;
  provider: VideoProvider;
};

/**
 * Extracts YouTube video ID and builds privacy-enhanced embed URL with autoplay parameters.
 */
export function getYouTubeEmbedUrl(url: string, autoPlay = true): string | null {
  try {
    const parsed = new URL(url.trim());
    const params = autoPlay ? "?autoplay=1&mute=1&playsinline=1&rel=0" : "?rel=0";

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0]?.split("?")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}${params}` : null;
    }

    const ytHosts = new Set([
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "music.youtube.com",
    ]);

    if (ytHosts.has(parsed.hostname)) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube-nocookie.com/embed/${id}${params}` : null;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/")[2]?.split("?")[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}${params}` : null;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/")[2]?.split("?")[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}${params}` : null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Builds Facebook video embed player URL.
 */
export function getFacebookEmbedUrl(url: string, autoPlay = true): string | null {
  try {
    const parsed = new URL(url.trim());
    const fbHosts = new Set([
      "facebook.com",
      "www.facebook.com",
      "m.facebook.com",
      "web.facebook.com",
      "fb.watch",
    ]);

    if (!fbHosts.has(parsed.hostname)) return null;

    const autoplayParam = autoPlay ? "&autoplay=true&mute=1" : "";
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      url.trim(),
    )}&show_text=0${autoplayParam}`;
  } catch {
    return null;
  }
}

/**
 * Extracts Vimeo video ID with autoplay parameters.
 */
export function getVimeoEmbedUrl(url: string, autoPlay = true): string | null {
  try {
    const parsed = new URL(url.trim());
    const params = autoPlay ? "?autoplay=1&muted=1&playsinline=1&autopause=0" : "";
    if (parsed.hostname === "vimeo.com" || parsed.hostname === "www.vimeo.com") {
      const match = parsed.pathname.match(/\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}${params}` : null;
    }
    if (parsed.hostname === "player.vimeo.com") {
      const sep = url.includes("?") ? "&" : "?";
      return autoPlay
        ? `${url.trim()}${sep}autoplay=1&muted=1&playsinline=1&autopause=0`
        : url.trim();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Checks if a URL points directly to an HTML5 video file or streaming CDN.
 * Handles both absolute URLs (https://...) and relative paths (/videos/...).
 */
export function getDirectVideoUrl(url: string): string | null {
  try {
    const trimmed = url.trim();
    if (!trimmed) return null;

    // Support relative paths, e.g. /videos/maison-cosmetics/volufine.mp4
    if (
      trimmed.startsWith("/") &&
      (trimmed.endsWith(".mp4") ||
        trimmed.endsWith(".webm") ||
        trimmed.endsWith(".ogg") ||
        trimmed.endsWith(".mov"))
    ) {
      return trimmed;
    }

    const parsed = new URL(trimmed);
    const path = parsed.pathname.toLowerCase();
    const isVideoFile =
      path.endsWith(".mp4") ||
      path.endsWith(".webm") ||
      path.endsWith(".ogg") ||
      path.endsWith(".mov") ||
      path.includes("/video/upload/") ||
      parsed.hostname.includes("streamable.com") ||
      parsed.hostname.includes("mux.com") ||
      parsed.hostname.includes("stream.cloudflare.com");

    return isVideoFile ? trimmed : null;
  } catch {
    return null;
  }
}

/**
 * Detects the video provider and returns the appropriate iframe embed or direct video URL.
 */
export function getVideoEmbed(url?: string | null, autoPlay = true): VideoEmbedInfo | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const yt = getYouTubeEmbedUrl(trimmed, autoPlay);
  if (yt) return { embedUrl: yt, provider: "youtube" };

  const direct = getDirectVideoUrl(trimmed);
  if (direct) return { embedUrl: direct, provider: "direct" };

  const vimeo = getVimeoEmbedUrl(trimmed, autoPlay);
  if (vimeo) return { embedUrl: vimeo, provider: "vimeo" };

  const fb = getFacebookEmbedUrl(trimmed, autoPlay);
  if (fb) return { embedUrl: fb, provider: "facebook" };

  const drive = getGoogleDriveEmbedUrl(trimmed);
  if (drive) return { embedUrl: drive, provider: "drive" };

  return null;
}

export function getVideoEmbedUrl(url?: string | null, autoPlay = true): string | null {
  return getVideoEmbed(url, autoPlay)?.embedUrl ?? null;
}
