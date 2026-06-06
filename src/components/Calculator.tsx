"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyKey,
  evaluate,
  formatNumber,
  initialState,
  type CalcKey,
  type CalcState,
} from "@/lib/calculator";
import {
  expressionToYoruba,
  toYoruba,
  type YorubaMode,
} from "@/lib/yorubaNumbers";
import { ConverterPanel } from "./ConverterPanel";
import { Display } from "./Display";
import { History, type HistoryEntry } from "./History";
import { Keypad } from "./Keypad";
import { LearningMode } from "./LearningMode";
import { ModeToggle } from "./ModeToggle";

type Tab = "calculator" | "history" | "converter" | "learn";

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "calculator", label: "Kálkù", icon: "▦" },
  { id: "history", label: "Ìtàn", icon: "◷" },
  { id: "converter", label: "Yípadà", icon: "▱" },
  { id: "learn", label: "Kọ́ ẹ̀kọ́", icon: "◈" },
];

export function Calculator() {
  const [state, setState] = useState<CalcState>(initialState);
  const [mode, setMode] = useState<YorubaMode>("traditional");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [tab, setTab] = useState<Tab>("calculator");

  const handleKey = useCallback(
    (key: CalcKey) => {
      setState((prev) => {
        const next = applyKey(prev, key);
        if (key === "=" && !next.error && next.lastResult !== null) {
          const expr = prev.expression;
          const result = next.lastResult;
          setHistory((h) => [
            {
              id: Date.now(),
              expression: expr,
              expressionYoruba: expressionToYoruba(expr, mode),
              result,
              resultYoruba: toYoruba(result, mode),
              timestamp: new Date().toISOString(),
            },
            ...h.slice(0, 49),
          ]);
        }
        return next;
      });
    },
    [mode],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key;
      const map: Record<string, CalcKey> = {
        "*": "×",
        "/": "÷",
        "-": "−",
        Enter: "=",
        "=": "=",
        Backspace: "⌫",
        Escape: "C",
        c: "C",
        C: "C",
      };
      if (/^[0-9.]$/.test(k)) {
        handleKey(k as CalcKey);
        e.preventDefault();
        return;
      }
      if (k === "+" || k === "*" || k === "/" || k === "-") {
        handleKey(map[k]);
        e.preventDefault();
        return;
      }
      if (map[k]) {
        handleKey(map[k]);
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleKey]);

  const previewResult = useMemo(() => {
    if (
      state.lastResult !== null &&
      state.expression === formatNumber(state.lastResult)
    ) {
      return state.lastResult;
    }
    if (!state.expression) return null;
    const { value } = evaluate(state.expression);
    return value;
  }, [state]);

  const handleSpeak = useCallback((text: string) => {
    if (!text) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "yo-NG";
    utter.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, []);

  return (
    <div className="w-full max-w-5xl pb-24 sm:pb-6">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/90 p-3 shadow-app backdrop-blur sm:rounded-[2.25rem] sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute left-8 top-0 h-px w-1/2 bg-gradient-to-r from-gold/60 to-transparent" />
        <AppHeader mode={mode} onModeChange={setMode} />

        <div className="relative mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="min-w-0">
              {tab === "calculator" && (
                <div className="flex flex-col gap-5">
                  <Display
                    expression={state.expression}
                    result={previewResult}
                    error={state.error}
                    mode={mode}
                    onSpeak={handleSpeak}
                  />
                  <Keypad mode={mode} onKey={handleKey} />
                </div>
              )}

              {tab === "history" && (
                <History
                  entries={history}
                  onReuse={(e) => {
                    setState({ ...initialState, expression: e.expression });
                    setTab("calculator");
                  }}
                  onClear={() => setHistory([])}
                />
              )}

              {tab === "converter" && (
                <ConverterPanel mode={mode} onSpeak={handleSpeak} />
              )}
              {tab === "learn" && (
                <LearningMode mode={mode} onSpeak={handleSpeak} />
              )}
            </div>
          </div>

          <aside className="hidden rounded-[1.75rem] border border-border bg-warm-cream/80 p-5 shadow-card lg:flex lg:flex-col lg:gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
                Live guide
              </p>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-deep-green">
                Learn while you calculate
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Each input is mirrored in Yorùbá, so the calculator doubles as a
                lightweight study tool.
              </p>
            </div>

            <div className="grid gap-3">
              <GuideCard
                label="Keyboard ready"
                value="Type digits, +, −, ×, ÷ or Enter"
              />
              <GuideCard
                label="Modes"
                value="Switch between traditional and modern phrasing"
              />
              <GuideCard
                label="Audio"
                value="Tap the speaker to hear the current word"
              />
            </div>
          </aside>
        </div>
      </section>

      <BottomNav activeTab={tab} onChange={setTab} />
    </div>
  );
}

function AppHeader({
  mode,
  onModeChange,
}: {
  mode: YorubaMode;
  onModeChange: (mode: YorubaMode) => void;
}) {
  return (
    <header className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-serif text-5xl font-black leading-none tracking-[-0.04em] text-primary-green sm:text-7xl">
          K
          <span className="relative inline-block">
            á
            <span className="absolute -right-0.5 top-0 h-2 w-2 rounded-full bg-gold" />
          </span>
          à
        </h1>
        <p className="mt-2 text-base font-semibold text-muted sm:text-lg">
          Yoruba number &amp; calculator
        </p>
      </div>
      <ModeToggle mode={mode} onChange={onModeChange} />
    </header>
  );
}

function BottomNav({
  activeTab,
  onChange,
}: {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-3 bottom-3 z-30 mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[1.5rem] border border-border bg-warm-cream/95 p-1.5 shadow-floating backdrop-blur sm:sticky sm:bottom-6 sm:mt-6 sm:max-w-xl sm:rounded-[1.75rem]"
    >
      {TABS.map((item) => (
        <TabButton
          key={item.id}
          label={item.label}
          icon={item.icon}
          active={activeTab === item.id}
          onClick={() => onChange(item.id)}
        />
      ))}
    </nav>
  );
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-14 flex-col items-center justify-center rounded-full px-2 text-center transition-all ${
        active
          ? "bg-pale-green text-primary-green shadow-sm"
          : "text-muted hover:bg-pale-green/60 hover:text-deep-green"
      }`}
    >
      <span className="text-lg leading-none" aria-hidden>
        {icon}
      </span>
      <span className="mt-1 max-w-full truncate text-[11px] font-bold leading-tight sm:text-xs">
        {label}
      </span>
    </button>
  );
}

function GuideCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-primary-green">
        {label}
      </p>
      <p className="mt-1 text-sm leading-5 text-muted">{value}</p>
    </div>
  );
}
