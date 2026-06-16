import type { Config } from "tailwindcss";

/**
 * Construction OS design system — "operational intelligence" theme.
 * Palette + density modelled on Palantir's Blueprint (Apache-2.0) tokens:
 * layered charcoal greys, a single precise blue (#2d72d2), intent colours for
 * status only, tight spacing, sharp 3px corners, monospaced data.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 2024+ Foundry/Carbon register — neutral charcoal, brighter quiet blue.
        surface: {
          base: "#141619",     // app background (neutral charcoal)
          inset: "#0f1113",    // wells / map void
          raised: "#1b1e23",   // cards / panels
          overlay: "#23262d",  // popovers / active rows
          hover: "#2b2f37",
        },
        line: {
          subtle: "#23262c",
          DEFAULT: "#2f333b",
          strong: "#3c424c",
        },
        fg: {
          DEFAULT: "#f2f4f7",
          muted: "#a7adb8",
          faint: "#6e7681",
          inverse: "#141619",
        },
        primary: { DEFAULT: "#4c90f0", hover: "#6aa6f5", fg: "#8abbff" }, // blue4/blue5
        positive: { DEFAULT: "#32a467", fg: "#72ca9b" },  // green4 / green5
        warning: { DEFAULT: "#ec9a3c", fg: "#fbb360" },   // orange4 / orange5
        danger: { DEFAULT: "#e76a6e", fg: "#fa999c" },    // red4 / red5
        info: { DEFAULT: "#3fa6da", fg: "#68c1ee" },      // cerulean4 / cerulean5
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "0.9rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.15rem" }],
        base: ["0.875rem", { lineHeight: "1.35rem" }],
        md: ["0.9375rem", { lineHeight: "1.4rem" }],
        lg: ["1.0625rem", { lineHeight: "1.5rem" }],
        xl: ["1.3125rem", { lineHeight: "1.6rem" }],
        "2xl": ["1.625rem", { lineHeight: "1.9rem" }],
        "3xl": ["2.125rem", { lineHeight: "2.3rem" }],
      },
      spacing: { rail: "14rem" },
      borderRadius: { none: "0", sm: "2px", DEFAULT: "3px", md: "3px", lg: "4px", xl: "6px" },
      boxShadow: {
        panel: "0 0 0 1px rgba(17,20,24,0.4), 0 1px 1px rgba(17,20,24,0.4)",
        pop: "0 0 0 1px rgba(17,20,24,0.5), 0 8px 24px rgba(17,20,24,0.6)",
      },
      keyframes: {
        pulseDot: { "0%,100%": { opacity: "1", transform: "scale(1)" }, "50%": { opacity: ".5", transform: "scale(1.8)" } },
        fadeIn: { from: { opacity: "0", transform: "translateY(3px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { pulseDot: "pulseDot 1.8s ease-in-out infinite", fadeIn: "fadeIn .14s ease-out" },
    },
  },
  plugins: [],
};
export default config;
