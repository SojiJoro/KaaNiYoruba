'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { applyKey, initialState, type CalcKey, type CalcState, evaluate, formatNumber } from '@/lib/calculator';
import { expressionToYoruba, toYoruba, type YorubaMode } from '@/lib/yorubaNumbers';
import { Display } from './Display';
import { Keypad } from './Keypad';
import { ModeToggle } from './ModeToggle';
import { History, type HistoryEntry } from './History';
import { ConverterPanel } from './ConverterPanel';
import { LearningMode } from './LearningMode';

type Tab = 'calculator' | 'history' | 'converter' | 'learn';

const TABS: Array<{ id: Tab; label: string; sublabel: string; icon: string }> = [
  { id: 'calculator', label: 'Kálkù', sublabel: 'Calculate', icon: '✦' },
  { id: 'history', label: 'Ìtàn', sublabel: 'History', icon: '◷' },
  { id: 'converter', label: 'Yípadà', sublabel: 'Convert', icon: '⇄' },
  { id: 'learn', label: 'Kọ́ ẹ̀kọ́', sublabel: 'Practice', icon: '◌' },
];

export function Calculator() {
  const [state, setState] = useState<CalcState>(initialState);
  const [mode, setMode] = useState<YorubaMode>('traditional');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [tab, setTab] = useState<Tab>('calculator');

  const handleKey = useCallback(
    (key: CalcKey) => {
      setState((prev) => {
        const next = applyKey(prev, key);
        if (key === '=' && !next.error && next.lastResult !== null) {
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
    [mode]
  );

  // Keyboard support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key;
      const map: Record<string, CalcKey> = {
        '*': '×',
        '/': '÷',
        '-': '−',
        Enter: '=',
        '=': '=',
        Backspace: '⌫',
        Escape: 'C',
        c: 'C',
        C: 'C',
      };
      if (/^[0-9.]$/.test(k)) {
        handleKey(k as CalcKey);
        e.preventDefault();
        return;
      }
      if (k === '+' || k === '*' || k === '/' || k === '-') {
        handleKey(map[k]);
        e.preventDefault();
        return;
      }
      if (map[k]) {
        handleKey(map[k]);
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleKey]);

  // Live preview: while expression is mid-typing, show running result.
  const previewResult = useMemo(() => {
    if (state.lastResult !== null && state.expression === formatNumber(state.lastResult)) {
      return state.lastResult;
    }
    if (!state.expression) return null;
    const { value } = evaluate(state.expression);
    return value;
  }, [state]);

  const handleSpeak = useCallback((text: string) => {
    if (!text) return;
    // Placeholder: Web Speech API will not pronounce Yoruba perfectly, but
    // exposing the hook keeps the audio button functional. Replace with
    // recorded clips later for native quality.
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'yo-NG';
    utter.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, []);

  return (
    <div className="w-full max-w-5xl">
      <section className="relative overflow-hidden rounded-[2rem] border border-cocoa/10 bg-paper/85 p-4 shadow-2xl shadow-cocoa/10 backdrop-blur dark:border-cream/10 dark:bg-cocoa/55 dark:shadow-cocoa-dark/40 sm:p-6 lg:p-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-moss via-rust to-moss" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-moss/20" />
        <div className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-moss/10" />

        <header className="relative mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cocoa text-2xl font-bold text-cream shadow-lg shadow-cocoa/20 dark:bg-cream dark:text-cocoa">
              K
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss-dark dark:text-moss-light">
                Yoruba Numeracy Studio
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-cocoa dark:text-cream sm:text-5xl">
                Káà
              </h1>
              <p className="max-w-xl text-sm leading-6 text-cocoa/65 dark:text-cream/65">
                Calculate, convert, and practice numbers with Yorùbá words shown beside every step.
              </p>
            </div>
          </div>
          <ModeToggle mode={mode} onChange={setMode} />
        </header>

        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="flex min-w-0 flex-col gap-4">
            <nav
              aria-label="Sections"
              className="grid grid-cols-2 gap-2 rounded-3xl border border-cocoa/10 bg-paper-dark/45 p-2 shadow-inner dark:border-cream/10 dark:bg-cocoa-light/35 sm:grid-cols-4"
            >
              {TABS.map((item) => (
                <TabButton
                  key={item.id}
                  label={item.label}
                  sublabel={item.sublabel}
                  icon={item.icon}
                  active={tab === item.id}
                  onClick={() => setTab(item.id)}
                />
              ))}
            </nav>

            <div className="min-w-0">
              {tab === 'calculator' && (
                <div className="flex flex-col gap-4">
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

              {tab === 'history' && (
                <History
                  entries={history}
                  onReuse={(e) => {
                    setState({ ...initialState, expression: e.expression });
                    setTab('calculator');
                  }}
                  onClear={() => setHistory([])}
                />
              )}

              {tab === 'converter' && <ConverterPanel mode={mode} onSpeak={handleSpeak} />}
              {tab === 'learn' && <LearningMode mode={mode} onSpeak={handleSpeak} />}
            </div>
          </div>

          <aside className="hidden rounded-3xl border border-cocoa/10 bg-cocoa/[0.03] p-5 dark:border-cream/10 dark:bg-cream/[0.04] lg:flex lg:flex-col lg:gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cocoa/45 dark:text-cream/45">
                Live guide
              </p>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-cocoa dark:text-cream">
                Learn while you calculate
              </h2>
              <p className="mt-2 text-sm leading-6 text-cocoa/65 dark:text-cream/65">
                Each input is mirrored in Yorùbá, so the calculator doubles as a lightweight study tool.
              </p>
            </div>

            <div className="grid gap-3">
              <GuideCard label="Keyboard ready" value="Type digits, +, −, ×, ÷ or Enter" />
              <GuideCard label="Modes" value="Switch between traditional and modern phrasing" />
              <GuideCard label="Audio" value="Tap the speaker to hear the current word" />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function TabButton({
  label,
  sublabel,
  icon,
  active,
  onClick,
}: {
  label: string;
  sublabel: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-2 rounded-2xl px-3 py-3 text-left transition-all ${
        active
          ? 'bg-moss text-cream shadow-lg shadow-moss/20'
          : 'text-cocoa/70 hover:bg-cocoa/5 dark:text-cream/70 dark:hover:bg-cream/5'
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ${
          active ? 'bg-cream/20' : 'bg-cocoa/5 dark:bg-cream/5'
        }`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-serif text-sm font-semibold leading-tight">
          {label}
        </span>
        <span className="block truncate text-[11px] opacity-70">{sublabel}</span>
      </span>
    </button>
  );
}

function GuideCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cocoa/10 bg-paper/60 p-4 dark:border-cream/10 dark:bg-cocoa/35">
      <p className="text-xs font-semibold uppercase tracking-wider text-moss-dark dark:text-moss-light">
        {label}
      </p>
      <p className="mt-1 text-sm leading-5 text-cocoa/70 dark:text-cream/70">{value}</p>
    </div>
  );
}
