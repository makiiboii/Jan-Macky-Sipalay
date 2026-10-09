import { siClaude, siElevenlabs } from "simple-icons";

export type CreativeTool = {
  name: string;
  category: "editing" | "ai";
  asset?: string;
  svgPath?: string;
  viewBox?: string;
  brandColor?: string;
};

/**
 * Centralized list of editing and AI tools displayed in the Tools Showcase section.
 * Edit this file to add, remove, or reorder tools.
 */
export const editingTools: CreativeTool[] = [
  {
    name: "Adobe Premiere Pro",
    category: "editing",
    asset: "/tool-logos/premiere-pro.svg",
    brandColor: "#9999FF",
  },
  {
    name: "Adobe After Effects",
    category: "editing",
    asset: "/tool-logos/after-effects.svg",
    brandColor: "#9999FF",
  },
  {
    name: "Adobe Photoshop",
    category: "editing",
    asset: "/tool-logos/photoshop.svg",
    brandColor: "#31A8FF",
  },
  {
    name: "Canva",
    category: "editing",
    asset: "/tool-logos/canva.svg",
    brandColor: "#00C4CC",
  },
  {
    name: "CapCut",
    category: "editing",
    viewBox: "0 0 24 24",
    // Geometric scissor / ribbon mark inspired by CapCut
    svgPath:
      "M4 6.5a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6.5v1.35L13.6 12l6.4 4.15v1.35a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-1.35L10.4 12 4 7.85V6.5Zm2.5-.5a.5.5 0 0 0-.5.5v.32L12 10.7l6-3.88V6.5a.5.5 0 0 0-.5-.5h-11Zm11 12a.5.5 0 0 0 .5-.5v-.32L12 13.3l-6 3.88v.32a.5.5 0 0 0 .5.5h11Z",
    brandColor: "#F5F5F5",
  },
];

export const aiTools: CreativeTool[] = [
  {
    name: "Google Veo",
    category: "ai",
    viewBox: "0 0 24 24",
    // Clean cinema frame + play lens emblem for Google Veo
    svgPath:
      "M4 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2.6l4 2.6V7l-4 2.6V7a2 2 0 0 0-2-2H4Zm0 2h11v10H4V7Zm4 2.2v5.6L12.8 12 8 9.2Z",
    brandColor: "#8AB4F8",
  },
  {
    name: "Higgsfield",
    category: "ai",
    viewBox: "0 0 24 24",
    // Minimalist H-field orbital monogram
    svgPath:
      "M5 4h2.5v6.75h9V4H19v16h-2.5v-6.75h-9V20H5V4Zm7 4.25a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Zm0 2a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5Z",
    brandColor: "#E4E4E7",
  },
  {
    name: "ChatGPT",
    category: "ai",
    viewBox: "0 0 24 24",
    // Hexagonal AI bloom mark
    svgPath:
      "M12 2.5a4.5 4.5 0 0 1 4.16 2.8A4.5 4.5 0 0 1 20.5 9.8a4.5 4.5 0 0 1-1.38 3.25A4.5 4.5 0 0 1 16 19.8a4.5 4.5 0 0 1-4 1.7 4.5 4.5 0 0 1-4.16-2.8A4.5 4.5 0 0 1 3.5 14.2a4.5 4.5 0 0 1 1.38-3.25A4.5 4.5 0 0 1 8 4.2 4.5 4.5 0 0 1 12 2.5Zm0 2a2.5 2.5 0 0 0-2.35 1.65l-.22.61-.63.16A2.5 2.5 0 0 0 6.9 9.35v.68l-.48.47A2.5 2.5 0 0 0 5.5 12.2a2.5 2.5 0 0 0 1.85 2.42l.63.16.22.61A2.5 2.5 0 0 0 10.55 17h.68l.47.48A2.5 2.5 0 0 0 13.4 18.4a2.5 2.5 0 0 0 2.35-1.65l.22-.61.63-.16a2.5 2.5 0 0 0 1.9-2.43v-.68l.48-.47a2.5 2.5 0 0 0 .92-1.7 2.5 2.5 0 0 0-1.85-2.42l-.63-.16-.22-.61A2.5 2.5 0 0 0 14.85 6h-.68l-.47-.48A2.5 2.5 0 0 0 12 4.5Zm0 4.25a3.25 3.25 0 1 1 0 6.5 3.25 3.25 0 0 1 0-6.5Z",
    brandColor: "#10A37F",
  },
  {
    name: "ElevenLabs",
    category: "ai",
    viewBox: "0 0 24 24",
    svgPath: siElevenlabs.path,
    brandColor: "#F5F5F5",
  },
  {
    name: "Kling AI",
    category: "ai",
    viewBox: "0 0 24 24",
    // Sharp kinetic K-aperture mark for Kling AI
    svgPath:
      "M5 4h2.6v7.1L14.8 4h3.3l-7.1 7.1L18.5 20h-3.4l-5.8-6.9-1.7 1.7V20H5V4Z",
    brandColor: "#38BDF8",
  },
  {
    name: "Claude",
    category: "ai",
    viewBox: "0 0 24 24",
    svgPath: siClaude.path,
    brandColor: `#${siClaude.hex}`,
  },
];
