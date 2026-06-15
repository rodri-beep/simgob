import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Retro management-sim palette (~10 colors): muted cream/olive/teal + amber accent.
        parchment: "#e7dec3",
        "parchment-dark": "#d4c9a4",
        panel: "#ddd3b0",
        "panel-dark": "#c6bb95",
        ink: "#211f18",
        "ink-soft": "#4a4636",
        olive: "#5b6a3f",
        "olive-dark": "#3d4a2c",
        teal: "#236a6a",
        "teal-dark": "#194c4c",
        amber: "#e09a2d",
        orange: "#cf6b2c",
        brick: "#a83c2e", // deficit / alert / "loser"
        moss: "#4e7d3a", // surplus / positive / "winner"
        "bevel-light": "#fbf6e2",
        "bevel-dark": "#8a7f5d",
        sky: "#7fb0c4",
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "monospace"],
        chrome: ["var(--font-chrome)", "monospace"],
        data: ["var(--font-data)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "bevel-out":
          "inset 2px 2px 0 0 var(--bevel-light), inset -2px -2px 0 0 var(--bevel-dark)",
        "bevel-in":
          "inset -2px -2px 0 0 var(--bevel-light), inset 2px 2px 0 0 var(--bevel-dark)",
        "bevel-out-thin":
          "inset 1px 1px 0 0 var(--bevel-light), inset -1px -1px 0 0 var(--bevel-dark)",
      },
    },
  },
  plugins: [],
};

export default config;
