import { CATEGORY_LABELS, ROLE_LABELS, type CategoryValue, type RoleValue } from "@/lib/constants";

export function categoryLabel(category: CategoryValue) {
  return CATEGORY_LABELS[category];
}

export function rolesLabel(roles: RoleValue[]) {
  return roles.map((role) => ROLE_LABELS[role]).join(" · ");
}
