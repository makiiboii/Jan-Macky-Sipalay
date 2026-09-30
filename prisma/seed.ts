import { Category, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_NOTE =
  "Sample content. Replace this text, the thumbnail, and any media from the admin dashboard.";

type Seed = {
  title: string;
  slug: string;
  category: Category;
  roles: Role[];
  year: number;
  client?: string;
  featured?: boolean;
  published?: boolean;
  thumbnailUrl: string;
  videoUrl?: string;
  description: string;
  images?: { url: string; caption?: string }[];
};

const projects: Seed[] = [
  {
    title: "Cinematic Event Film",
    slug: "cinematic-event-film",
    category: Category.VIDEOGRAPHY,
    roles: [Role.VIDEOGRAPHER, Role.VIDEO_EDITOR],
    year: 2026,
    client: "Sample Client",
    featured: true,
    thumbnailUrl: "/samples/event.svg",
    // Placeholder ID: replace with a real Google Drive link in the admin dashboard.
    videoUrl: "https://drive.google.com/file/d/SAMPLE_REPLACE_WITH_YOUR_FILE_ID/view",
    description: `${SAMPLE_NOTE}\n\nA highlight film built from a full day of coverage: quiet moments first, the big energy later, and a tight edit that keeps the story moving.`,
  },
  {
    title: "Portrait Session",
    slug: "portrait-session",
    category: Category.PHOTOGRAPHY,
    roles: [Role.PHOTOGRAPHER],
    year: 2026,
    thumbnailUrl: "/samples/portrait-cover.svg",
    description: `${SAMPLE_NOTE}\n\nA natural-light portrait session. Add your own photographs from the admin dashboard.`,
    images: [
      { url: "/samples/photo-1.svg", caption: "Sample photo 1" },
      { url: "/samples/photo-2.svg", caption: "Sample photo 2" },
      { url: "/samples/photo-3.svg" },
      { url: "/samples/photo-4.svg", caption: "Sample photo 4" },
      { url: "/samples/photo-5.svg" },
      { url: "/samples/photo-6.svg", caption: "Sample photo 6" },
    ],
  },
  {
    title: "Promotional Video",
    slug: "promotional-video",
    category: Category.VIDEO_EDITING,
    roles: [Role.VIDEO_EDITOR],
    year: 2026,
    client: "Sample Brand",
    thumbnailUrl: "/samples/promo.svg",
    description: `${SAMPLE_NOTE}\n\nA short promotional cut edited from supplied footage, with pacing, sound, and color handled in post.`,
  },
  {
    title: "Wedding Film 2026",
    slug: "wedding-film-2026",
    category: Category.VIDEOGRAPHY,
    roles: [Role.VIDEOGRAPHER, Role.VIDEO_EDITOR, Role.COLORIST],
    year: 2026,
    thumbnailUrl: "/samples/wedding.svg",
    description: `${SAMPLE_NOTE}\n\nA cinematic wedding highlight film.`,
  },
  {
    title: "Street Series",
    slug: "street-series",
    category: Category.PHOTOGRAPHY,
    roles: [Role.PHOTOGRAPHER],
    year: 2025,
    thumbnailUrl: "/samples/street.svg",
    description: `${SAMPLE_NOTE}\n\nA personal series shot on the street.`,
    images: [
      { url: "/samples/photo-2.svg" },
      { url: "/samples/photo-1.svg" },
      { url: "/samples/photo-5.svg", caption: "Sample caption" },
    ],
  },
  {
    title: "Music Video Edit (Draft)",
    slug: "music-video-edit-draft",
    category: Category.VIDEO_EDITING,
    roles: [Role.VIDEO_EDITOR, Role.COLORIST],
    year: 2025,
    published: false,
    thumbnailUrl: "/samples/music.svg",
    description: `${SAMPLE_NOTE}\n\nThis sample is unpublished, so it only appears in the admin dashboard.`,
  },
];

async function main() {
  for (const { images = [], ...project } of projects) {
    const data = {
      ...project,
      featured: project.featured ?? false,
      published: project.published ?? true,
    };
    const imageRows = images.map((image, position) => ({ ...image, position }));

    await prisma.project.upsert({
      where: { slug: project.slug },
      create: { ...data, images: { create: imageRows } },
      update: { ...data, images: { deleteMany: {}, create: imageRows } },
    });
  }
  console.log(`Seeded ${projects.length} sample projects.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
