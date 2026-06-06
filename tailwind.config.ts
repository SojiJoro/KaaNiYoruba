import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        background: "#F8F4EA",
        "primary-green": "#0F5132",
        "deep-green": "#063D26",
        "soft-green": "#8FAF95",
        "pale-green": "#EAF1E8",
        "warm-cream": "#FFFDF7",
        border: "#E2D8C7",
        "text-dark": "#1F2428",
        muted: "#6B6258",
        gold: "#C5A052",
        error: "#B8623F",
        paper: {
          DEFAULT: "#F8F4EA",
          dark: "#EFE7D8",
        },
        cream: {
          DEFAULT: "#FFFDF7",
        },
        moss: {
          DEFAULT: "#8FAF95",
          dark: "#0F5132",
          light: "#DCE8DA",
        },
        cocoa: {
          DEFAULT: "#1F2428",
          light: "#6B6258",
          dark: "#063D26",
        },
        rust: {
          DEFAULT: "#B8623F",
        },
      },
      boxShadow: {
        app: "0 24px 70px rgba(31, 36, 40, 0.08)",
        premium: "0 18px 42px rgba(31, 36, 40, 0.10)",
        card: "0 12px 32px rgba(31, 36, 40, 0.07)",
        button: "0 7px 16px rgba(31, 36, 40, 0.06)",
        floating: "0 18px 45px rgba(31, 36, 40, 0.16)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
