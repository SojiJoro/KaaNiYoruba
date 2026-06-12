"use client";

import { formatNumber } from "@/lib/calculator";
import type { HistoryEntry } from "./types";

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function HistoryScreen({
  history,
  onClear,
  onReuse,
  goCalc,
}: {
  history: HistoryEntry[];
  onClear: () => void;
  onReuse: (entry: HistoryEntry) => void;
  goCalc: () => void;
}) {
  return (
    <div className="screen screen-history">
      <header className="screen-head">
        <div>
          <h1 className="screen-title">Ìtàn</h1>
          <p className="screen-sub">History — tap an entry to reuse its result</p>
        </div>
        {history.length > 0 && (
          <button type="button" className="ghost-btn danger" onClick={onClear}>
            Pa rẹ́ <span className="btn-en">Clear</span>
          </button>
        )}
      </header>

      {history.length === 0 ? (
        <div className="empty-card">
          <div className="empty-mark">Òdo</div>
          <p className="empty-title">Kò sí ìtàn síbẹ̀.</p>
          <p className="empty-sub">
            No history yet — every calculation you complete is kept here, in
            numbers and in words.
          </p>
          <button type="button" className="primary-btn" onClick={goCalc}>
            Bẹ̀rẹ̀ ìṣirò →
          </button>
        </div>
      ) : (
        <ul className="history-list">
          {history.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                className="history-entry"
                onClick={() => {
                  onReuse(e);
                  goCalc();
                }}
              >
                <div className="history-row">
                  <span className="history-expr">
                    {e.expression} = <b>{formatNumber(e.result)}</b>
                  </span>
                  <span className="history-time">{formatTime(e.timestamp)}</span>
                </div>
                <p className="history-words">
                  {e.expressionYoruba} <em>dọ́gba</em>{" "}
                  <strong>{e.resultYoruba}</strong>
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
