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
    <div className="w-full max-w-md mx-auto flex flex-col gap-4 px-4 sm:px-0">
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-4xl font-serif font-bold text-cocoa dark:text-cream tracking-tight">
            Káà
          </h1>
          <p className="text-xs text-cocoa/60 dark:text-cream/60 -mt-1">
            Yoruba number & calculator
          </p>
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
      </header>

      {tab === 'calculator' && (
        <>
          <Display
            expression={state.expression}
            result={previewResult}
            error={state.error}
            mode={mode}
            onSpeak={handleSpeak}
          />
          <Keypad mode={mode} onKey={handleKey} />
        </>
      )}

      {tab === 'history' && (
        <History entries={history} onReuse={(e) => {
          setState({ ...initialState, expression: e.expression });
          setTab('calculator');
        }} onClear={() => setHistory([])} />
      )}

      {tab === 'converter' && <ConverterPanel mode={mode} onSpeak={handleSpeak} />}
      {tab === 'learn' && <LearningMode mode={mode} onSpeak={handleSpeak} />}

      <nav
        aria-label="Sections"
        className="flex justify-around bg-paper-dark/40 dark:bg-cocoa-light/40 rounded-2xl p-1 border border-cocoa/10 dark:border-cream/10"
      >
        <TabButton label="Kálkù" active={tab === 'calculator'} onClick={() => setTab('calculator')} />
        <TabButton label="Ìtàn" active={tab === 'history'} onClick={() => setTab('history')} />
        <TabButton label="Yípadà" active={tab === 'converter'} onClick={() => setTab('converter')} />
        <TabButton label="Kọ́ ẹ̀kọ́" active={tab === 'learn'} onClick={() => setTab('learn')} />
      </nav>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium font-serif transition-colors ${
        active
          ? 'bg-moss text-cream shadow-sm'
          : 'text-cocoa/70 dark:text-cream/70 hover:bg-cocoa/5 dark:hover:bg-cream/5'
      }`}
    >
      {label}
    </button>
  );
}
