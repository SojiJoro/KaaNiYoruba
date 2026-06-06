'use client';

import { useState } from 'react';
import { toYoruba, type YorubaMode } from '@/lib/yorubaNumbers';

interface ConverterPanelProps {
  mode: YorubaMode;
  onSpeak: (text: string) => void;
}

export function ConverterPanel({ mode, onSpeak }: ConverterPanelProps) {
  const [value, setValue] = useState('25');
  const n = parseValue(value);
  const yoruba = n === null ? '' : toYoruba(n, mode);

  return (
    <div className="rounded-3xl bg-paper/80 dark:bg-cocoa/40 border border-cocoa/10 dark:border-cream/10 px-6 py-6 flex flex-col gap-5">
      <header>
        <h2 className="font-serif text-cocoa dark:text-cream text-xl">
          Yípadà Nọ́mbà (Number Converter)
        </h2>
        <p className="text-xs text-cocoa/60 dark:text-cream/60 mt-1">
          Tẹ nọ́mbà kan láàrín 0–1,000 láti rí ọ̀rọ̀ Yorùbá rẹ̀.
        </p>
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-cocoa/70 dark:text-cream/70">Nọ́mbà</span>
        <input
          type="number"
          inputMode="numeric"
          min={-1000}
          max={1000}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="rounded-2xl bg-paper-dark/40 dark:bg-cocoa-light/40 border border-cocoa/15 dark:border-cream/15 px-4 py-3 text-2xl font-mono text-cocoa dark:text-cream focus:outline-none focus:ring-2 focus:ring-moss"
        />
      </label>

      <div className="flex items-end justify-between gap-4 mt-2">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-cocoa/50 dark:text-cream/50">
            Yorùbá
          </p>
          <p className="text-4xl font-serif text-cocoa dark:text-cream leading-tight mt-1 break-words">
            {yoruba || '—'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSpeak(yoruba)}
          className="rounded-full bg-moss/20 hover:bg-moss/30 text-moss p-3 transition-colors"
          aria-label="Gbọ́ pípè"
        >
          <SpeakerIcon />
        </button>
      </div>

      <p className="text-xs text-cocoa/40 dark:text-cream/40 leading-relaxed border-t border-cocoa/10 dark:border-cream/10 pt-3">
        Àtọwọ́dọ́wọ́ (Traditional) lo èdè Yorùbá pẹ̀lú ìṣirò kí-kọ́. Òde-òní (Modern)
        nlo àfikún kàn nìkan.
      </p>
    </div>
  );
}

function parseValue(s: string): number | null {
  if (s.trim() === '') return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  if (n < -1000 || n > 1000) return null;
  return Math.trunc(n);
}

function SpeakerIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}
