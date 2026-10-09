import {
  CATEGORY_LABELS,
  ROLE_LABELS,
  normalizeCategory,
  type RoleValue,
} from "@/lib/constants";

export function categoryLabel(category?: string | null) {
  return CATEGORY_LABELS[normalizeCategory(category)];
}

export function rolesLabel(roles: RoleValue[]) {
  return roles.map((role) => ROLE_LABELS[role] ?? role).join(" · ");
}
