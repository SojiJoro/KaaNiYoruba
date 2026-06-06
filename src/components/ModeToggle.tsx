'use client';

import type { YorubaMode } from '@/lib/yorubaNumbers';

interface ModeToggleProps {
  mode: YorubaMode;
  onChange: (mode: YorubaMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Yoruba number mode"
      className="flex items-center gap-1 rounded-full bg-paper-dark/60 dark:bg-cocoa-light/60 p-1 border border-cocoa/10 dark:border-cream/10"
    >
      <SegmentButton
        label="Àtọwọ́dọ́wọ́"
        sublabel="Traditional"
        active={mode === 'traditional'}
        onClick={() => onChange('traditional')}
      />
      <SegmentButton
        label="Òde-òní"
        sublabel="Modern"
        active={mode === 'modern'}
        onClick={() => onChange('modern')}
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
      className={`px-3 py-1.5 rounded-full text-xs font-serif transition-colors flex flex-col items-center leading-tight ${
        active
          ? 'bg-moss text-cream shadow-sm'
          : 'text-cocoa/70 dark:text-cream/70 hover:bg-cocoa/5 dark:hover:bg-cream/5'
      }`}
    >
      <span className="font-semibold">{label}</span>
      <span className="text-[10px] opacity-70">{sublabel}</span>
    </button>
  );
}
