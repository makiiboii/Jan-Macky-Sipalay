import { z } from "zod";
import { CATEGORIES, ROLES } from "./constants";
import { getGoogleDriveFileId } from "./drive";

const emptyToNull = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value == null || (typeof value === "string" && value.trim() === "") ? null : value), schema.nullable());

// Only https URLs or site-relative paths. Blocks javascript:, data:, and protocol-relative URLs.
const safeUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => (value.startsWith("/") && !value.startsWith("//")) || /^https:\/\//i.test(value), {
    message: "Use an https:// link or a /path inside the site.",
  });

export const projectInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120),
  slug: z.string().trim().max(140).optional(),
  description: z.string().trim().max(5000).default(""),
  category: z.enum(CATEGORIES),
  year: z.coerce.number().int().min(1990, "Enter a valid year.").max(2100, "Enter a valid year."),
  client: emptyToNull(z.string().trim().max(120)),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  thumbnailUrl: emptyToNull(safeUrl),
  videoUrl: emptyToNull(
    z
      .string()
      .trim()
      .max(2000)
      .refine((value) => getGoogleDriveFileId(value) !== null, {
        message: "That is not a valid Google Drive file link.",
      }),
  ),
  roles: z
    .array(z.enum(ROLES))
    .max(ROLES.length)
    .default([])
    .transform((roles) => Array.from(new Set(roles))),
  images: z
    .array(z.object({ url: safeUrl, caption: emptyToNull(z.string().trim().max(300)) }))
    .max(200)
    .default([]),
});

export type ProjectInput = z.output<typeof projectInputSchema>;

export const projectPatchSchema = z.object({
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});
