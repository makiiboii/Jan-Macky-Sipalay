// Keep in sync with the enums in prisma/schema.prisma.
export const CATEGORIES = [
  "VIDEOGRAPHY",
  "VIDEO_EDITING",
  "PORTRAIT_VIDEOS",
  "PHOTOGRAPHY",
  "POSTER_GRAPHICS",
  "AI_GENERATED",
] as const;
export type CategoryValue = (typeof CATEGORIES)[number];

/** All database enum values including legacy categories for backwards compatibility. */
export const DB_CATEGORIES = [
  "VIDEOGRAPHY",
  "VIDEO_EDITING",
  "PORTRAIT_VIDEOS",
  "PHOTOGRAPHY",
  "POSTER_GRAPHICS",
  "AI_GENERATED",
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
  PORTRAIT_VIDEOS: "Portrait Videos",
  PHOTOGRAPHY: "Photography",
  POSTER_GRAPHICS: "Posters & Graphics",
  AI_GENERATED: "AI-Generated",
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
 * Returns the database categories that match a normalized frontend category filter
 * so legacy database rows still appear under the appropriate category tab.
 */
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
