"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "kaa-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

/**
 * Light/dark toggle. The initial theme is applied before paint by the inline
 * script in layout.tsx; this component just reflects and persists changes.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  if (theme === null) {
    return <span className="h-9 w-9" aria-hidden />;
  }

  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => {
        setTheme(next);
        applyTheme(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Private browsing: theme just won't persist.
        }
      }}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Ìmọ́lẹ̀ (light)" : "Òkùnkùn (dark)"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-warm-cream text-base text-muted transition-colors hover:text-gold"
    >
      <span aria-hidden>{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}
