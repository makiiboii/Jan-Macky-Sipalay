import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bone: "#ECEAE6",
        smoke: "#8C8C8C",
        line: "#222222",
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
