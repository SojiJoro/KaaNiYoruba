'use client';

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
  if (entries.length === 0) {
    return (
      <div className="rounded-3xl bg-paper/80 dark:bg-cocoa/40 px-6 py-16 text-center border border-cocoa/10 dark:border-cream/10">
        <p className="text-cocoa/60 dark:text-cream/60 font-serif">
          Kò sí ìtàn síbẹ̀.
        </p>
        <p className="text-cocoa/40 dark:text-cream/40 text-sm mt-1">
          No history yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-paper/80 dark:bg-cocoa/40 border border-cocoa/10 dark:border-cream/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-cocoa/10 dark:border-cream/10">
        <h2 className="font-serif text-cocoa dark:text-cream">Ìtàn (History)</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-rust hover:underline"
        >
          Parẹ́
        </button>
      </div>
      <ul className="divide-y divide-cocoa/5 dark:divide-cream/5 max-h-[420px] overflow-y-auto">
        {entries.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onReuse(e)}
              className="w-full px-5 py-3 flex flex-col items-start gap-1 hover:bg-cocoa/5 dark:hover:bg-cream/5 transition-colors text-left"
            >
              <div className="flex items-baseline gap-2 text-sm text-cocoa/60 dark:text-cream/60 font-mono">
                <span>{e.expression}</span>
                <span>=</span>
                <span className="font-semibold text-cocoa dark:text-cream">{e.result}</span>
              </div>
              <div className="font-serif text-cocoa dark:text-cream text-base leading-snug">
                {e.expressionYoruba}{' '}
                <span className="text-moss-dark dark:text-moss-light">dọ́gba</span>{' '}
                <span className="font-semibold">{e.resultYoruba}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
