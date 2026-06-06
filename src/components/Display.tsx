"use client";

import {
  expressionToYoruba,
  toYoruba,
  type YorubaMode,
} from "@/lib/yorubaNumbers";
import { formatNumber } from "@/lib/calculator";

interface DisplayProps {
  expression: string;
  result: number | null;
  error: string | null;
  mode: YorubaMode;
  onSpeak?: (text: string) => void;
}

export function Display({
  expression,
  result,
  error,
  mode,
  onSpeak,
}: DisplayProps) {
  const headlineYoruba = headlineFor({ expression, result, error, mode });
  const headlineArabic = headlineArabicFor({ expression, result });
  const expressionYoruba = expression
    ? expressionToYoruba(expression, mode)
    : "";
  const displayExpression = formatExpression(expression);

  return (
    <section className="relative isolate flex min-h-[230px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-border bg-warm-cream px-4 py-4 shadow-premium sm:min-h-[280px] sm:rounded-[2rem] sm:px-7 sm:py-6">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-soft-green/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p
            aria-label="Expression in Arabic numerals"
            className="min-h-[1.5rem] break-words font-mono text-lg font-semibold tracking-tight text-muted sm:text-xl"
          >
            {displayExpression || " "}
          </p>
          <p
            aria-label="Expression in Yoruba"
            className="min-h-[2rem] break-words font-serif text-[clamp(1.15rem,6vw,1.7rem)] leading-tight text-primary-green [overflow-wrap:anywhere] sm:text-3xl"
          >
            {expressionYoruba || " "}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSpeak?.(headlineYoruba || "")}
          aria-label="Gbọ́ pípè"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-soft-green/40 bg-primary-green text-warm-cream shadow-lg shadow-primary-green/20 transition hover:-translate-y-0.5 hover:bg-deep-green focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2 focus:ring-offset-warm-cream"
          title="Gbọ́ pípè (Hear pronunciation)"
        >
          <SpeakerIcon />
        </button>
      </div>

      <div className="my-5 h-px w-full bg-border" />

      <div className="relative flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <span className="mb-3 inline-flex rounded-full border border-soft-green/30 bg-soft-green/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary-green">
            Ìtàn ìṣirò
          </span>
          <h2
            aria-live="polite"
            className={`break-words font-serif text-[clamp(2.15rem,13vw,3.6rem)] font-black leading-[0.95] tracking-tight [overflow-wrap:anywhere] sm:text-7xl ${
              error ? "text-error" : "text-deep-green"
            }`}
          >
            {error ? error : headlineYoruba || " "}
          </h2>
        </div>
        <div
          aria-label="Result in Arabic numerals"
          className="max-w-full self-end overflow-hidden text-ellipsis rounded-2xl border border-border bg-background px-3 py-2 text-right font-mono text-2xl font-bold text-muted shadow-sm sm:shrink-0 sm:text-4xl"
        >
          {headlineArabic || " "}
        </div>
      </div>
    </section>
  );
}

function formatExpression(expression: string): string {
  return expression
    .replace(/([+−×÷])/g, " $1 ")
    .replace(/\s+/g, " ")
    .trim();
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
  if (error) return "";
  if (result !== null) {
    return toYoruba(Math.trunc(result), mode);
  }
  if (!expression) return "";
  const tokens = expression.split(/([+\-−*×/÷])/).filter(Boolean);
  const last = tokens[tokens.length - 1];
  if (/^-?\d+(\.\d+)?$/.test(last)) {
    return toYoruba(Math.trunc(Number(last)), mode);
  }
  return "";
}

function headlineArabicFor({
  expression,
  result,
}: {
  expression: string;
  result: number | null;
}): string {
  if (result !== null) {
    return formatNumber(result);
  }
  if (!expression) return "";
  const tokens = expression.split(/([+\-−*×/÷])/).filter(Boolean);
  const last = tokens[tokens.length - 1];
  if (/^-?\d+(\.\d+)?$/.test(last)) return last;
  return "";
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
