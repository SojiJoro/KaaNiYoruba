"use client";

import { digitWord, type YorubaMode } from "@/lib/yorubaNumbers";
import type { CalcKey } from "@/lib/calculator";

interface KeypadProps {
  mode: YorubaMode;
  onKey: (key: CalcKey) => void;
}

type LayoutCell = {
  key: CalcKey;
  variant: "digit" | "op" | "fn" | "equals";
  span?: number;
  tall?: boolean;
  emphasis?: boolean;
};

const LAYOUT: LayoutCell[] = [
  { key: "C", variant: "fn" },
  { key: "⌫", variant: "fn" },
  { key: "÷", variant: "op" },
  { key: "×", variant: "op" },
  { key: "7", variant: "digit" },
  { key: "8", variant: "digit" },
  { key: "9", variant: "digit" },
  { key: "−", variant: "op" },
  { key: "4", variant: "digit" },
  { key: "5", variant: "digit" },
  { key: "6", variant: "digit" },
  { key: "+", variant: "op", emphasis: true },
  { key: "1", variant: "digit" },
  { key: "2", variant: "digit" },
  { key: "3", variant: "digit" },
  { key: "=", variant: "equals", tall: true },
  { key: "0", variant: "digit", span: 2 },
  { key: ".", variant: "digit" },
];

export function Keypad({ mode, onKey }: KeypadProps) {
  return (
    <section
      aria-label="Calculator keypad"
      className="grid w-full grid-cols-4 gap-2.5 sm:gap-3.5"
    >
      {LAYOUT.map((cell) => (
        <KeyButton
          key={cell.key}
          cell={cell}
          mode={mode}
          onClick={() => onKey(cell.key)}
        />
      ))}
    </section>
  );
}

function KeyButton({
  cell,
  mode,
  onClick,
}: {
  cell: LayoutCell;
  mode: YorubaMode;
  onClick: () => void;
}) {
  const subtitle = labelFor(cell.key, mode);
  const base =
    "relative flex min-h-[clamp(3.35rem,8.5svh,4.5rem)] select-none flex-col items-center justify-center overflow-hidden rounded-[1.35rem] border px-2 py-2 text-center shadow-button transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2 focus:ring-offset-background sm:min-h-[72px] sm:rounded-[1.45rem] sm:px-3 sm:py-2.5";
  const variantClasses = {
    digit:
      "border-border bg-warm-cream text-text-dark hover:border-soft-green/45 hover:bg-white",
    op: cell.emphasis
      ? "border-soft-green/55 bg-gradient-to-br from-soft-green to-primary-green text-warm-cream hover:from-soft-green hover:to-deep-green font-bold"
      : "border-border bg-pale-green/55 text-text-dark hover:bg-soft-green/20 font-semibold",
    fn: "border-border bg-pale-green/70 text-text-dark hover:bg-soft-green/20 font-semibold",
    equals:
      "border-deep-green bg-gradient-to-br from-primary-green to-deep-green text-warm-cream font-bold shadow-xl shadow-primary-green/25 hover:shadow-primary-green/35",
  }[cell.variant];

  const span = cell.span === 2 ? "col-span-2" : "";
  const tall = cell.tall ? "row-span-2 min-h-[clamp(7.15rem,18svh,9.5rem)] sm:min-h-[150px]" : "";
  const subtitleClass =
    cell.variant === "equals" || cell.emphasis
      ? "text-warm-cream/90"
      : "text-primary-green";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${symbolLabel(cell.key)}${subtitle ? `, ${subtitle}` : ""}`}
      className={`${base} ${variantClasses} ${span} ${tall}`}
    >
      <span className="pointer-events-none absolute inset-x-2 top-1.5 h-px rounded-full bg-white/60 opacity-70" />
      <span
        className={`flex min-h-0 flex-col items-center justify-center ${cell.tall ? "gap-2 sm:gap-2.5" : "gap-1 sm:gap-1.5"}`}
      >
        <span
          className={`${symbolSizeClass(cell)} font-black leading-[0.88] tracking-[-0.04em]`}
        >
          {cell.key}
        </span>
        {subtitle ? (
          <span
            className={`max-w-full whitespace-nowrap text-[0.68rem] font-bold leading-none tracking-[-0.01em] opacity-95 sm:text-xs ${subtitleClass}`}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function symbolSizeClass(cell: LayoutCell): string {
  if (cell.tall) return "text-[2.35rem] sm:text-[3.1rem]";
  if (cell.key === "0") return "text-[2rem] sm:text-[2.75rem]";
  if (cell.variant === "digit") return "text-[1.9rem] sm:text-[2.55rem]";
  return "text-[1.7rem] sm:text-[2.25rem]";
}

function labelFor(key: CalcKey, mode: YorubaMode): string {
  if (/^[0-9]$/.test(key)) return digitWord(key, mode);
  if (key === ".") return "Ààmi";
  if (key === "+") return "Pẹ̀lú";
  if (key === "−") return "Yọ";
  if (key === "×") return "Ìgbà";
  if (key === "÷") return "Pín sí";
  if (key === "=") return "Dọ́gba";
  if (key === "C") return "Pa rẹ́";
  if (key === "⌫") return "Pẹ̀yìn";
  return "";
}

function symbolLabel(key: CalcKey): string {
  if (key === "C") return "Clear";
  if (key === "⌫") return "Backspace";
  return key;
}
