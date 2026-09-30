const DRIVE_HOSTS = new Set(["drive.google.com", "docs.google.com", "drive.usercontent.google.com"]);
const FILE_ID = /^[\w-]{10,}$/;

/**
 * Extracts the file ID from common Google Drive links:
 *  - https://drive.google.com/file/d/ID/view?usp=sharing
 *  - https://drive.google.com/file/d/ID/preview
 *  - https://drive.google.com/file/u/0/d/ID/view
 *  - https://drive.google.com/open?id=ID
 *  - https://drive.google.com/uc?id=ID&export=download
 *  - https://drive.usercontent.google.com/download?id=ID
 */
export function getGoogleDriveFileId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" || !DRIVE_HOSTS.has(parsed.hostname)) return null;

  const candidate = parsed.pathname.match(/\/d\/([\w-]+)/)?.[1] ?? parsed.searchParams.get("id");
  return candidate && FILE_ID.test(candidate) ? candidate : null;
}

export function getGoogleDriveEmbedUrl(url: string): string | null {
  const id = getGoogleDriveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

/** Turns a Google Drive image link into a directly displayable URL. Other URLs pass through. */
export function resolveImageUrl(url: string): string {
  const id = getGoogleDriveFileId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w2000` : url;
}
