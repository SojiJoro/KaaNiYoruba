"use client";

import {
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyKey,
  evaluate,
  formatNumber,
  initialState,
  type CalcKey,
  type CalcState,
} from "@/lib/calculator";
import {
  digitWord,
  expressionToYoruba,
  operatorWord,
  toYoruba,
  type YorubaMode,
} from "@/lib/yorubaNumbers";
import { SpeakerGlyph } from "./shared";
import { VOICE_ENABLED, type HistoryEntry, type KeypadStyle } from "./types";

// ---------- Display ----------------------------------------------------------

function KaaDisplay({
  expression,
  error,
  mode,
  onSpeak,
}: {
  expression: string;
  error: string | null;
  mode: YorubaMode;
  onSpeak: (text: string) => void;
}) {
  const expr = expression || "0";
  const yorubaPhrase = expression
    ? expressionToYoruba(expression, mode)
    : toYoruba(0, mode);

  // Live preview: once the expression holds a real operation, show what "="
  // would produce — number and words — under a dashed rule.
  const preview = useMemo(() => {
    if (!expression || error) return null;
    const hasOp = /[+−×÷]/.test(expression.slice(1));
    if (!hasOp) return null;
    const r = evaluate(expression);
    if (r.error || r.value === null) return null;
    if (formatNumber(r.value) === expression) return null;
    return r.value;
  }, [expression, error]);

  return (
    <section className="display-card" aria-live="polite">
      <div className="display-top">
        <span className="display-expr">{expr}</span>
        {VOICE_ENABLED && (
          <button
            type="button"
            className="speak-btn"
            aria-label="Gbọ́ pípè (hear it)"
            onClick={() => onSpeak(yorubaPhrase)}
          >
            <SpeakerGlyph size={18} />
          </button>
        )}
      </div>
      <p className="display-yoruba">{error ? error : yorubaPhrase || "—"}</p>
      {preview !== null && (
        <div className="display-preview">
          <span className="display-preview-num">= {formatNumber(preview)}</span>
          <span className="display-preview-words">{toYoruba(preview, mode)}</span>
        </div>
      )}
    </section>
  );
}

// ---------- Keypad -----------------------------------------------------------

const KEYS: CalcKey[] = [
  "C", "⌫", "÷", "×",
  "7", "8", "9", "−",
  "4", "5", "6", "+",
  "1", "2", "3", "=",
  "0", ".",
];

function keyMeta(k: CalcKey, mode: YorubaMode): { kind: string; sub: string } {
  if (/^[0-9]$/.test(k)) return { kind: "digit", sub: digitWord(k, mode) };
  if (k === ".") return { kind: "digit", sub: digitWord(".", mode) };
  if (k === "C") return { kind: "clear", sub: "Nù" };
  if (k === "⌫") return { kind: "util", sub: "Padà" };
  if (k === "=") return { kind: "equals", sub: operatorWord("=") };
  return { kind: "op", sub: operatorWord(k) };
}

function KaaKeypad({
  onKey,
  mode,
  variant,
}: {
  onKey: (key: CalcKey) => void;
  mode: YorubaMode;
  variant: KeypadStyle;
}) {
  return (
    <div className={"keypad kp-" + variant} role="group" aria-label="Keypad">
      {KEYS.map((k) => {
        const m = keyMeta(k, mode);
        return (
          <button
            key={k}
            type="button"
            className={
              "key key-" +
              m.kind +
              (k === "0" ? " key-zero" : "") +
              (k === "=" ? " key-eq" : "")
            }
            onClick={() => onKey(k)}
          >
            <span className="key-main">{k}</span>
            <span className="key-sub">{m.sub}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Calculator screen --------------------------------------------------

export function CalculatorScreen({
  mode,
  keypadStyle,
  onSpeak,
  history,
  onAddHistory,
  reuseRef,
  goHistory,
}: {
  mode: YorubaMode;
  keypadStyle: KeypadStyle;
  onSpeak: (text: string) => void;
  history: HistoryEntry[];
  onAddHistory: (entry: HistoryEntry) => void;
  reuseRef: MutableRefObject<((entry: HistoryEntry) => void) | null>;
  goHistory: () => void;
}) {
  const [calc, setCalc] = useState<CalcState>(initialState);

  const handleKey = useCallback(
    (key: CalcKey) => {
      if (key === "=") {
        const r = evaluate(calc.expression);
        // Only real operations are worth keeping — a bare number is not.
        if (
          !r.error &&
          r.value !== null &&
          /[+−×÷]/.test(calc.expression.slice(1))
        ) {
          onAddHistory({
            id: Date.now(),
            expression: calc.expression,
            expressionYoruba: expressionToYoruba(calc.expression, mode),
            result: r.value,
            resultYoruba: toYoruba(r.value, mode),
            timestamp: new Date().toISOString(),
          });
        }
      }
      setCalc((prev) => applyKey(prev, key));
    },
    [calc.expression, mode, onAddHistory],
  );

  // Physical keyboard support.
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      const map: Record<string, CalcKey> = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷",
        Enter: "=",
        "=": "=",
        Backspace: "⌫",
        Escape: "C",
        Delete: "C",
      };
      let k: CalcKey | null = null;
      if (/^[0-9.]$/.test(e.key)) k = e.key as CalcKey;
      else if (e.key in map) k = map[e.key];
      if (k) {
        e.preventDefault();
        handleKey(k);
      }
    };
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [handleKey]);

  // Let History (and the recent rail) push a past result back into the display.
  useEffect(() => {
    reuseRef.current = (entry: HistoryEntry) => {
      setCalc({
        expression: formatNumber(entry.result),
        lastResult: entry.result,
        error: null,
      });
    };
    return () => {
      reuseRef.current = null;
    };
  }, [reuseRef]);

  const recent = history.slice(0, 5);

  return (
    <div className="screen screen-calc">
      <div className="calc-col">
        <KaaDisplay
          expression={calc.expression}
          error={calc.error}
          mode={mode}
          onSpeak={onSpeak}
        />
        <KaaKeypad onKey={handleKey} mode={mode} variant={keypadStyle} />
      </div>
      <aside className="calc-side">
        <div className="side-head">
          <h2 className="side-title">
            Ìtàn <span className="side-title-en">Recent</span>
          </h2>
          {history.length > 0 && (
            <button type="button" className="link-btn" onClick={goHistory}>
              Gbogbo rẹ̀ →
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="side-empty">
            Kò sí ìtàn síbẹ̀.
            <br />
            <span>Results appear here as you calculate.</span>
          </p>
        ) : (
          <ul className="mini-history">
            {recent.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  className="mini-entry"
                  onClick={() => reuseRef.current?.(e)}
                >
                  <span className="mini-expr">
                    {e.expression} = <b>{formatNumber(e.result)}</b>
                  </span>
                  <span className="mini-words">{e.resultYoruba}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
