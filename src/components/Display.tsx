'use client';

import { expressionToYoruba, toYoruba, type YorubaMode } from '@/lib/yorubaNumbers';
import { formatNumber } from '@/lib/calculator';

interface DisplayProps {
  expression: string;
  result: number | null;
  error: string | null;
  mode: YorubaMode;
  onSpeak?: (text: string) => void;
}

export function Display({ expression, result, error, mode, onSpeak }: DisplayProps) {
  // Decide what to show as the headline Yoruba word.
  // Priority: error > computed result > current expression's last operand.
  const headlineYoruba = headlineFor({ expression, result, error, mode });
  const headlineArabic = headlineArabicFor({ expression, result });
  const expressionYoruba = expression ? expressionToYoruba(expression, mode) : '';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cocoa/10 bg-gradient-to-br from-paper to-paper-dark/70 px-6 py-7 shadow-inner dark:border-cream/10 dark:from-cocoa/70 dark:to-cocoa-light/45 flex flex-col gap-4 min-h-[220px] justify-between">
      <div className="pointer-events-none absolute right-5 top-5 h-20 w-20 rounded-full border border-moss/15" />
      <div className="relative flex flex-col gap-1">
        <div
          aria-label="Expression in Arabic numerals"
          className="text-cocoa/60 dark:text-cream/60 text-lg font-mono tracking-tight min-h-[1.5rem]"
        >
          {expression || ' '}
        </div>
        <div
          aria-label="Expression in Yoruba"
          className="text-cocoa dark:text-cream text-2xl leading-snug font-serif min-h-[2rem]"
        >
          {expressionYoruba || ' '}
        </div>
      </div>

      <div className="relative flex items-end justify-between gap-4">
        <div className="flex flex-col">
          <div
            aria-live="polite"
            className={`text-5xl sm:text-6xl font-bold leading-tight ${
              error ? 'text-rust' : 'text-cocoa dark:text-cream'
            } font-serif tracking-tight`}
          >
            {error ? error : headlineYoruba || ' '}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSpeak?.(headlineYoruba || '')}
            aria-label="Gbọ́ pípè"
            className="rounded-full bg-moss/20 hover:bg-moss/30 text-moss dark:text-moss-light p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-paper dark:focus:ring-offset-cocoa"
            title="Gbọ́ pípè (Hear pronunciation)"
          >
            <SpeakerIcon />
          </button>
          <div
            aria-label="Result in Arabic numerals"
            className="text-cocoa/70 dark:text-cream/70 text-2xl font-mono min-w-[3ch] text-right"
          >
            {headlineArabic}
          </div>
        </div>
      </div>
    </div>
  );
}

function headlineFor({
  expression,
  result,
  error,
  mode,
}: {
  expression: string;
  result: number | null;
  error: string | null;
  mode: YorubaMode;
}): string {
  if (error) return '';
  if (result !== null && expression === formatNumber(result)) {
    return toYoruba(result, mode);
  }
  if (!expression) return '';
  // Show the most recent operand in Yoruba.
  const tokens = expression.split(/([+\-−*×/÷])/).filter(Boolean);
  const last = tokens[tokens.length - 1];
  if (/^-?\d+(\.\d+)?$/.test(last)) {
    const n = Number(last);
    return toYoruba(Math.trunc(n), mode);
  }
  // Last char is an operator; show the operator word large.
  return '';
}

function headlineArabicFor({
  expression,
  result,
}: {
  expression: string;
  result: number | null;
}): string {
  if (result !== null && expression === formatNumber(result)) {
    return formatNumber(result);
  }
  if (!expression) return '';
  const tokens = expression.split(/([+\-−*×/÷])/).filter(Boolean);
  const last = tokens[tokens.length - 1];
  if (/^-?\d+(\.\d+)?$/.test(last)) return last;
  return '';
}

function SpeakerIcon() {
  return (
    <svg
      width="20"
      height="20"
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
