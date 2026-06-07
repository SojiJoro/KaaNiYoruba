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
      className="inline-flex max-w-[13rem] shrink-0 items-center gap-1 rounded-[1.1rem] border border-border bg-warm-cream p-1 shadow-card sm:max-w-none sm:rounded-[1.35rem]"
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
      className={`flex min-h-10 flex-1 flex-col items-center justify-center rounded-[0.9rem] px-2 py-1.5 text-[10px] leading-tight transition-all sm:min-h-11 sm:min-w-28 sm:rounded-[1.1rem] sm:px-3 sm:py-2 sm:text-xs ${
        active
          ? "bg-primary-green text-warm-cream shadow-md shadow-primary-green/25"
          : "text-muted hover:bg-pale-green hover:text-deep-green"
      }`}
    >
      <span className="font-bold">{label}</span>
      <span className="mt-0.5 font-serif text-[9px] opacity-80 sm:text-[11px]">
        {sublabel}
      </span>
    </button>
  );
}
