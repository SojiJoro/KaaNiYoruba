'use client';

import { digitWord, operatorWord, type YorubaMode } from '@/lib/yorubaNumbers';
import type { CalcKey } from '@/lib/calculator';

interface KeypadProps {
  mode: YorubaMode;
  onKey: (key: CalcKey) => void;
}

type LayoutCell = {
  key: CalcKey;
  variant: 'digit' | 'op' | 'fn' | 'equals';
  span?: number;
};

const LAYOUT: LayoutCell[][] = [
  [
    { key: 'C', variant: 'fn' },
    { key: '⌫', variant: 'fn' },
    { key: '÷', variant: 'op' },
    { key: '×', variant: 'op' },
  ],
  [
    { key: '7', variant: 'digit' },
    { key: '8', variant: 'digit' },
    { key: '9', variant: 'digit' },
    { key: '−', variant: 'op' },
  ],
  [
    { key: '4', variant: 'digit' },
    { key: '5', variant: 'digit' },
    { key: '6', variant: 'digit' },
    { key: '+', variant: 'op' },
  ],
  [
    { key: '1', variant: 'digit' },
    { key: '2', variant: 'digit' },
    { key: '3', variant: 'digit' },
    { key: '=', variant: 'equals' },
  ],
  [
    { key: '0', variant: 'digit', span: 2 },
    { key: '.', variant: 'digit' },
  ],
];

export function Keypad({ mode, onKey }: KeypadProps) {
  return (
    <div className="grid w-full grid-cols-4 gap-2.5 rounded-[1.75rem] border border-cocoa/10 bg-cocoa/[0.03] p-2 dark:border-cream/10 dark:bg-cream/[0.04] sm:gap-3 sm:p-3">
      {LAYOUT.flatMap((row, ri) =>
        row.map((cell, ci) => (
          <KeyButton
            key={`${ri}-${ci}-${cell.key}`}
            cell={cell}
            mode={mode}
            onClick={() => onKey(cell.key)}
          />
        ))
      )}
    </div>
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
    'relative flex flex-col items-center justify-center rounded-2xl aspect-square select-none border shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-paper dark:focus:ring-offset-cocoa';
  const variantClasses = {
    digit:
      'bg-paper text-cocoa border-cocoa/10 hover:bg-paper-dark hover:shadow-md dark:bg-cocoa dark:text-cream dark:border-cream/10 dark:hover:bg-cocoa-light',
    op: 'bg-moss/15 text-moss-dark border-moss/30 hover:bg-moss/25 hover:shadow-md dark:bg-moss/25 dark:text-moss-light font-semibold',
    fn: 'bg-cocoa/5 text-cocoa/70 border-cocoa/10 hover:bg-cocoa/10 dark:bg-cream/5 dark:text-cream/70 dark:border-cream/10',
    equals:
      'bg-moss text-cream border-moss-dark hover:bg-moss-dark hover:shadow-lg hover:shadow-moss/25 font-bold',
  }[cell.variant];

  const span = cell.span === 2 ? 'col-span-2 aspect-[2.2/1]' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${cell.key}${subtitle ? `, ${subtitle}` : ''}`}
      className={`${base} ${variantClasses} ${span}`}
    >
      <span className="text-3xl sm:text-4xl font-semibold leading-none">{cell.key}</span>
      {subtitle ? (
        <span className="mt-1 text-xs sm:text-sm font-serif opacity-80 leading-tight">
          {subtitle}
        </span>
      ) : null}
    </button>
  );
}

function labelFor(key: CalcKey, mode: YorubaMode): string {
  if (/^[0-9]$/.test(key)) return digitWord(key, mode);
  if (key === '.') return 'ààmì';
  if (['+', '−', '×', '÷'].includes(key)) return operatorWord(key);
  if (key === '=') return 'dọ́gba';
  if (key === 'C') return 'parẹ́';
  if (key === '⌫') return 'pẹ̀yìn';
  return '';
}
