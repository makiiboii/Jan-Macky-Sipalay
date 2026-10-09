// Keep in sync with the enums in prisma/schema.prisma.
export const CATEGORIES = [
  "VIDEOGRAPHY",
  "VIDEO_EDITING",
  "PHOTOGRAPHY",
  "PHOTO_EDITING",
  "AI_GENERATED",
] as const;
export type CategoryValue = (typeof CATEGORIES)[number];

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
] as const;
export type RoleValue = (typeof ROLES)[number];

export const CATEGORY_LABELS: Record<CategoryValue, string> = {
  VIDEOGRAPHY: "Videography",
  VIDEO_EDITING: "Video Editing",
  PHOTOGRAPHY: "Photography",
  PHOTO_EDITING: "Photo Editing",
  AI_GENERATED: "AI Generated",
};

export const ROLE_LABELS: Record<RoleValue, string> = {
  VIDEOGRAPHER: "Videographer",
  VIDEO_EDITOR: "Video Editor",
  PHOTOGRAPHER: "Photographer",
  PHOTO_EDITOR: "Photo Editor",
  DIRECTOR: "Director",
  COLORIST: "Colorist",
  CAMERA_OPERATOR: "Camera Operator",
};
