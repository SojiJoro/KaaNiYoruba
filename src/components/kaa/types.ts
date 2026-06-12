import type { YorubaMode } from "@/lib/yorubaNumbers";

export type Screen = "calc" | "history" | "convert" | "learn" | "settings";

export interface HistoryEntry {
  id: number;
  expression: string;
  expressionYoruba: string;
  result: number;
  resultYoruba: string;
  timestamp: string; // ISO
}

export type PaletteId = "adire" | "forest" | "clay";
export type KeypadStyle = "soft" | "flat" | "outlined";

export interface KaaSettings {
  palette: PaletteId;
  dark: boolean;
  pattern: number; // 0–100, adire veil intensity
  keypad: KeypadStyle;
  numberMode: YorubaMode;
  sound: boolean;
}

export const DEFAULT_SETTINGS: KaaSettings = {
  palette: "adire",
  dark: false,
  pattern: 40,
  keypad: "soft",
  numberMode: "traditional",
  sound: true,
};

export const SETTINGS_KEY = "kaa-settings-v2";
export const HISTORY_KEY = "kaa-history-v2";
export const LEGACY_HISTORY_KEY = "kaa-history";
export const ONBOARD_KEY = "kaa-onboarded-v2";
export const SCREEN_KEY = "kaa-screen-v2";

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
