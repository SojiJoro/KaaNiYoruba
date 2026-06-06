import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        background: "#F8F4EC",
        "primary-green": "#0C5A39",
        "deep-green": "#064126",
        "soft-green": "#67A47F",
        "pale-green": "#EEF2EC",
        "warm-cream": "#FFFDF8",
        border: "#E8DCCB",
        "text-dark": "#1B1F23",
        muted: "#6F675D",
        gold: "#B79762",
        error: "#B8623F",
        paper: {
          DEFAULT: "#F8F4EC",
          dark: "#EFE7DB",
        },
        cream: {
          DEFAULT: "#FFFDF7",
        },
        moss: {
          DEFAULT: "#67A47F",
          dark: "#0C5A39",
          light: "#E3EEE6",
        },
        cocoa: {
          DEFAULT: "#1B1F23",
          light: "#6F675D",
          dark: "#064126",
        },
        rust: {
          DEFAULT: "#B8623F",
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
