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
import { ThemeToggle } from "./ThemeToggle";

type Tab = "calculator" | "history" | "converter" | "learn";

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "calculator", label: "Kálkù", icon: "▦" },
  { id: "history", label: "Ìtàn", icon: "◷" },
  { id: "converter", label: "Yípadà", icon: "▱" },
  { id: "learn", label: "Kọ́ ẹ̀kọ́", icon: "◈" },
];

const HISTORY_KEY = "kaa-history";

export function Calculator() {
  const [state, setState] = useState<CalcState>(initialState);
  const [mode, setMode] = useState<YorubaMode>("traditional");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("calculator");

  // History survives reloads (and offline restarts) via localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // Corrupt or unavailable storage: start fresh.
    }
    setHistoryLoaded(true);
  }, []);

  useEffect(() => {
    if (!historyLoaded) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    } catch {
      // Private browsing: history just won't persist.
    }
  }, [history, historyLoaded]);

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

  const isCalculator = tab === "calculator";

  return (
    <div
      className={`w-full ${
        isCalculator
          ? "flex min-h-[100svh] max-w-[430px] flex-col pb-4 sm:h-auto sm:min-h-0 sm:max-w-5xl sm:pb-5"
          : "max-w-5xl pb-20 sm:pb-5"
      }`}
    >
      <section
        className={`relative overflow-hidden border border-border/70 bg-background/90 shadow-app backdrop-blur ${
          isCalculator
            ? "flex flex-1 flex-col rounded-none p-4 sm:block sm:rounded-[2.25rem] sm:p-6 lg:p-7"
            : "rounded-[1.5rem] p-3 sm:rounded-[2.25rem] sm:p-6 lg:p-7"
        }`}
      >
        <div className="pointer-events-none absolute left-8 top-0 h-px w-1/2 bg-gradient-to-r from-gold/60 to-transparent" />
        <AppHeader mode={mode} onModeChange={setMode} />

        <div
          className={`relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start ${
            isCalculator ? "mt-4 flex-1" : "mt-4"
          }`}
        >
          <div className="flex min-w-0 flex-col gap-4">
            <div className="min-w-0 flex-1">
              {tab === "calculator" && (
                <div className="flex flex-col gap-4">
                  <Display
                    expression={state.expression}
                    result={previewResult}
                    error={state.error}
                    mode={mode}
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
                <ConverterPanel mode={mode} />
              )}
              {tab === "learn" && (
                <LearningMode mode={mode} />
              )}
            </div>
          </div>

          <aside className="hidden rounded-[1.75rem] border border-border bg-warm-cream/80 p-5 shadow-card xl:flex xl:flex-col xl:gap-4">
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
            </div>

            <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4 text-sm">
              <a href="/onka" className="font-semibold text-primary-green hover:underline">
                How Yorùbá numbers work →
              </a>
              <a href="/about" className="font-semibold text-primary-green hover:underline">
                About Kàá →
              </a>
            </div>
          </aside>
        </div>
      </section>

      <BottomNav activeTab={tab} onChange={setTab} compact={isCalculator} />
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
    <header className="relative flex shrink-0 flex-row items-center justify-between gap-3 sm:items-start">
      <div className="min-w-0">
        <h1 className="relative inline-block font-serif text-4xl font-black leading-none tracking-[-0.04em] text-primary-green sm:text-6xl">
          Kàá
          <span className="absolute -right-1.5 top-0.5 h-1.5 w-1.5 rounded-full bg-gold sm:-right-2 sm:h-2 sm:w-2" />
        </h1>
        <p className="mt-1.5 text-xs font-semibold text-muted sm:mt-2 sm:text-base">
          Yorùbá number &amp; calculator
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>
    </header>
  );
}

function BottomNav({
  activeTab,
  onChange,
  compact,
}: {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
  compact: boolean;
}) {
  return (
    <nav
      aria-label="Primary"
      className={`z-30 mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[1.35rem] border border-border bg-warm-cream/95 p-1.5 shadow-floating backdrop-blur sm:sticky sm:bottom-5 sm:mt-5 sm:max-w-xl sm:rounded-[1.75rem] ${
        compact
          ? "mt-2 w-full shrink-0"
          : "fixed inset-x-3 bottom-3"
      }`}
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
      className={`group flex min-h-12 flex-col items-center justify-center rounded-full px-2 text-center transition-all ${
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
