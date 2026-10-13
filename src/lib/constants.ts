// Keep in sync with the enums in prisma/schema.prisma.
export const CATEGORIES = [
  "VIDEOGRAPHY",
  "VIDEO_EDITING",
  "AI_GENERATED",
  "PHOTOGRAPHY",
  "POSTER_GRAPHICS",
  "PORTRAIT_VIDEOS",
] as const;
export type CategoryValue = (typeof CATEGORIES)[number];

/** All database enum values including legacy categories for backwards compatibility. */
export const DB_CATEGORIES = [
  "VIDEOGRAPHY",
  "VIDEO_EDITING",
  "AI_GENERATED",
  "PHOTOGRAPHY",
  "POSTER_GRAPHICS",
  "PORTRAIT_VIDEOS",
  "PHOTO_EDITING",
] as const;
export type DbCategoryValue = (typeof DB_CATEGORIES)[number];

/** Maximum number of projects shown in "Featured work" on the homepage. */
export const MAX_FEATURED = 4;

export const ROLES = [
  "VIDEOGRAPHER",
  "VIDEO_EDITOR",
  "PHOTOGRAPHER",
  "PHOTO_EDITOR",
  "DIRECTOR",
  "COLORIST",
  "CAMERA_OPERATOR",
  "AI_CREATIVE_PRODUCER",
  "GRAPHIC_DESIGNER",
] as const;
export type RoleValue = (typeof ROLES)[number];

export const CATEGORY_LABELS: Record<CategoryValue, string> = {
  VIDEOGRAPHY: "Videoshoot",
  VIDEO_EDITING: "Video Editing",
  AI_GENERATED: "AI-Generated",
  PHOTOGRAPHY: "Photography",
  POSTER_GRAPHICS: "Posters & Graphics",
  PORTRAIT_VIDEOS: "Portrait Videos",
};

/**
 * Safely normalizes any database or user-supplied category string into one of the
 * supported portfolio categories, handling legacy values or missing categories.
 */
export function normalizeCategory(value?: string | null): CategoryValue {
  if (!value) return "VIDEOGRAPHY";
  const upper = value.trim().toUpperCase();
  if ((CATEGORIES as readonly string[]).includes(upper)) {
    return upper as CategoryValue;
  }
  if (
    upper === "VIDEOSHOOT" ||
    upper === "VIDEO SHOOT" ||
    upper === "VIDEO_SHOOT" ||
    upper === "VIDEOGRAPHY"
  ) {
    return "VIDEOGRAPHY";
  }
  if (
    upper === "VIDEO EDIT" ||
    upper === "VIDEO-EDITING" ||
    upper === "VIDEO EDITING"
  ) {
    return "VIDEO_EDITING";
  }
  if (upper === "PHOTO_EDITING" || upper === "PHOTO EDITING") {
    return "PHOTOGRAPHY";
  }
  if (
    upper === "POSTER_GRAPHICS" ||
    upper === "POSTERS_GRAPHICS" ||
    upper === "POSTERS & GRAPHICS" ||
    upper === "POSTER & GRAPHICS" ||
    upper === "POSTERS GRAPHICS" ||
    upper === "POSTER GRAPHICS" ||
    upper === "POSTERS" ||
    upper === "POSTER" ||
    upper === "GRAPHICS" ||
    upper === "GRAPHIC DESIGN"
  ) {
    return "POSTER_GRAPHICS";
  }
  if (upper === "AI-GENERATED" || upper === "AI GENERATED") {
    return "AI_GENERATED";
  }
  if (
    upper === "PORTRAIT" ||
    upper === "PORTRAIT VIDEO" ||
    upper === "PORTRAIT VIDEOS"
  ) {
    return "PORTRAIT_VIDEOS";
  }
  return "VIDEOGRAPHY";
}

/**
 * Returns true if a project is in 9:16 portrait orientation (vertical Reels, Shorts, TikTok)
 * based on explicit isPortrait flag, PORTRAIT_VIDEOS category, or vertical video URL.
 */
export function isProjectPortrait(project?: {
  category?: string | null;
  isPortrait?: boolean | null;
  videoUrl?: string | null;
} | null): boolean {
  if (!project) return false;
  if (project.isPortrait === true) return true;
  if (project.category === "PORTRAIT_VIDEOS") return true;
  if (project.videoUrl && /\/(shorts|reel|reels)\//i.test(project.videoUrl)) return true;
  return false;
}

export function matchingDbCategories(category: CategoryValue): DbCategoryValue[] {
  if (category === "PHOTOGRAPHY") return ["PHOTOGRAPHY", "PHOTO_EDITING"];
  return [category];
}

export const ROLE_LABELS: Record<RoleValue, string> = {
  VIDEOGRAPHER: "Videographer",
  VIDEO_EDITOR: "Video Editor",
  PHOTOGRAPHER: "Photographer",
  PHOTO_EDITOR: "Photo Editor",
  DIRECTOR: "Director",
  COLORIST: "Colorist",
  CAMERA_OPERATOR: "Camera Operator",
  AI_CREATIVE_PRODUCER: "AI Creative Producer",
  GRAPHIC_DESIGNER: "Graphic Designer",
};
