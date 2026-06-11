"use client";

import { useState } from "react";

export interface HistoryEntry {
  id: number;
  expression: string;
  expressionYoruba: string;
  result: number;
  resultYoruba: string;
  timestamp: string;
}

interface HistoryProps {
  entries: HistoryEntry[];
  onReuse: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export function History({ entries, onReuse, onClear }: HistoryProps) {
  const [query, setQuery] = useState("");

  if (entries.length === 0) {
    return (
      <div className="rounded-[2rem] border border-border bg-warm-cream px-6 py-16 text-center shadow-card">
        <p className="font-serif text-2xl text-deep-green">Kò sí ìtàn síbẹ̀.</p>
        <p className="mt-1 text-sm text-muted">
          No history yet. Try 35 — it&apos;s <em>five less than forty</em>:
          Márùndínlógójì.
        </p>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const visible = q
    ? entries.filter(
        (e) =>
          e.expression.toLowerCase().includes(q) ||
          String(e.result).includes(q) ||
          e.expressionYoruba.toLowerCase().includes(q) ||
          e.resultYoruba.toLowerCase().includes(q),
      )
    : entries;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-border bg-warm-cream shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="font-serif text-xl text-deep-green">Ìtàn (History)</h2>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Wá (search)…"
            aria-label="Search history"
            className="w-32 rounded-full border border-border bg-background px-3 py-1 text-xs text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green sm:w-44"
          />
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-bold text-error hover:underline"
          >
            Pa rẹ́
          </button>
        </div>
      </div>
      <ul className="max-h-[420px] divide-y divide-border/70 overflow-y-auto">
        {visible.length === 0 ? (
          <li className="px-5 py-8 text-center text-sm text-muted">
            Kò sí àbájáde fún “{query}”.
          </li>
        ) : null}
        {visible.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onReuse(e)}
              className="flex w-full flex-col items-start gap-1 px-5 py-4 text-left transition-colors hover:bg-pale-green/60"
            >
              <div className="flex items-baseline gap-2 font-mono text-sm text-muted">
                <span>{e.expression}</span>
                <span>=</span>
                <span className="font-bold text-text-dark">{e.result}</span>
              </div>
              <div className="font-serif text-base leading-snug text-deep-green">
                {e.expressionYoruba}{" "}
                <span className="text-primary-green">dọ́gba</span>{" "}
                <span className="font-semibold">{e.resultYoruba}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
