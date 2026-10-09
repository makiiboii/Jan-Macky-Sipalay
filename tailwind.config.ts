import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        hover: "var(--color-hover)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        bone: "var(--color-text-primary)",
        smoke: "var(--color-text-secondary)",
        line: "var(--color-border)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
