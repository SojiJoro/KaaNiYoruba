"use client";

import { useEffect, useState } from "react";
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
}

export function Display({
  expression,
  result,
  error,
  mode,
}: DisplayProps) {
  const headlineYoruba = headlineFor({ expression, result, error, mode });
  const headlineArabic = headlineArabicFor({ expression, result });
  const displayExpression = formatExpression(expression);

  return (
    <section className="relative isolate flex min-h-[185px] flex-col justify-between overflow-hidden rounded-[1.45rem] border border-border bg-warm-cream px-5 py-5 shadow-premium sm:min-h-[210px] sm:rounded-[2rem] sm:px-6 sm:py-5">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-36 w-36 rounded-full bg-soft-green/10" />

      <div className="relative flex items-start justify-between gap-3">
        <p
          aria-label="Expression in Arabic numerals"
          className="min-h-5 min-w-0 flex-1 break-words font-mono text-sm font-semibold tracking-tight text-muted sm:min-h-6 sm:text-lg"
        >
          {displayExpression || " "}
        </p>
      </div>

      <div className="my-2.5 h-px w-full bg-border sm:my-4" />

      <div className="relative flex flex-col justify-end gap-2.5">
        <div className="max-h-[38vh] overflow-y-auto pr-0.5">
          <h2
            aria-live="polite"
            className={`break-words [overflow-wrap:anywhere] font-serif font-black leading-[1.1] tracking-tight ${resultSizeClass(
              error ? error : headlineYoruba,
            )} ${error ? "text-error" : "text-deep-green"}`}
          >
            {error ? error : headlineYoruba || " "}
          </h2>
        </div>
        {headlineArabic ? (
          <div className="flex items-center justify-end gap-2 self-end">
            <CopyButton yoruba={headlineYoruba} arabic={headlineArabic} />
            <div
              aria-label="Result in Arabic numerals"
              className="max-w-full overflow-x-auto whitespace-nowrap rounded-xl border border-border bg-background/80 px-3 py-1 text-right font-mono text-base font-bold text-muted shadow-sm sm:text-2xl"
            >
              {headlineArabic}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Copies the result as "Yorùbá (numeral)" — both scripts travel together. */
function CopyButton({ yoruba, arabic }: { yoruba: string; arabic: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      aria-label="Copy result"
      title="Ṣe àdàkọ (copy)"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(
            yoruba ? `${yoruba} (${arabic})` : arabic,
          );
          setCopied(true);
        } catch {
          // Clipboard unavailable (e.g. insecure context): silently skip.
        }
      }}
      className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-bold text-muted transition-colors hover:text-gold"
    >
      {copied ? "✓" : "⧉"}
    </button>
  );
}

// Scale the headline to its length so short words stay bold and beautiful while
// long compound numbers shrink to fit instead of overflowing the panel.
function resultSizeClass(text: string): string {
  const len = (text || "").length;
  if (len <= 7) return "text-[clamp(2.1rem,10vw,3.5rem)]";
  if (len <= 15) return "text-[clamp(1.6rem,7.5vw,2.6rem)]";
  if (len <= 28) return "text-[clamp(1.3rem,6vw,2rem)]";
  if (len <= 48) return "text-[clamp(1.1rem,4.8vw,1.6rem)]";
  return "text-[clamp(0.95rem,4vw,1.35rem)]";
}

function formatExpression(expression: string): string {
  return expression
    .replace(/([+−×÷^])/g, " $1 ")
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
  // A lone typed number is read from its exact digits, so long inputs never
  // decay into a float's "Òdo Òdo…" tail.
  if (/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(expression)) {
    return numericInputToYoruba(expression, mode);
  }
  if (result !== null) {
    return toYoruba(result, mode);
  }
  if (!expression) return "";
  const tokens = expression.split(/([+\-−*×/÷^])/).filter(Boolean);
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
  const tokens = expression.split(/([+\-−*×/÷^])/).filter(Boolean);
  const last = tokens[tokens.length - 1];
  if (/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(last)) return last;
  return "";
}
