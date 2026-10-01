import { getGoogleDriveEmbedUrl } from "./drive";

export type VideoProvider = "youtube" | "facebook" | "drive" | "vimeo";

export type VideoEmbedInfo = {
  embedUrl: string;
  provider: VideoProvider;
};

/**
 * Extracts YouTube video ID and builds privacy-enhanced embed URL.
 * Handles:
 *  - https://www.youtube.com/watch?v=ID
 *  - https://youtu.be/ID
 *  - https://www.youtube.com/embed/ID
 *  - https://www.youtube.com/shorts/ID
 *  - https://m.youtube.com/watch?v=ID
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0]?.split("?")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
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
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/")[2]?.split("?")[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/")[2]?.split("?")[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Builds Facebook video embed player URL.
 * Handles:
 *  - https://www.facebook.com/watch/?v=ID
 *  - https://www.facebook.com/{user}/videos/{id}
 *  - https://www.facebook.com/reel/{id}
 *  - https://fb.watch/{id}
 */
export function getFacebookEmbedUrl(url: string): string | null {
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

    // Use official Facebook video plugin
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      url.trim(),
    )}&show_text=0`;
  } catch {
    return null;
  }
}

/**
 * Extracts Vimeo video ID.
 */
export function getVimeoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname === "vimeo.com" || parsed.hostname === "www.vimeo.com") {
      const match = parsed.pathname.match(/\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : null;
    }
    if (parsed.hostname === "player.vimeo.com") {
      return url.trim();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Detects the video provider and returns the appropriate iframe embed URL.
 */
export function getVideoEmbed(url?: string | null): VideoEmbedInfo | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const yt = getYouTubeEmbedUrl(trimmed);
  if (yt) return { embedUrl: yt, provider: "youtube" };

  const fb = getFacebookEmbedUrl(trimmed);
  if (fb) return { embedUrl: fb, provider: "facebook" };

  const drive = getGoogleDriveEmbedUrl(trimmed);
  if (drive) return { embedUrl: drive, provider: "drive" };

  const vimeo = getVimeoEmbedUrl(trimmed);
  if (vimeo) return { embedUrl: vimeo, provider: "vimeo" };

  return null;
}

export function getVideoEmbedUrl(url?: string | null): string | null {
  return getVideoEmbed(url)?.embedUrl ?? null;
}
