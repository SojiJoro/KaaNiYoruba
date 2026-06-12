"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { speakYoruba } from "@/lib/speech";
import { CalculatorScreen } from "./CalculatorScreen";
import { ConverterScreen } from "./ConverterScreen";
import { HistoryScreen } from "./HistoryScreen";
import { LearnScreen } from "./LearnScreen";
import { OnboardingOverlay } from "./Onboarding";
import { SettingsScreen } from "./SettingsScreen";
import { NavIcon } from "./shared";
import {
  DEFAULT_SETTINGS,
  HISTORY_KEY,
  LEGACY_HISTORY_KEY,
  ONBOARD_KEY,
  SCREEN_KEY,
  SETTINGS_KEY,
  loadJSON,
  type HistoryEntry,
  type KaaSettings,
  type Screen,
} from "./types";

const NAV_ITEMS: Array<{ id: Screen; yo: string; en: string; icon: string }> = [
  {
    id: "calc",
    yo: "Ìṣirò",
    en: "Calculate",
    icon: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm1 4h8M9 11h.01M12 11h.01M15 11h.01M9 14.5h.01M12 14.5h.01M15 14.5h.01M9 18h.01M12 18h.01M15 18h.01",
  },
  {
    id: "history",
    yo: "Ìtàn",
    en: "History",
    icon: "M12 8v4l3 2.5M21 12a9 9 0 1 1-3.4-7M21 3v4h-4",
  },
  {
    id: "convert",
    yo: "Yípadà",
    en: "Convert",
    icon: "M4 7h13M14 3.5 17.5 7 14 10.5M20 17H7M10 13.5 6.5 17l3.5 3.5",
  },
  {
    id: "learn",
    yo: "Kọ́ ẹ̀kọ́",
    en: "Learn",
    icon: "M12 4 2.5 9 12 14l9.5-5L12 4ZM6 11.4V16c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.6",
  },
  {
    id: "settings",
    yo: "Ètò",
    en: "Settings",
    icon: "M12 9.5A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 0 0 12 9.5Zm8-.6-1.7-.5a6.7 6.7 0 0 0-.6-1.4l.9-1.6-2-2-1.6.9c-.4-.3-.9-.5-1.4-.6L13 2h-2l-.5 1.7c-.5.1-1 .3-1.4.6l-1.6-.9-2 2 .9 1.6c-.3.4-.5.9-.6 1.4L4 9l0 2 1.7.5c.1.5.3 1 .6 1.4l-.9 1.6 2 2 1.6-.9c.4.3.9.5 1.4.6L11 22h2l.5-1.7c.5-.1 1-.3 1.4-.6l1.6.9 2-2-.9-1.6c.3-.4.5-.9.6-1.4L20 15v-2-4.1Z",
  },
];

const SCREENS: Screen[] = ["calc", "history", "convert", "learn", "settings"];

function loadSettings(): KaaSettings {
  const stored = loadJSON<Partial<KaaSettings>>(SETTINGS_KEY, {});
  const merged = { ...DEFAULT_SETTINGS, ...stored };
  if (stored.dark === undefined) {
    // First run with the new settings: honor the legacy theme key, then the
    // system preference, so existing dark-mode users stay dark.
    try {
      const legacy = localStorage.getItem("kaa-theme");
      merged.dark = legacy
        ? legacy === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      // No storage: keep the default.
    }
  }
  return merged;
}

export function KaaApp() {
  const [settings, setSettings] = useState<KaaSettings>(DEFAULT_SETTINGS);
  const [screen, setScreen] = useState<Screen>("calc");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [onboarded, setOnboarded] = useState(true);
  const [ready, setReady] = useState(false);
  const reuseRef = useRef<((entry: HistoryEntry) => void) | null>(null);

  // Restore persisted state after mount (SSR renders the defaults).
  useEffect(() => {
    setSettings(loadSettings());
    const storedScreen = localStorage.getItem(SCREEN_KEY) as Screen | null;
    if (storedScreen && SCREENS.includes(storedScreen)) setScreen(storedScreen);
    setHistory(
      loadJSON<HistoryEntry[]>(
        HISTORY_KEY,
        loadJSON<HistoryEntry[]>(LEGACY_HISTORY_KEY, []),
      ).slice(0, 30),
    );
    setOnboarded(localStorage.getItem(ONBOARD_KEY) === "yes");
    setReady(true);
  }, []);

  // Apply theme attributes (the pre-paint script in layout.tsx does the same
  // before hydration, so there is no flash).
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.dataset.theme = settings.dark ? "dark" : "light";
    root.dataset.palette = settings.palette;
    root.style.setProperty(
      "--pattern-opacity",
      String((settings.pattern / 100) * (settings.dark ? 0.6 : 1)),
    );
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      localStorage.setItem("kaa-theme", settings.dark ? "dark" : "light");
    } catch {
      // Private browsing: settings just won't persist.
    }
  }, [settings, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(SCREEN_KEY, screen);
    } catch {
      /* not persisted */
    }
  }, [screen, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
    } catch {
      /* not persisted */
    }
  }, [history, ready]);

  const setSetting = useCallback(
    <K extends keyof KaaSettings>(key: K, value: KaaSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const speak = useCallback(
    (text: string) => {
      if (settings.sound) speakYoruba(text);
    },
    [settings.sound],
  );

  const addHistory = useCallback((entry: HistoryEntry) => {
    setHistory((h) => [entry, ...h].slice(0, 30));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const finishOnboarding = useCallback(() => {
    try {
      localStorage.setItem(ONBOARD_KEY, "yes");
    } catch {
      /* not persisted */
    }
    setOnboarded(true);
  }, []);

  const replayOnboarding = useCallback(() => setOnboarded(false), []);

  const reuse = useCallback((entry: HistoryEntry) => {
    reuseRef.current?.(entry);
  }, []);

  const modeWord =
    settings.numberMode === "traditional" ? "Àtọwọ́dọ́wọ́" : "Òde-òní";
  const toggleMode = () =>
    setSetting(
      "numberMode",
      settings.numberMode === "traditional" ? "modern" : "traditional",
    );

  const renderScreen = () => {
    switch (screen) {
      case "history":
        return (
          <HistoryScreen
            history={history}
            onClear={clearHistory}
            onReuse={reuse}
            goCalc={() => setScreen("calc")}
          />
        );
      case "convert":
        return <ConverterScreen mode={settings.numberMode} onSpeak={speak} />;
      case "learn":
        return <LearnScreen mode={settings.numberMode} onSpeak={speak} />;
      case "settings":
        return (
          <SettingsScreen
            settings={settings}
            setSetting={setSetting}
            onReplayOnboarding={replayOnboarding}
            onClearHistory={clearHistory}
            historyCount={history.length}
          />
        );
      default:
        return (
          <CalculatorScreen
            mode={settings.numberMode}
            keypadStyle={settings.keypad}
            onSpeak={speak}
            history={history}
            onAddHistory={addHistory}
            reuseRef={reuseRef}
            goHistory={() => setScreen("history")}
          />
        );
    }
  };

  return (
    <>
      <div className="app">
        <aside className="sidebar">
          <div className="wordmark">
            <span className="wordmark-kaa">Kàá</span>
            <span className="wordmark-sub">Yorùbá calculator</span>
          </div>
          <nav className="sidenav" aria-label="Main">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={"sidenav-item" + (screen === item.id ? " on" : "")}
                onClick={() => setScreen(item.id)}
              >
                <NavIcon d={item.icon} />
                <span className="sidenav-yo">{item.yo}</span>
                <span className="sidenav-en">{item.en}</span>
              </button>
            ))}
          </nav>
          <button
            type="button"
            className="mode-pill"
            onClick={toggleMode}
            title="Switch counting system"
          >
            <span className="mode-pill-dot"></span>
            {modeWord}
          </button>
        </aside>

        <main className="content">
          <header className="topbar">
            <span className="topbar-kaa">Kàá</span>
            <button type="button" className="mode-pill" onClick={toggleMode}>
              <span className="mode-pill-dot"></span>
              {modeWord}
            </button>
          </header>

          <div className="screen-wrap">{renderScreen()}</div>

          <nav className="tabbar" aria-label="Main">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={"tab" + (screen === item.id ? " on" : "")}
                onClick={() => setScreen(item.id)}
              >
                <NavIcon d={item.icon} />
                <span>{item.yo}</span>
              </button>
            ))}
          </nav>
        </main>
      </div>

      {ready && !onboarded && (
        <OnboardingOverlay
          settings={settings}
          setSetting={setSetting}
          onFinish={finishOnboarding}
        />
      )}
    </>
  );
}
