// Kàá — Yoruba Number & Calculator App (single-file design implementation)
// ---------------------------------------------------------------------------
// A self-contained React implementation of the Kàá design (README §1–2):
// a Yoruba-first calculator where every digit, operator, and result is
// rendered in proper Yorùbá with diacritics intact, with small Arabic
// numerals for reference. Includes the four surfaces from the layout plan —
// Calculator, History, Converter, Learn — plus the Traditional/Modern
// counting-mode toggle and dark mode.
//
// No dependencies beyond React. Word tables are ported from
// shared/yoruba-language-pack.json (the engine's single source of truth);
// composition rules follow docs/yoruba-number-logic.md.

import React, { useEffect, useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Yoruba number engine (ported from src/lib/yorubaNumbers.ts)
// ---------------------------------------------------------------------------

const BASE_0_10 = {
  0: 'Òdo', 1: 'Ọ̀kan', 2: 'Méjì', 3: 'Mẹ́ta', 4: 'Mẹ́rin', 5: 'Márùn-ún',
  6: 'Mẹ́fà', 7: 'Méje', 8: 'Mẹ́jọ', 9: 'Mẹ́sàn-án', 10: 'Mẹ́wàá',
};

const TENS_BASE = {
  20: 'Ogún', 30: 'Ọgbọ̀n', 40: 'Ogójì', 50: 'Àádọ́ta', 60: 'Ọgọ́ta',
  70: 'Àádọ́rin', 80: 'Ọgọ́rin', 90: 'Àádọ́rùn', 100: 'Ọgọ́rùn-ún',
};

const HUNDREDS_BASE = {
  100: 'Ọgọ́rùn-ún', 200: 'Igba', 300: 'Ọ̀ọ́dúnrún', 400: 'Irinwó',
  500: 'Ẹ̀ẹ́dẹ́gbẹ̀ta', 600: 'Ẹgbẹ̀ta', 700: 'Ẹ̀ẹ́dẹ́gbẹ̀rin', 800: 'Ẹgbẹ̀rin',
  900: 'Ẹ̀ẹ́dẹ́gbẹ̀rún', 1000: 'Ẹgbẹ̀rún',
};

// Hand-verified subtractive forms — tone changes resist clean generation.
const TRADITIONAL_0_99 = {
  0: 'Òdo', 1: 'Ọ̀kan', 2: 'Méjì', 3: 'Mẹ́ta', 4: 'Mẹ́rin', 5: 'Márùn-ún',
  6: 'Mẹ́fà', 7: 'Méje', 8: 'Mẹ́jọ', 9: 'Mẹ́sàn-án', 10: 'Mẹ́wàá',
  11: 'Mọ́kànlá', 12: 'Méjìlá', 13: 'Mẹ́tàlá', 14: 'Mẹ́rìnlá', 15: 'Mẹ́ẹ̀dógún',
  16: 'Mẹ́rìndínlógún', 17: 'Mẹ́tàdínlógún', 18: 'Méjìdínlógún', 19: 'Mọ́kàndínlógún',
  20: 'Ogún', 21: 'Mọ́kànlélógún', 22: 'Méjìlélógún', 23: 'Mẹ́tàlélógún',
  24: 'Mẹ́rìnlélógún', 25: 'Mẹ́ẹ̀dọ́gbọ̀n', 26: 'Mẹ́rìndínlọ́gbọ̀n',
  27: 'Mẹ́tàdínlọ́gbọ̀n', 28: 'Méjìdínlọ́gbọ̀n', 29: 'Mọ́kàndínlọ́gbọ̀n',
  30: 'Ọgbọ̀n', 31: 'Mọ́kànlélọ́gbọ̀n', 32: 'Méjìlélọ́gbọ̀n', 33: 'Mẹ́tàlélọ́gbọ̀n',
  34: 'Mẹ́rìnlélọ́gbọ̀n', 35: 'Márùndínlógójì', 36: 'Mẹ́rìndínlógójì',
  37: 'Mẹ́tàdínlógójì', 38: 'Méjìdínlógójì', 39: 'Mọ́kàndínlógójì',
  40: 'Ogójì', 41: 'Mọ́kànlélógójì', 42: 'Méjìlélógójì', 43: 'Mẹ́tàlélógójì',
  44: 'Mẹ́rìnlélógójì', 45: 'Márùndínláàádọ́ta', 46: 'Mẹ́rìndínláàádọ́ta',
  47: 'Mẹ́tàdínláàádọ́ta', 48: 'Méjìdínláàádọ́ta', 49: 'Mọ́kàndínláàádọ́ta',
  50: 'Àádọ́ta', 51: 'Mọ́kànléláàádọ́ta', 52: 'Méjìléláàádọ́ta',
  53: 'Mẹ́tàléláàádọ́ta', 54: 'Mẹ́rìnléláàádọ́ta', 55: 'Márùndínlọ́gọ́ta',
  56: 'Mẹ́rìndínlọ́gọ́ta', 57: 'Mẹ́tàdínlọ́gọ́ta', 58: 'Méjìdínlọ́gọ́ta',
  59: 'Mọ́kàndínlọ́gọ́ta', 60: 'Ọgọ́ta', 61: 'Mọ́kànlélọ́gọ́ta',
  62: 'Méjìlélọ́gọ́ta', 63: 'Mẹ́tàlélọ́gọ́ta', 64: 'Mẹ́rìnlélọ́gọ́ta',
  65: 'Márùndínláàádọ́rin', 66: 'Mẹ́rìndínláàádọ́rin', 67: 'Mẹ́tàdínláàádọ́rin',
  68: 'Méjìdínláàádọ́rin', 69: 'Mọ́kàndínláàádọ́rin', 70: 'Àádọ́rin',
  71: 'Mọ́kànléláàádọ́rin', 72: 'Méjìléláàádọ́rin', 73: 'Mẹ́tàléláàádọ́rin',
  74: 'Mẹ́rìnléláàádọ́rin', 75: 'Márùndínlọ́gọ́rin', 76: 'Mẹ́rìndínlọ́gọ́rin',
  77: 'Mẹ́tàdínlọ́gọ́rin', 78: 'Méjìdínlọ́gọ́rin', 79: 'Mọ́kàndínlọ́gọ́rin',
  80: 'Ọgọ́rin', 81: 'Mọ́kànlélọ́gọ́rin', 82: 'Méjìlélọ́gọ́rin',
  83: 'Mẹ́tàlélọ́gọ́rin', 84: 'Mẹ́rìnlélọ́gọ́rin', 85: 'Márùndínláàádọ́rùn',
  86: 'Mẹ́rìndínláàádọ́rùn', 87: 'Mẹ́tàdínláàádọ́rùn', 88: 'Méjìdínláàádọ́rùn',
  89: 'Mọ́kàndínláàádọ́rùn', 90: 'Àádọ́rùn', 91: 'Mọ́kànléláàádọ́rùn',
  92: 'Méjìléláàádọ́rùn', 93: 'Mẹ́tàléláàádọ́rùn', 94: 'Mẹ́rìnléláàádọ́rùn',
  95: 'Márùndínlọ́gọ́rùn', 96: 'Mẹ́rìndínlọ́gọ́rùn', 97: 'Mẹ́tàdínlọ́gọ́rùn',
  98: 'Méjìdínlọ́gọ́rùn', 99: 'Mọ́kàndínlọ́gọ́rùn',
};

const SCALE_WORDS = [
  { value: 1e12, word: 'Tirílíọ̀nù' },
  { value: 1e9, word: 'Bílíọ̀nù' },
  { value: 1e6, word: 'Mílíọ̀nù' },
  { value: 1e3, word: 'Ẹgbẹ̀rún' },
];

const CLASSICAL_EXACT = { 2000: 'Ẹgbàá', 4000: 'Ẹgbàájì' };
const OKE = { value: 20000, word: 'Ọkẹ́' };

const PARTICLES = {
  addJoin: 'ó lé',
  subtractJoin: 'ó dín',
  modernJoin: 'àti',
  decimalMark: 'ààmì',
  negative: 'Òdì',
  one: 'kan',
};

const OPERATOR_WORDS = {
  '+': 'pẹ̀lú', '−': 'yọ', '-': 'yọ', '×': 'ìgbà', '*': 'ìgbà',
  '÷': 'pín sí', '/': 'pín sí', '=': 'dọ́gba',
};

// Deficits this small read as "short of the next hundred" (ó dín) rather than
// "over the current one" (ó lé): 595 = Ẹgbẹ̀ta ó dín Márùn-ún.
// REVIEW: the exact cut-over point is dialect-variable; 1–10 is conservative.
const O_DIN_MAX_DEFICIT = 10;

function lowerFirst(word) {
  return word.charAt(0).toLocaleLowerCase('yo-NG') + word.slice(1);
}

function modernUnder100(n) {
  if (n <= 10) return BASE_0_10[n];
  if (n <= 14) return TRADITIONAL_0_99[n];
  if (n in TENS_BASE) return TENS_BASE[n];
  const tens = Math.floor(n / 10) * 10;
  const units = n % 10;
  const tensWord = tens === 10 ? BASE_0_10[10] : TENS_BASE[tens];
  if (units === 0) return tensWord;
  return `${tensWord} ${PARTICLES.modernJoin} ${BASE_0_10[units]}`;
}

function hundredsGroup(n, mode) {
  const hundredCount = Math.floor(n / 100);
  const remainder = n % 100;

  if (mode === 'traditional') {
    const deficit = (hundredCount + 1) * 100 - n;
    if (remainder !== 0 && deficit <= O_DIN_MAX_DEFICIT) {
      const nextBase = HUNDREDS_BASE[(hundredCount + 1) * 100];
      return `${nextBase} ${PARTICLES.subtractJoin} ${TRADITIONAL_0_99[deficit]}`;
    }
    const base = HUNDREDS_BASE[hundredCount * 100];
    if (remainder === 0) return base;
    return `${base} ${PARTICLES.addJoin} ${TRADITIONAL_0_99[remainder]}`;
  }

  const hundredWord =
    hundredCount === 1
      ? TENS_BASE[100]
      : `${TENS_BASE[100]} ${asMultiplier(hundredCount, 'modern')}`;
  if (remainder === 0) return hundredWord;
  return `${hundredWord} ${PARTICLES.modernJoin} ${modernUnder100(remainder)}`;
}

function asMultiplier(n, mode) {
  if (n === 1) return PARTICLES.one;
  return lowerFirst(integerToWords(n, mode));
}

function integerToWords(n, mode) {
  if (n < 1000) {
    if (n === 0) return BASE_0_10[0];
    if (n < 100) return mode === 'traditional' ? TRADITIONAL_0_99[n] : modernUnder100(n);
    return hundredsGroup(n, mode);
  }
  const scale = SCALE_WORDS.find((s) => n >= s.value);
  const count = Math.floor(n / scale.value);
  const remainder = n % scale.value;
  const head = `${scale.word} ${asMultiplier(count, mode)}`;
  if (remainder === 0) return head;
  const join = mode === 'traditional' ? PARTICLES.addJoin : PARTICLES.modernJoin;
  return `${head} ${join} ${integerToWords(remainder, mode)}`;
}

// Classical vigesimal names apply only to a whole traditional value:
// 2,000 = Ẹgbàá; exact "bags" Ọkẹ́ kan (20,000) … Ọkẹ́ mọ́kàndínlógún.
function wholeToWords(n, mode) {
  if (mode === 'traditional') {
    if (n in CLASSICAL_EXACT) return CLASSICAL_EXACT[n];
    if (n % OKE.value === 0) {
      const count = n / OKE.value;
      if (count >= 1 && count < 20) return `${OKE.word} ${asMultiplier(count, 'traditional')}`;
    }
  }
  return integerToWords(n, mode);
}

const DIGIT_WORDS = {
  '0': BASE_0_10[0], '1': BASE_0_10[1], '2': BASE_0_10[2], '3': BASE_0_10[3],
  '4': BASE_0_10[4], '5': BASE_0_10[5], '6': BASE_0_10[6], '7': BASE_0_10[7],
  '8': BASE_0_10[8], '9': BASE_0_10[9],
};

/** Convert any finite number to Yoruba words in the requested mode. */
export function toYoruba(n, mode = 'traditional') {
  if (!Number.isFinite(n)) return '—';
  if (n < 0) return `${PARTICLES.negative} ${toYoruba(Math.abs(n), mode)}`;
  if (Number.isInteger(n) && n < 1e15) return wholeToWords(n, mode);
  return numericInputToYoruba(formatNumber(n), mode);
}

/** Render a typed numeric string: full names for integers, "ààmì" decimals. */
export function numericInputToYoruba(value, mode = 'traditional') {
  const normalized = value.trim().replace(/[,_\s]/g, '');
  if (!/^[+\-−]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return '';

  const sign = /^[-−]/.test(normalized) ? `${PARTICLES.negative} ` : '';
  const unsigned = normalized.replace(/^[+\-−]/, '');

  if (unsigned.includes('.')) {
    const [wholeRaw, fractionRaw = ''] = unsigned.split('.');
    const wholeWords = integerStringToYoruba(wholeRaw || '0', mode);
    const fractionWords = fractionRaw
      .split('')
      .map((d) => DIGIT_WORDS[d])
      .filter(Boolean)
      .join(' ');
    const mark = PARTICLES.decimalMark;
    return `${sign}${wholeWords}${fractionWords ? ` ${mark} ${fractionWords}` : ` ${mark}`}`.trim();
  }

  // Leading-zero values stay digit strings: 007 is not the written form of 7.
  if (/^0\d+/.test(unsigned)) {
    return `${sign}${unsigned.split('').map((d) => DIGIT_WORDS[d]).join(' ')}`.trim();
  }
  return `${sign}${integerStringToYoruba(unsigned, mode)}`.trim();
}

function integerStringToYoruba(digits, mode) {
  const value = Number(digits);
  if (Number.isSafeInteger(value)) return wholeToWords(value, mode);
  // Beyond exact float range: read digit by digit so precision is never invented.
  return digits.split('').map((d) => DIGIT_WORDS[d]).join(' ');
}

export function operatorWord(symbol) {
  return OPERATOR_WORDS[symbol] ?? symbol;
}

/** Build the Yoruba phrase for an expression string like "2+2". */
export function expressionToYoruba(expr, mode = 'traditional') {
  if (!expr) return '';
  const tokens = expr.replace(/\s+/g, '').split(/([+−×÷])/).filter(Boolean);
  // A leading "−" is a sign, not the operator "yọ".
  if (tokens[0] === '−' && tokens.length > 1) {
    tokens.splice(0, 2, `−${tokens[1]}`);
  }
  return tokens
    .map((t) => (/^[−]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(t) ? numericInputToYoruba(t, mode) : operatorWord(t)))
    .join(' ');
}

/** Yoruba word for a tapped key, shown small beneath the numeral. */
export function digitWord(key) {
  if (key === '.') return PARTICLES.decimalMark;
  return DIGIT_WORDS[key] ?? '';
}

// ---------------------------------------------------------------------------
// Calculator engine (ported from src/lib/calculator.ts)
// ---------------------------------------------------------------------------

const OPERATORS = new Set(['+', '−', '×', '÷']);
const PRECEDENCE = { '+': 1, '−': 1, '×': 2, '÷': 2 };
const MAX_OPERAND_DIGITS = 15;

const initialCalcState = { expression: '', lastResult: null, error: null };

function lastOperatorIndex(expr) {
  for (let i = expr.length - 1; i >= 0; i--) {
    if (OPERATORS.has(expr[i])) return i;
  }
  return -1;
}

export function formatNumber(n) {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (Number.isInteger(n) && abs <= Number.MAX_SAFE_INTEGER) return String(n);
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-6)) {
    const [m, e] = n.toExponential(6).split('e');
    const mantissa = m.includes('.') ? m.replace(/0+$/, '').replace(/\.$/, '') : m;
    return `${mantissa}e${e.replace('+', '')}`;
  }
  return parseFloat(n.toFixed(6)).toString();
}

export function evaluate(expr) {
  let cleaned = expr;
  while (cleaned.length && OPERATORS.has(cleaned[cleaned.length - 1])) {
    cleaned = cleaned.slice(0, -1);
  }
  if (!cleaned) return { value: 0, error: null };

  try {
    const tokens = [];
    let buf = '';
    for (const c of cleaned) {
      if (/[0-9.]/.test(c)) {
        buf += c;
      } else if (OPERATORS.has(c)) {
        if (c === '−' && buf === '' && (tokens.length === 0 || tokens[tokens.length - 1].kind === 'op')) {
          buf = '-';
          continue;
        }
        if (buf) {
          tokens.push({ kind: 'num', value: Number(buf) });
          buf = '';
        }
        tokens.push({ kind: 'op', value: c });
      } else {
        throw new Error('Àṣìṣe');
      }
    }
    if (buf) tokens.push({ kind: 'num', value: Number(buf) });

    // Shunting-yard to RPN, then evaluate.
    const out = [];
    const ops = [];
    for (const t of tokens) {
      if (t.kind === 'num') {
        out.push(t);
      } else {
        while (ops.length && PRECEDENCE[ops[ops.length - 1].value] >= PRECEDENCE[t.value]) {
          out.push(ops.pop());
        }
        ops.push(t);
      }
    }
    while (ops.length) out.push(ops.pop());

    const stack = [];
    for (const t of out) {
      if (t.kind === 'num') {
        stack.push(t.value);
        continue;
      }
      const b = stack.pop();
      const a = stack.pop();
      if (t.value === '+') stack.push(a + b);
      else if (t.value === '−') stack.push(a - b);
      else if (t.value === '×') stack.push(a * b);
      else if (t.value === '÷') {
        if (b === 0) throw new Error('Pípín pẹ̀lú òdo');
        stack.push(a / b);
      }
    }
    const value = stack[0] ?? 0;
    if (!Number.isFinite(value)) {
      return { value: null, error: Number.isNaN(value) ? 'Àṣìṣe' : 'Tóbi jù' };
    }
    return { value, error: null };
  } catch (err) {
    return { value: null, error: err.message };
  }
}

export function applyKey(state, key) {
  const base = { ...state, error: null };

  if (key === 'C') return { ...initialCalcState };

  if (key === '⌫') {
    if (!base.expression) return base;
    return { ...base, expression: base.expression.slice(0, -1) };
  }

  if (key === '=') {
    const result = evaluate(base.expression);
    if (result.error) return { ...base, error: result.error };
    return { expression: formatNumber(result.value), lastResult: result.value, error: null };
  }

  if (/^[0-9.]$/.test(key)) {
    if (key === '.') {
      const operand = base.expression.slice(lastOperatorIndex(base.expression) + 1);
      if (operand.includes('.')) return base;
      if (operand.length === 0) return { ...base, expression: base.expression + '0.' };
    }
    // Typing after "=" starts a fresh number instead of appending to the result.
    if (base.lastResult !== null && base.expression === formatNumber(base.lastResult)) {
      return { ...base, expression: key, lastResult: null };
    }
    if (/^[0-9]$/.test(key)) {
      const operand = base.expression.slice(lastOperatorIndex(base.expression) + 1);
      if ((operand.match(/\d/g) ?? []).length >= MAX_OPERAND_DIGITS) return base;
    }
    return { ...base, expression: base.expression + key };
  }

  if (OPERATORS.has(key)) {
    if (base.expression === '') {
      return key === '−' ? { ...base, expression: '−' } : base;
    }
    const lastChar = base.expression[base.expression.length - 1];
    if (OPERATORS.has(lastChar)) {
      return { ...base, expression: base.expression.slice(0, -1) + key };
    }
    return { ...base, expression: base.expression + key };
  }

  return base;
}

// ---------------------------------------------------------------------------
// Theme (README §1.4 design direction)
// ---------------------------------------------------------------------------

const LIGHT = {
  bg: '#FAF7F0',
  surface: '#FFFFFF',
  surfaceAlt: '#F1EAE0',
  text: '#3D2417',
  textSoft: 'rgba(61, 36, 23, 0.55)',
  accent: '#7A9E7E',
  accentText: '#FFFFFF',
  border: 'rgba(61, 36, 23, 0.12)',
  pattern: '#3D2417',
};

const DARK = {
  bg: '#2A1A10',
  surface: '#3D2417',
  surfaceAlt: '#4A2F1F',
  text: '#F5EBDF',
  textSoft: 'rgba(245, 235, 223, 0.55)',
  accent: '#7A9E7E',
  accentText: '#1F2B20',
  border: 'rgba(245, 235, 223, 0.14)',
  pattern: '#F5EBDF',
};

// Subtle adire/aso-oke-inspired motif tiled behind the app at low opacity.
function patternDataUri(color) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'>
    <g fill='none' stroke='${color}' stroke-width='1' opacity='0.05'>
      <circle cx='12' cy='12' r='5'/><circle cx='36' cy='36' r='5'/>
      <path d='M30 6l12 12M30 18L42 6'/><path d='M6 30l12 12M6 42L18 30'/>
      <circle cx='12' cy='12' r='1.5' fill='${color}'/>
      <circle cx='36' cy='36' r='1.5' fill='${color}'/>
    </g>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// ---------------------------------------------------------------------------
// UI components
// ---------------------------------------------------------------------------

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Avenir Next', 'Segoe UI', 'Helvetica Neue', system-ui, sans-serif";

function ModeToggle({ mode, onChange, theme }) {
  const options = [
    { id: 'traditional', label: 'Ìbílẹ̀', hint: 'Trad' },
    { id: 'modern', label: 'Òde òní', hint: 'Modern' },
  ];
  return (
    <div
      style={{
        display: 'flex', borderRadius: 999, padding: 3,
        background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
      }}
    >
      {options.map((opt) => {
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            title={opt.hint}
            style={{
              border: 'none', cursor: 'pointer', borderRadius: 999,
              padding: '5px 12px', fontSize: 12, fontWeight: 600, fontFamily: SANS,
              background: active ? theme.accent : 'transparent',
              color: active ? theme.accentText : theme.textSoft,
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Display({ state, mode, theme }) {
  const { expression, lastResult, error } = state;
  const showingResult = lastResult !== null && expression === formatNumber(lastResult);
  const yorubaExpr = expressionToYoruba(expression, mode);
  const resultYoruba =
    lastResult !== null ? numericInputToYoruba(formatNumber(lastResult), mode) : '';

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        minHeight: 168, padding: '20px 22px 16px', gap: 6,
      }}
    >
      {!showingResult && (
        <>
          <div style={{ fontFamily: SANS, fontSize: 18, color: theme.textSoft, minHeight: 24, wordBreak: 'break-all' }}>
            {expression || '0'}
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.35, color: theme.text, minHeight: 30 }}>
            {yorubaExpr || BASE_0_10[0]}
          </div>
        </>
      )}
      {error && (
        <div style={{ fontFamily: SERIF, fontSize: 26, color: '#B0563B', fontWeight: 600 }}>{error}</div>
      )}
      {showingResult && !error && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          {/* Result hierarchy inverted: Yoruba words primary, Arabic secondary. */}
          <div
            style={{
              fontFamily: SERIF, fontWeight: 700, color: theme.text, flex: 1,
              fontSize: resultYoruba.length > 28 ? 26 : 36, lineHeight: 1.25,
            }}
          >
            {resultYoruba}
          </div>
          <div
            style={{
              fontFamily: SANS, fontSize: 15, color: theme.accent, fontWeight: 600,
              padding: '2px 10px', borderRadius: 8, border: `1px solid ${theme.accent}`,
              whiteSpace: 'nowrap',
            }}
          >
            {formatNumber(lastResult)}
          </div>
        </div>
      )}
    </div>
  );
}

function Key({ label, sub, onPress, theme, variant = 'digit', style }) {
  const palette = {
    digit: { background: theme.surface, color: theme.text },
    op: { background: theme.surfaceAlt, color: theme.accent },
    action: { background: theme.surfaceAlt, color: theme.textSoft },
    equals: { background: theme.accent, color: theme.accentText },
  }[variant];

  return (
    <button
      onClick={onPress}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2, border: `1px solid ${theme.border}`, borderRadius: 16, cursor: 'pointer',
        minHeight: 58, padding: '8px 4px', fontFamily: SANS,
        transition: 'transform 0.06s', userSelect: 'none',
        ...palette, ...style,
      }}
      onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
      onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <span style={{ fontSize: 22, fontWeight: 600, lineHeight: 1 }}>{label}</span>
      {sub && (
        <span style={{ fontSize: 10, fontFamily: SERIF, opacity: 0.7, lineHeight: 1.1, textAlign: 'center' }}>
          {sub}
        </span>
      )}
    </button>
  );
}

function Keypad({ onKey, theme }) {
  const digit = (d) => <Key key={d} label={d} sub={digitWord(d)} onPress={() => onKey(d)} theme={theme} />;
  const op = (symbol) => (
    <Key key={symbol} label={symbol} sub={operatorWord(symbol)} onPress={() => onKey(symbol)} theme={theme} variant="op" />
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '0 16px 12px' }}>
      <Key label="C" sub="pa rẹ́" onPress={() => onKey('C')} theme={theme} variant="action" />
      <Key label="⌫" sub="yọ kan" onPress={() => onKey('⌫')} theme={theme} variant="action" />
      {op('÷')}
      {op('×')}
      {digit('7')}{digit('8')}{digit('9')}{op('−')}
      {digit('4')}{digit('5')}{digit('6')}{op('+')}
      {digit('1')}{digit('2')}{digit('3')}
      <Key
        label="="
        sub={operatorWord('=')}
        onPress={() => onKey('=')}
        theme={theme}
        variant="equals"
        style={{ gridRow: 'span 2' }}
      />
      <Key label="0" sub={digitWord('0')} onPress={() => onKey('0')} theme={theme} style={{ gridColumn: 'span 2' }} />
      <Key label="." sub={digitWord('.')} onPress={() => onKey('.')} theme={theme} />
    </div>
  );
}

function HistoryView({ history, mode, onClear, onRecall, theme }) {
  if (history.length === 0) {
    return (
      <EmptyState theme={theme} title="Kò sí ìṣirò síbẹ̀" body="No calculations yet — results you compute will appear here." />
    );
  }
  return (
    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: SERIF, fontSize: 15, color: theme.textSoft }}>Ìtàn ìṣirò · History</span>
        <button
          onClick={onClear}
          style={{
            border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSoft,
            borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: SANS,
          }}
        >
          Pa gbogbo rẹ́
        </button>
      </div>
      {history.map((entry) => (
        <button
          key={entry.id}
          onClick={() => onRecall(entry)}
          style={{
            textAlign: 'left', border: `1px solid ${theme.border}`, borderRadius: 14,
            background: theme.surface, padding: '10px 14px', cursor: 'pointer',
          }}
        >
          <div style={{ fontFamily: SANS, fontSize: 13, color: theme.textSoft }}>
            {entry.expression} = {entry.result}
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 16, color: theme.text, marginTop: 2 }}>
            {numericInputToYoruba(entry.result, mode)}
          </div>
        </button>
      ))}
    </div>
  );
}

function ConverterView({ mode, theme }) {
  const [input, setInput] = useState('');
  const trimmed = input.trim();
  const valid = /^[+-]?(?:\d[\d,_\s]*(?:\.\d*)?|\.\d+)$/.test(trimmed);
  const yoruba = valid ? numericInputToYoruba(trimmed, mode) : '';
  const otherMode = mode === 'traditional' ? 'modern' : 'traditional';
  const otherYoruba = valid ? numericInputToYoruba(trimmed, otherMode) : '';

  return (
    <div style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
      <label style={{ fontFamily: SERIF, fontSize: 15, color: theme.textSoft }}>
        Oníyípadà nọ́mbà · Number converter
      </label>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        inputMode="decimal"
        placeholder="Tẹ nọ́mbà kan… e.g. 1975"
        style={{
          fontFamily: SANS, fontSize: 24, padding: '12px 16px', borderRadius: 14,
          border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text,
          outline: 'none', width: '100%', boxSizing: 'border-box',
        }}
      />
      {trimmed && !valid && (
        <div style={{ fontFamily: SANS, fontSize: 13, color: '#B0563B' }}>
          Nọ́mbà nìkan — enter digits only.
        </div>
      )}
      {valid && (
        <>
          <ResultCard
            theme={theme}
            label={mode === 'traditional' ? 'Ìbílẹ̀ · Traditional' : 'Òde òní · Modern'}
            word={yoruba}
            primary
          />
          <ResultCard
            theme={theme}
            label={otherMode === 'traditional' ? 'Ìbílẹ̀ · Traditional' : 'Òde òní · Modern'}
            word={otherYoruba}
          />
        </>
      )}
    </div>
  );
}

function ResultCard({ label, word, primary, theme }) {
  return (
    <div
      style={{
        borderRadius: 16, padding: '14px 16px',
        background: primary ? theme.surface : 'transparent',
        border: `1px solid ${primary ? theme.accent : theme.border}`,
      }}
    >
      <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: primary ? theme.accent : theme.textSoft }}>
        {label}
      </div>
      <div style={{ fontFamily: SERIF, fontSize: primary ? 26 : 18, fontWeight: primary ? 700 : 400, color: theme.text, marginTop: 6, lineHeight: 1.3 }}>
        {word}
      </div>
    </div>
  );
}

// Learn mode: 0–20 flashcards plus a four-choice quiz (README feature 9).
function LearnView({ mode, theme }) {
  const [card, setCard] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const newQuiz = () => {
    const answer = Math.floor(Math.random() * 21);
    const choices = new Set([answer]);
    while (choices.size < 4) choices.add(Math.floor(Math.random() * 21));
    setQuiz({ answer, choices: [...choices].sort(() => Math.random() - 0.5) });
    setPicked(null);
  };

  return (
    <div style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
      <div style={{ fontFamily: SERIF, fontSize: 15, color: theme.textSoft }}>Kọ́ ẹ̀kọ́ · Learn 0–20</div>

      <button
        onClick={() => setRevealed((r) => !r)}
        style={{
          border: `1px solid ${theme.border}`, borderRadius: 20, background: theme.surface,
          padding: '28px 16px', cursor: 'pointer', textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: SANS, fontSize: 52, fontWeight: 700, color: theme.text }}>{card}</div>
        <div style={{ fontFamily: SERIF, fontSize: 24, color: revealed ? theme.accent : theme.textSoft, marginTop: 8, minHeight: 32 }}>
          {revealed ? toYoruba(card, mode) : 'Tẹ láti fi hàn · tap to reveal'}
        </div>
      </button>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <NavButton theme={theme} disabled={card === 0} onPress={() => { setCard((c) => Math.max(0, c - 1)); setRevealed(false); }}>
          ← Sẹ́yìn
        </NavButton>
        <NavButton theme={theme} disabled={card === 20} onPress={() => { setCard((c) => Math.min(20, c + 1)); setRevealed(false); }}>
          Síwájú →
        </NavButton>
      </div>

      <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: SERIF, fontSize: 15, color: theme.textSoft }}>Ìdánwò · Quiz</span>
          {score.total > 0 && (
            <span style={{ fontFamily: SANS, fontSize: 13, color: theme.accent, fontWeight: 600 }}>
              {score.right}/{score.total}
            </span>
          )}
        </div>
        {!quiz ? (
          <NavButton theme={theme} accent onPress={newQuiz}>Bẹ̀rẹ̀ ìdánwò · Start quiz</NavButton>
        ) : (
          <>
            <div style={{ fontFamily: SERIF, fontSize: 22, color: theme.text, textAlign: 'center' }}>
              {toYoruba(quiz.answer, mode)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {quiz.choices.map((choice) => {
                const isAnswer = choice === quiz.answer;
                const isPicked = picked === choice;
                let background = theme.surface;
                if (picked !== null && isAnswer) background = theme.accent;
                else if (isPicked && !isAnswer) background = '#B0563B';
                return (
                  <button
                    key={choice}
                    disabled={picked !== null}
                    onClick={() => {
                      setPicked(choice);
                      setScore((s) => ({ right: s.right + (isAnswer ? 1 : 0), total: s.total + 1 }));
                    }}
                    style={{
                      border: `1px solid ${theme.border}`, borderRadius: 12, padding: '14px 8px',
                      fontFamily: SANS, fontSize: 24, fontWeight: 600, cursor: picked === null ? 'pointer' : 'default',
                      background,
                      color: picked !== null && (isAnswer || isPicked) ? '#FFFFFF' : theme.text,
                      transition: 'background 0.2s',
                    }}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <NavButton theme={theme} accent onPress={newQuiz}>Òmíràn · Next</NavButton>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NavButton({ children, onPress, disabled, accent, theme }) {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      style={{
        border: `1px solid ${accent ? theme.accent : theme.border}`, borderRadius: 12,
        background: accent ? theme.accent : theme.surface,
        color: accent ? theme.accentText : theme.text,
        fontFamily: SANS, fontSize: 14, fontWeight: 600, padding: '10px 18px',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, body, theme }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontFamily: SERIF, fontSize: 20, color: theme.text }}>{title}</div>
      <div style={{ fontFamily: SANS, fontSize: 13, color: theme.textSoft }}>{body}</div>
    </div>
  );
}

const TABS = [
  { id: 'calc', label: 'Ìṣirò', hint: 'Calculator', icon: '＋' },
  { id: 'history', label: 'Ìtàn', hint: 'History', icon: '⏱' },
  { id: 'convert', label: 'Yípadà', hint: 'Converter', icon: '⇄' },
  { id: 'learn', label: 'Kọ́', hint: 'Learn', icon: '✦' },
];

export default function App() {
  const [dark, setDark] = useState(false);
  const [mode, setMode] = useState('traditional');
  const [tab, setTab] = useState('calc');
  const [calc, setCalc] = useState(initialCalcState);
  const [history, setHistory] = useState([]);

  // Persist preferences and history across sessions where storage exists.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kaa-state') ?? '{}');
      if (saved.mode === 'traditional' || saved.mode === 'modern') setMode(saved.mode);
      if (typeof saved.dark === 'boolean') setDark(saved.dark);
      if (Array.isArray(saved.history)) setHistory(saved.history.slice(0, 50));
    } catch {
      /* first run or storage unavailable */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('kaa-state', JSON.stringify({ mode, dark, history }));
    } catch {
      /* storage unavailable */
    }
  }, [mode, dark, history]);

  const theme = dark ? DARK : LIGHT;
  const pattern = useMemo(() => patternDataUri(theme.pattern), [theme.pattern]);

  const handleKey = (key) => {
    setCalc((prev) => {
      const next = applyKey(prev, key);
      if (key === '=' && !next.error && next.lastResult !== null && prev.expression && /[+−×÷]/.test(prev.expression.replace(/^−/, ''))) {
        setHistory((h) => [
          { id: Date.now(), expression: prev.expression, result: formatNumber(next.lastResult) },
          ...h,
        ].slice(0, 50));
      }
      return next;
    });
  };

  const recallEntry = (entry) => {
    setCalc({ expression: entry.result, lastResult: Number(entry.result), error: null });
    setTab('calc');
  };

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'stretch',
        background: theme.bg, backgroundImage: pattern, transition: 'background 0.3s',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column',
          minHeight: '100vh', color: theme.text,
        }}
      >
        {/* Top bar: wordmark + counting-mode toggle + theme toggle */}
        <header
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 18px 10px', gap: 10,
          }}
        >
          <h1 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: 0.5 }}>
            Kàá
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ModeToggle mode={mode} onChange={setMode} theme={theme} />
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle dark mode"
              style={{
                border: `1px solid ${theme.border}`, background: theme.surfaceAlt, color: theme.text,
                borderRadius: 999, width: 32, height: 32, cursor: 'pointer', fontSize: 14,
              }}
            >
              {dark ? '☀' : '☾'}
            </button>
          </div>
        </header>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {tab === 'calc' && (
            <>
              <div style={{ flex: 1 }} />
              <Display state={calc} mode={mode} theme={theme} />
              <Keypad onKey={handleKey} theme={theme} />
            </>
          )}
          {tab === 'history' && (
            <HistoryView history={history} mode={mode} onClear={() => setHistory([])} onRecall={recallEntry} theme={theme} />
          )}
          {tab === 'convert' && <ConverterView mode={mode} theme={theme} />}
          {tab === 'learn' && <LearnView mode={mode} theme={theme} />}
        </main>

        {/* Tab bar: Calculator · History · Converter · Learn */}
        <nav
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
            padding: '8px 12px calc(10px + env(safe-area-inset-bottom, 0px))',
            borderTop: `1px solid ${theme.border}`, background: theme.surface,
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                title={t.hint}
                style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '6px 0', borderRadius: 10,
                  color: active ? theme.accent : theme.textSoft,
                }}
              >
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: active ? 700 : 500 }}>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
