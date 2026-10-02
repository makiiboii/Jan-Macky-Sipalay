// Edit this file to change your name, copy, and contact links.

export const site = {
  name: "Jan Macky Sipalay",
  shortName: "JAN MACKY",
  title: "Jan Macky Sipalay — Videographer, Editor & Photographer",
  description:
    "Creative portfolio of Jan Macky Sipalay, showcasing videography, video editing, and photography projects.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  heroDescription: "Visual storyteller focused on videography, editing, and photography.",
  disciplines: ["Videographer", "Video Editor", "Photographer", "Photo Editor"],
  profileImage: "/maki.jpg",
  about: [
    "I'm Jan Macky Sipalay — a videographer, video editor, and photographer based in the Philippines. I work across events, portraits, and promotional content, and I like being involved from the first shot to the final cut.",
    "My approach is straightforward: frame it well, trust the light, and let the moment do the work. I shoot with intention so the edit almost writes itself. Whether I'm behind the camera or deep in a timeline, the goal is always the same — make something that feels real.",
    "I'm available for videography, editing, and photography projects. If you have footage that needs cutting, I take edit-only jobs too.",
  ],
  contactIntro: "Available for videography, editing, and photography work. Send a message with the date, place, and what you have in mind.",
};

export type ContactChannel = { label: string; href: string; display: string };

const contact = {
  email: "jmsipalay06@gmail.com",
  instagram: "https://www.instagram.com/makii_macs/",
  facebook: "https://www.facebook.com/jan.mac.946",
  tiktok: "https://www.tiktok.com/@makii_boii0",
};

export const emailChannel: ContactChannel = {
  label: "Email",
  href: contact.email ? `mailto:${contact.email}` : "",
  display: contact.email,
};

export const socialChannels: ContactChannel[] = [
  { label: "Instagram", href: contact.instagram, display: contact.instagram },
  { label: "Facebook", href: contact.facebook, display: contact.facebook },
  { label: "TikTok", href: contact.tiktok, display: contact.tiktok },
];
