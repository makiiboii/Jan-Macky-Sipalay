// Keep in sync with the enums in prisma/schema.prisma.
export const CATEGORIES = ["VIDEOGRAPHY", "VIDEO_EDITING", "PHOTOGRAPHY"] as const;
export type CategoryValue = (typeof CATEGORIES)[number];

export const ROLES = [
  "VIDEOGRAPHER",
  "VIDEO_EDITOR",
  "PHOTOGRAPHER",
  "DIRECTOR",
  "COLORIST",
  "CAMERA_OPERATOR",
] as const;
export type RoleValue = (typeof ROLES)[number];

export const CATEGORY_LABELS: Record<CategoryValue, string> = {
  VIDEOGRAPHY: "Videography",
  VIDEO_EDITING: "Video Editing",
  PHOTOGRAPHY: "Photography",
};

export const ROLE_LABELS: Record<RoleValue, string> = {
  VIDEOGRAPHER: "Videographer",
  VIDEO_EDITOR: "Video Editor",
  PHOTOGRAPHER: "Photographer",
  DIRECTOR: "Director",
  COLORIST: "Colorist",
  CAMERA_OPERATOR: "Camera Operator",
};
