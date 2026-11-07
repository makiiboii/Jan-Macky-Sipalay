// Edit this file to change your name, copy, and contact links.

export const site = {
  name: "Jan Macky Sipalay",
  shortName: "JAN MACKY",
  title: "Jan Macky Sipalay — Independent Visual Creative",
  description:
    "Portfolio of Jan Macky Sipalay, featuring videography, editing, photography, motion graphics, and AI-assisted video.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.cre8withmaki.com",
  heroDescription: "Videography, editing, photography, and visual storytelling.",
  disciplines: [
    "Video Editor",
    "AI Creative Producer",
    "Videographer",
    "Colorist",
    "Photographer",
    "Photo Editor",
    "Motion Graphics Artist",
  ],
  profileImage: "/maki.png",
  about: [
    "I'm Jan Macky Sipalay — a video editor, AI creative producer, and videographer based in the Philippines. I work across commercial ads, live events, brand campaigns, and hybrid AI productions, taking projects from initial concept to the final cut.",
    "My process blends intentional camerawork with modern post-production. Whether I'm capturing moments in the field, fine-tuning an edit in the timeline, or directing AI-assisted UGC video ads for international brands, the focus remains the same: sharp pacing, honest emotion, and visuals that connect.",
    "I'm available for video editing, AI video production, and videography / photography projects — including remote edit-only commissions.",
  ],
  contactIntro: "Available for videography, editing, and photography work. Send a message with the date, place, and what you have in mind.",
};

export type ContactChannel = { label: string; href: string; display: string };

const contact = {
  email: "jmsipalay06@gmail.com",
  whatsapp: "https://wa.me/639292365711",
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
  { label: "WhatsApp", href: contact.whatsapp, display: "+63 929 236 5711" },
  { label: "Instagram", href: contact.instagram, display: contact.instagram },
  { label: "Facebook", href: contact.facebook, display: contact.facebook },
  { label: "TikTok", href: contact.tiktok, display: contact.tiktok },
];
