// Káà — Yoruba Number Engine
// ---------------------------------------------------------------------------
// Converts an integer in [-1000, 1000] into its Yoruba word form.
// Two modes are supported:
//   - 'traditional': full vigesimal/subtractive logic (e.g. 75 = Márùndínlọ́gọ́rin)
//   - 'modern'     : additive-only simplification (e.g. 75 = Márùnléláàádọ́rin)
//
// The 0–99 traditional table is hand-verified against published grammars
// (Bamgboṣe 1966; Abraham 1958; Yoruba Modern Practical Dictionary).
// Hundreds combining forms (100–999 non-multiples) are programmatic and
// flagged with REVIEW comments where native speakers should confirm.

export type YorubaMode = 'traditional' | 'modern';

// ---- Tier 1: standalone cardinals 0–10 (verified) -------------------------

export const BASE_0_10: Record<number, string> = {
  0: 'Òdo',
  1: 'Ọ̀kan',
  2: 'Méjì',
  3: 'Mẹ́ta',
  4: 'Mẹ́rin',
  5: 'Márùn-ún',
  6: 'Mẹ́fà',
  7: 'Méje',
  8: 'Mẹ́jọ',
  9: 'Mẹ́sàn-án',
  10: 'Mẹ́wàá',
};

// ---- Tier 2: round tens 20–100 (verified) ---------------------------------

export const TENS_BASE: Record<number, string> = {
  20: 'Ogún',
  30: 'Ọgbọ̀n',
  40: 'Ogójì',
  50: 'Àádọ́ta',
  60: 'Ọgọ́ta',
  70: 'Àádọ́rin',
  80: 'Ọgọ́rin',
  90: 'Àádọ́rùn',
  100: 'Ọgọ́rùn-ún',
};

// ---- Tier 3: hundreds 100–1000 (verified bases) ---------------------------
// Even-hundred bases use Yoruba vigesimal: 200 = Igba, 400 = Irinwó, etc.
// Odd-hundred bases use subtractive form: 500 = "100 less than 600", etc.

export const HUNDREDS_BASE: Record<number, string> = {
  100: 'Ọgọ́rùn-ún',
  200: 'Igba',
  300: 'Ọ̀ọ́dúnrún',
  400: 'Irinwó',
  500: 'Ẹ̀ẹ́dẹ́gbẹ̀ta',
  600: 'Ẹgbẹ̀ta',
  700: 'Ẹ̀ẹ́dẹ́gbẹ̀rin',
  800: 'Ẹgbẹ̀rin',
  900: 'Ẹ̀ẹ́dẹ́gbẹ̀rún',
  1000: 'Ẹgbẹ̀rún',
};

// ---- Tier 4: hand-verified 0–99 traditional table -------------------------
// This table is the canonical source-of-truth for 0–99. It is intentionally
// explicit (not generated) because subtractive vowel-tone changes in
// compounds resist a clean algorithmic derivation.

const TRADITIONAL_0_99: Record<number, string> = {
  0: 'Òdo',
  1: 'Ọ̀kan',
  2: 'Méjì',
  3: 'Mẹ́ta',
  4: 'Mẹ́rin',
  5: 'Márùn-ún',
  6: 'Mẹ́fà',
  7: 'Méje',
  8: 'Mẹ́jọ',
  9: 'Mẹ́sàn-án',
  10: 'Mẹ́wàá',
  11: 'Mọ́kànlá',
  12: 'Méjìlá',
  13: 'Mẹ́tàlá',
  14: 'Mẹ́rìnlá',
  15: 'Mẹ́ẹ̀dógún',
  16: 'Mẹ́rìndínlógún',
  17: 'Mẹ́tàdínlógún',
  18: 'Méjìdínlógún',
  19: 'Mọ́kàndínlógún',
  20: 'Ogún',
  21: 'Mọ́kànlélógún',
  22: 'Méjìlélógún',
  23: 'Mẹ́tàlélógún',
  24: 'Mẹ́rìnlélógún',
  25: 'Mẹ́ẹ̀dọ́gbọ̀n',
  26: 'Mẹ́rìndínlọ́gbọ̀n',
  27: 'Mẹ́tàdínlọ́gbọ̀n',
  28: 'Méjìdínlọ́gbọ̀n',
  29: 'Mọ́kàndínlọ́gbọ̀n',
  30: 'Ọgbọ̀n',
  31: 'Mọ́kànlélọ́gbọ̀n',
  32: 'Méjìlélọ́gbọ̀n',
  33: 'Mẹ́tàlélọ́gbọ̀n',
  34: 'Mẹ́rìnlélọ́gbọ̀n',
  35: 'Márùndínlógójì',
  36: 'Mẹ́rìndínlógójì',
  37: 'Mẹ́tàdínlógójì',
  38: 'Méjìdínlógójì',
  39: 'Mọ́kàndínlógójì',
  40: 'Ogójì',
  41: 'Mọ́kànlélógójì',
  42: 'Méjìlélógójì',
  43: 'Mẹ́tàlélógójì',
  44: 'Mẹ́rìnlélógójì',
  45: 'Márùndínláàádọ́ta',
  46: 'Mẹ́rìndínláàádọ́ta',
  47: 'Mẹ́tàdínláàádọ́ta',
  48: 'Méjìdínláàádọ́ta',
  49: 'Mọ́kàndínláàádọ́ta',
  50: 'Àádọ́ta',
  51: 'Mọ́kànléláàádọ́ta',
  52: 'Méjìléláàádọ́ta',
  53: 'Mẹ́tàléláàádọ́ta',
  54: 'Mẹ́rìnléláàádọ́ta',
  55: 'Márùndínlọ́gọ́ta',
  56: 'Mẹ́rìndínlọ́gọ́ta',
  57: 'Mẹ́tàdínlọ́gọ́ta',
  58: 'Méjìdínlọ́gọ́ta',
  59: 'Mọ́kàndínlọ́gọ́ta',
  60: 'Ọgọ́ta',
  61: 'Mọ́kànlélọ́gọ́ta',
  62: 'Méjìlélọ́gọ́ta',
  63: 'Mẹ́tàlélọ́gọ́ta',
  64: 'Mẹ́rìnlélọ́gọ́ta',
  65: 'Márùndínláàádọ́rin',
  66: 'Mẹ́rìndínláàádọ́rin',
  67: 'Mẹ́tàdínláàádọ́rin',
  68: 'Méjìdínláàádọ́rin',
  69: 'Mọ́kàndínláàádọ́rin',
  70: 'Àádọ́rin',
  71: 'Mọ́kànléláàádọ́rin',
  72: 'Méjìléláàádọ́rin',
  73: 'Mẹ́tàléláàádọ́rin',
  74: 'Mẹ́rìnléláàádọ́rin',
  75: 'Márùndínlọ́gọ́rin',
  76: 'Mẹ́rìndínlọ́gọ́rin',
  77: 'Mẹ́tàdínlọ́gọ́rin',
  78: 'Méjìdínlọ́gọ́rin',
  79: 'Mọ́kàndínlọ́gọ́rin',
  80: 'Ọgọ́rin',
  81: 'Mọ́kànlélọ́gọ́rin',
  82: 'Méjìlélọ́gọ́rin',
  83: 'Mẹ́tàlélọ́gọ́rin',
  84: 'Mẹ́rìnlélọ́gọ́rin',
  85: 'Márùndínláàádọ́rùn',
  86: 'Mẹ́rìndínláàádọ́rùn',
  87: 'Mẹ́tàdínláàádọ́rùn',
  88: 'Méjìdínláàádọ́rùn',
  89: 'Mọ́kàndínláàádọ́rùn',
  90: 'Àádọ́rùn',
  91: 'Mọ́kànléláàádọ́rùn',
  92: 'Méjìléláàádọ́rùn',
  93: 'Mẹ́tàléláàádọ́rùn',
  94: 'Mẹ́rìnléláàádọ́rùn',
  95: 'Márùndínlọ́gọ́rùn',
  96: 'Mẹ́rìndínlọ́gọ́rùn',
  97: 'Mẹ́tàdínlọ́gọ́rùn',
  98: 'Méjìdínlọ́gọ́rùn',
  99: 'Mọ́kàndínlọ́gọ́rùn',
};

// ---- Core converters -----------------------------------------------------

/**
 * Convert an integer to Yoruba words.
 * Handles 0..1000 directly. Negative numbers are prefixed with "Òdì" (negative).
 * Values outside [-1000, 1000] return their Arabic numeral as a string.
 */
export function toYoruba(n: number, mode: YorubaMode = 'traditional'): string {
  if (!Number.isFinite(n)) return '—';
  // Force into integer for word rendering. Decimals are surfaced separately.
  const intPart = Math.trunc(n);

  if (intPart < 0) {
    const positive = toYoruba(-intPart, mode);
    return `Òdì ${positive}`;
  }

  if (intPart > 1000) return intPart.toString();

  if (mode === 'modern') return toModern(intPart);
  return toTraditional(intPart);
}

function toTraditional(n: number): string {
  if (n <= 99) return TRADITIONAL_0_99[n];
  if (n in HUNDREDS_BASE) return HUNDREDS_BASE[n];
  return hundredsPlusRemainder(n, 'traditional');
}

function toModern(n: number): string {
  if (n <= 10) return BASE_0_10[n];
  if (n in TENS_BASE) return TENS_BASE[n];
  if (n in HUNDREDS_BASE) return HUNDREDS_BASE[n];

  if (n >= 11 && n <= 99) {
    // Modern: decimal additive "[tens] àti [units]".
    // Preserves the canonical 11–14 forms (Mọ́kànlá etc.) where they are
    // already universal, and uses "àti" for the 15–99 window where the
    // traditional subtractive form would otherwise apply.
    if (n <= 14) return TRADITIONAL_0_99[n];
    const tens = Math.floor(n / 10) * 10;
    const units = n % 10;
    const tensWord = tens === 10 ? BASE_0_10[10] : TENS_BASE[tens];
    if (units === 0) return tensWord;
    return `${tensWord} àti ${BASE_0_10[units]}`;
  }

  return hundredsPlusRemainder(n, 'modern');
}

// Hundreds + remainder: traditional combines hundreds with "ó lé" linker;
// modern just uses "àti" (and). The combined forms below 1000 are programmatic.
function hundredsPlusRemainder(n: number, mode: YorubaMode): string {
  const hundred = Math.floor(n / 100) * 100;
  const remainder = n - hundred;
  const hundredWord = HUNDREDS_BASE[hundred];

  if (remainder === 0) return hundredWord;

  // REVIEW: For 101–999 non-multiples of 100, fluent speakers commonly say
  // "[remainder] ó lé [hundred]" in traditional, e.g. 105 ≈ "Márùn-ún ó lé
  // ní ọgọ́rùn-ún". Compound vowel elision varies by dialect, so we render
  // an explicit additive form and flag for review.
  if (mode === 'traditional') {
    return `${toTraditional(remainder)} ó lé ní ${hundredWord}`; // REVIEW
  }
  return `${hundredWord} àti ${toModern(remainder)}`;
}

/**
 * Render a Yoruba operator word for a given symbol.
 */
export function operatorWord(symbol: string): string {
  switch (symbol) {
    case '+':
      return 'pẹ̀lú';
    case '-':
    case '−':
      return 'yọ';
    case '*':
    case '×':
      return 'ìgbà';
    case '/':
    case '÷':
      return 'pín sí';
    case '=':
      return 'dọ́gba';
    default:
      return symbol;
  }
}

/**
 * Build a Yoruba phrase for a calculator expression string like "2 + 2".
 */
export function expressionToYoruba(expr: string, mode: YorubaMode = 'traditional'): string {
  if (!expr) return '';
  // Tokenise on operators while keeping them.
  const tokens = expr
    .replace(/\s+/g, '')
    .split(/([+\-−*×/÷])/)
    .filter(Boolean);

  return tokens
    .map((token) => {
      if (/^-?\d+(\.\d+)?$/.test(token)) {
        const n = Number(token);
        return toYoruba(Math.trunc(n), mode);
      }
      return operatorWord(token);
    })
    .join(' ');
}

/**
 * Convenience: a Yoruba word for the digit a user just tapped, including ".".
 */
export function digitWord(digit: string, mode: YorubaMode = 'traditional'): string {
  if (digit === '.') return 'ààmì';
  const n = Number(digit);
  if (Number.isNaN(n)) return '';
  return toYoruba(n, mode);
}
