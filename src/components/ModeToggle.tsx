"use client";

import type { YorubaMode } from "@/lib/yorubaNumbers";

interface ModeToggleProps {
  mode: YorubaMode;
  onChange: (mode: YorubaMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Yoruba number mode"
      className="inline-flex w-full items-center gap-1 rounded-[1.65rem] border border-border bg-warm-cream p-1 shadow-card sm:w-auto"
    >
      <SegmentButton
        label="Traditional"
        sublabel="Àtọwọ́dọ́wọ́"
        active={mode === "traditional"}
        onClick={() => onChange("traditional")}
      />
      <SegmentButton
        label="Modern"
        sublabel="Òde-òní"
        active={mode === "modern"}
        onClick={() => onChange("modern")}
      />
    </div>
  );
}

function SegmentButton({
  label,
  sublabel,
  active,
  onClick,
}: {
  label: string;
  sublabel: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex min-h-12 flex-1 flex-col items-center justify-center rounded-[1.35rem] px-4 py-2 text-xs leading-tight transition-all sm:min-w-32 ${
        active
          ? "bg-gradient-to-br from-soft-green to-primary-green text-warm-cream shadow-md shadow-primary-green/25"
          : "text-muted hover:bg-pale-green hover:text-deep-green"
      }`}
    >
      <span className="font-bold">{label}</span>
      <span className="mt-0.5 font-serif text-[11px] opacity-80">
        {sublabel}
      </span>
    </button>
  );
}
