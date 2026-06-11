import type { Config } from "tailwindcss";

// Core tokens map to CSS variables so the dark theme (set via
// [data-theme="dark"] in globals.css) restyles everything without dark:
// variants scattered through the components.
const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "primary-green": "var(--primary-green)",
        "deep-green": "var(--deep-green)",
        "soft-green": "var(--soft-green)",
        "pale-green": "var(--pale-green)",
        "warm-cream": "var(--warm-cream)",
        border: "var(--border)",
        "text-dark": "var(--text-dark)",
        muted: "var(--muted)",
        gold: "var(--gold)",
        error: "var(--error)",
        paper: {
          DEFAULT: "var(--background)",
          dark: "#EFE7DB",
        },
        cream: {
          DEFAULT: "var(--warm-cream)",
        },
        moss: {
          DEFAULT: "var(--soft-green)",
          dark: "var(--primary-green)",
          light: "#E3EEE6",
        },
        cocoa: {
          DEFAULT: "var(--text-dark)",
          light: "var(--muted)",
          dark: "var(--deep-green)",
        },
        rust: {
          DEFAULT: "var(--error)",
        },
      },
      boxShadow: {
        app: "0 26px 72px rgba(27, 31, 35, 0.08)",
        premium: "0 20px 48px rgba(27, 31, 35, 0.11)",
        card: "0 14px 34px rgba(27, 31, 35, 0.08)",
        button: "0 8px 18px rgba(27, 31, 35, 0.08)",
        floating: "0 18px 45px rgba(27, 31, 35, 0.14)",
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
