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
      className="grid w-full grid-cols-4 gap-2.5 sm:gap-3"
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
    "relative flex min-h-[72px] select-none flex-col items-center justify-center rounded-[1.35rem] border px-1 text-center shadow-button transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2 focus:ring-offset-background";
  const variantClasses = {
    digit:
      "border-border bg-warm-cream text-text-dark hover:border-soft-green/45 hover:bg-white",
    op: cell.emphasis
      ? "border-soft-green/55 bg-soft-green text-deep-green hover:bg-soft-green/85 font-bold"
      : "border-soft-green/25 bg-pale-green text-deep-green hover:bg-soft-green/25 font-semibold",
    fn: "border-soft-green/20 bg-pale-green text-deep-green hover:bg-soft-green/20 font-semibold",
    equals:
      "border-deep-green bg-gradient-to-br from-primary-green to-deep-green text-warm-cream font-bold shadow-xl shadow-primary-green/25 hover:shadow-primary-green/35",
  }[cell.variant];

  const span = cell.span === 2 ? "col-span-2" : "";
  const tall = cell.tall ? "row-span-2 min-h-[156px]" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${symbolLabel(cell.key)}${subtitle ? `, ${subtitle}` : ""}`}
      className={`${base} ${variantClasses} ${span} ${tall}`}
    >
      <span className="text-3xl font-bold leading-none tracking-tight sm:text-4xl">
        {cell.key}
      </span>
      {subtitle ? (
        <span className="mt-1.5 max-w-full truncate text-[0.78rem] font-semibold leading-tight text-primary-green sm:text-sm">
          {subtitle}
        </span>
      ) : null}
    </button>
  );
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
