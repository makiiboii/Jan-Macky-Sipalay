// Edit this file to change your name, copy, and contact links.
// Leave a link as "" and it will show as "Not set yet" on the site.

export const site = {
  name: "Jan Macky Sipalay",
  shortName: "JAN MACKY",
  title: "Jan Macky Sipalay — Videographer, Editor & Photographer",
  description:
    "Creative portfolio of Jan Macky Sipalay, showcasing videography, video editing, and photography projects.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  heroDescription: "Visual storyteller focused on videography, editing, and photography.",
  disciplines: ["Videographer", "Video Editor", "Photographer"],
  // Replace with your own photo: put a file in /public and change this path.
  profileImage: "/samples/profile-placeholder.svg",
  about: [
    "I shoot, cut, and photograph. Most of my work starts behind a camera and ends on an editing timeline, and I like owning both ends. How a scene is framed usually decides how it will be cut.",
    "I care about pacing, natural light, and letting real moments carry the story. I work on events, portraits, and promotional projects, and I also take edit-only jobs when the footage is already shot.",
    "Replace this text with your own story: where you started, what you like to shoot, and what kind of work you want more of.",
  ],
  contactIntro: "Available for videography, editing, and photography work. Send a message with the date, place, and what you have in mind.",
};

export type ContactChannel = { label: string; href: string; display: string };

const contact = {
  email: "jmsipalay06@gmail.com",
  instagram: "https://www.instagram.com/makii_macs/",
  facebook: "https://www.facebook.com/jan.mac.946",
  youtube: "",
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
  { label: "YouTube", href: contact.youtube, display: contact.youtube },
  { label: "TikTok", href: contact.tiktok, display: contact.tiktok },
];
