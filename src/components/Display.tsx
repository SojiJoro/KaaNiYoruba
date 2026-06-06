"use client";

import {
  numericInputToYoruba,
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
  const displayExpression = formatExpression(expression);

  return (
    <section className="relative isolate flex min-h-[164px] flex-col justify-between overflow-hidden rounded-[1.45rem] border border-border bg-warm-cream px-4 py-4 shadow-premium sm:min-h-[210px] sm:rounded-[2rem] sm:px-6 sm:py-5">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-36 w-36 rounded-full bg-soft-green/10" />

      <div className="relative flex items-start justify-between gap-3">
        <p
          aria-label="Expression in Arabic numerals"
          className="min-h-6 min-w-0 flex-1 break-words font-mono text-base font-semibold tracking-tight text-muted sm:text-lg"
        >
          {displayExpression || " "}
        </p>

        <button
          type="button"
          onClick={() => onSpeak?.(headlineYoruba || "")}
          aria-label="Gbọ́ pípè"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-primary-green text-warm-cream shadow-button transition hover:-translate-y-0.5 hover:bg-deep-green focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2 focus:ring-offset-warm-cream sm:h-12 sm:w-12"
          title="Gbọ́ pípè (Hear pronunciation)"
        >
          <SpeakerIcon />
        </button>
      </div>

      <div className="my-3 h-px w-full bg-border sm:my-4" />

      <div className="relative flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2
            aria-live="polite"
            className={`break-words font-serif text-[clamp(1.65rem,8vw,2.55rem)] font-black leading-[1.02] tracking-tight [overflow-wrap:anywhere] sm:text-[clamp(2.25rem,5vw,4rem)] ${
              error ? "text-error" : "text-deep-green"
            }`}
          >
            {error ? error : headlineYoruba || " "}
          </h2>
        </div>
        <div
          aria-label="Result in Arabic numerals"
          className="max-w-[35%] shrink-0 overflow-hidden text-ellipsis rounded-2xl border border-border bg-background/80 px-3 py-2 text-right font-mono text-2xl font-bold text-muted shadow-sm sm:text-4xl"
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
    return toYoruba(result, mode);
  }
  if (!expression) return "";
  const tokens = expression.split(/([+\-−*×/÷])/).filter(Boolean);
  const last = tokens[tokens.length - 1];
  if (/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(last)) {
    return numericInputToYoruba(last, mode);
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
  if (/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(last)) return last;
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
