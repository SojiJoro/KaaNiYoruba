"use client";

import { Switch } from "./shared";
import type { KaaSettings, KeypadStyle, PaletteId } from "./types";

// Swatches mirror the palette hero colors defined in globals.css.
const PALETTES: Array<{ id: PaletteId; name: string; swatch: string[] }> = [
  { id: "adire", name: "Adire Indigo", swatch: ["#25307A", "#BC5429", "#F3EEE3"] },
  { id: "forest", name: "Forest Heritage", swatch: ["#0C5A39", "#B79762", "#F8F4EC"] },
  { id: "clay", name: "Clay & Ember", swatch: ["#A4431F", "#2C3E6B", "#F7F0E7"] },
];

const KEYPAD_STYLES: KeypadStyle[] = ["soft", "flat", "outlined"];

export function SettingsScreen({
  settings,
  setSetting,
  onReplayOnboarding,
  onClearHistory,
  historyCount,
}: {
  settings: KaaSettings;
  setSetting: <K extends keyof KaaSettings>(key: K, value: KaaSettings[K]) => void;
  onReplayOnboarding: () => void;
  onClearHistory: () => void;
  historyCount: number;
}) {
  return (
    <div className="screen screen-settings">
      <header className="screen-head">
        <div>
          <h1 className="screen-title">Ètò</h1>
          <p className="screen-sub">Settings</p>
        </div>
      </header>

      <section className="settings-group">
        <span className="eyebrow">
          Ọ̀nà kíkà <i>counting system</i>
        </span>
        <div className="mode-cards">
          <button
            type="button"
            className={
              "mode-card" +
              (settings.numberMode === "traditional" ? " mode-card-on" : "")
            }
            onClick={() => setSetting("numberMode", "traditional")}
          >
            <span className="mode-card-name">Àtọwọ́dọ́wọ́</span>
            <span className="mode-card-en">Traditional · vigesimal</span>
            <span className="mode-card-ex">75 → Márùndínlọ́gọ́rin</span>
          </button>
          <button
            type="button"
            className={
              "mode-card" +
              (settings.numberMode === "modern" ? " mode-card-on" : "")
            }
            onClick={() => setSetting("numberMode", "modern")}
          >
            <span className="mode-card-name">Òde-òní</span>
            <span className="mode-card-en">Modern · additive</span>
            <span className="mode-card-ex">75 → Àádọ́rin àti Márùn-ún</span>
          </button>
        </div>
      </section>

      <section className="settings-group">
        <span className="eyebrow">
          Ìrísí <i>appearance</i>
        </span>
        <div className="settings-rows">
          <SettingRow label="Dúdú" en="Dark mode">
            <Switch
              on={settings.dark}
              onToggle={() => setSetting("dark", !settings.dark)}
            />
          </SettingRow>
          <SettingRow label="Àwọ̀" en="Color palette">
            <div className="palette-chips" role="radiogroup" aria-label="Palette">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={settings.palette === p.id}
                  aria-label={p.name}
                  title={p.name}
                  className={
                    "palette-chip" + (settings.palette === p.id ? " on" : "")
                  }
                  onClick={() => setSetting("palette", p.id)}
                >
                  {p.swatch.map((c) => (
                    <i key={c} style={{ background: c }} />
                  ))}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Àwòrán bọ́tìnnì" en="Keypad style">
            <div className="seg" role="radiogroup" aria-label="Keypad style">
              {KEYPAD_STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={settings.keypad === s}
                  className={settings.keypad === s ? "on" : ""}
                  onClick={() => setSetting("keypad", s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Àrán adìrẹ" en="Pattern intensity">
            <input
              type="range"
              className="pattern-slider"
              min={0}
              max={100}
              value={settings.pattern}
              aria-label="Pattern intensity"
              onChange={(e) => setSetting("pattern", Number(e.target.value))}
            />
          </SettingRow>
          <SettingRow label="Ohùn" en="Speak results aloud">
            <Switch
              on={settings.sound}
              onToggle={() => setSetting("sound", !settings.sound)}
            />
          </SettingRow>
        </div>
      </section>

      <section className="settings-group">
        <span className="eyebrow">
          Dátà <i>data</i>
        </span>
        <div className="settings-rows">
          <SettingRow label="Pa ìtàn rẹ́" en={historyCount + " entries saved"}>
            <button
              type="button"
              className="ghost-btn danger"
              disabled={historyCount === 0}
              onClick={onClearHistory}
            >
              Pa rẹ́
            </button>
          </SettingRow>
          <SettingRow label="Ìfihàn àkọ́kọ́" en="Replay the welcome tour">
            <button type="button" className="ghost-btn" onClick={onReplayOnboarding}>
              Tún wò
            </button>
          </SettingRow>
        </div>
      </section>

      <p className="settings-about">
        Kàá renders full Yorùbá number names for any value the engine can name —
        the 0–99 traditional table is hand-verified against published grammars,
        larger values are composed from the documented vigesimal rules, and
        digit-by-digit reading covers IDs, codes, and decimals so every input
        still has a Yorùbá voice.
      </p>
    </div>
  );
}

function SettingRow({
  label,
  en,
  children,
}: {
  label: string;
  en: string;
  children: React.ReactNode;
}) {
  return (
    <div className="setting-row">
      <div className="setting-row-text">
        <span className="setting-label">{label}</span>
        <span className="setting-en">{en}</span>
      </div>
      {children}
    </div>
  );
}
