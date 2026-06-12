// Kàá — Yoruba Number Engine
// ---------------------------------------------------------------------------
// Converts numbers into Yoruba word forms and can spell arbitrary digit strings.
// Two modes are supported:
//   - 'traditional': vigesimal/subtractive logic (e.g. 75 = Márùndínlọ́gọ́rin)
//   - 'modern'     : decimal additive simplification (e.g. 75 = Àádọ́rin àti Márùn-ún)
//
// All word tables live in shared/yoruba-language-pack.json (single source of
// truth for the web and iOS engines) and are imported via the generated
// yorubaTables.generated.ts. Composition rules follow
// docs/yoruba-number-logic.md:
//   * 0–99            : hand-verified table (subtractive tone changes resist
//                       clean generation, so the spellings live in a table).
//   * 100–999         : hundred base + remainder, joined base-first with "ó lé"
//                       — or "ó dín" (short of) when the value sits just under
//                       the next hundred (595 = Ẹgbẹ̀ta ó dín Márùn-ún, §11).
//   * classical units : exact traditional values keep their classical words —
//                       Ẹgbàá (2,000), Ẹgbàájì (4,000), Ọkẹ́ multiples (20,000n).
//   * 1,000 and above : grouped by scale words (Ẹgbẹ̀rún = 1e3, Mílíọ̀nù = 1e6,
//                       …, Dẹ́sílíọ̀nù = 1e33), each group joined with "ó lé"
//                       (traditional) or "àti" (modern).
//
// Only true digit strings (leading-zero codes, phone numbers, IDs, the
// fractional digits of a decimal, or values beyond Number.MAX_SAFE_INTEGER) fall
// back to digit-by-digit reading.

import {
  BASE_0_10,
  CLASSICAL_EXACT,
  HUNDREDS_BASE,
  OKE,
  OPERATOR_WORDS,
  ORDINALS_1_10,
  PARTICLES,
  SCALE_WORDS_BIG,
  TENS_BASE,
  TRADITIONAL_0_99,
} from './yorubaTables.generated';

export { BASE_0_10, TENS_BASE, HUNDREDS_BASE, TRADITIONAL_0_99 };

export type YorubaMode = 'traditional' | 'modern';

// Largest magnitude we name with scale words (one notch above a decillion).
// Beyond this, fall back to scientific notation so strings stay sane.
const MAX_NAMED = 10n ** 36n;

// Deficits this small read as "short of the next hundred" (ó dín) rather than
// "over the current one" (ó lé): 595 = Ẹgbẹ̀ta ó dín Márùn-ún (doc §11).
// REVIEW: the exact cut-over point is dialect-variable; 1–10 is conservative.
const O_DIN_MAX_DEFICIT = 10;

const DIGIT_WORDS: Record<string, string> = {
  '0': BASE_0_10[0],
  '1': BASE_0_10[1],
  '2': BASE_0_10[2],
  '3': BASE_0_10[3],
  '4': BASE_0_10[4],
  '5': BASE_0_10[5],
  '6': BASE_0_10[6],
  '7': BASE_0_10[7],
  '8': BASE_0_10[8],
  '9': BASE_0_10[9],
};

// ---- Core converters -----------------------------------------------------

/**
 * Convert a JavaScript number to Yoruba words.
 * Any finite safe integer is named in full Yorùbá (no upper table limit).
 * Decimals render the whole part as a name plus individually spoken fractional
 * digits. Values beyond Number.MAX_SAFE_INTEGER fall back to readable digit
 * spelling so precision is never silently invented. Negative numbers are
 * prefixed with "Òdì" (negative).
 */
export function toYoruba(n: number, mode: YorubaMode = 'traditional'): string {
  if (!Number.isFinite(n)) return '—';
  if (!Number.isInteger(n)) return numericInputToYoruba(n.toString(), mode);

  if (n < 0) {
    const positive = toYoruba(Math.abs(n), mode);
    return `${PARTICLES.negative} ${positive}`;
  }

  // Name with scale words (million → decillion) using exact BigInt arithmetic.
  // Exact integers convert directly; a value beyond the exact range is a rounded
  // float, so we keep 15 significant figures (calculator precision) and zero the
  // unreliable tail — empty place-value groups then vanish, giving a clean name
  // instead of an "Òdo Òdo …" run. Only astronomical values use scientific form.
  const big = Number.isSafeInteger(n) ? BigInt(n) : roundedBigInt(n, 15);
  if (big < MAX_NAMED) return wholeToWords(big, mode);
  return scientificToYoruba(n, mode);
}

/**
 * Whole-number entry point: classical units apply only to the value as a
 * whole (2,000 = Ẹgbàá; 20,000 = Ọkẹ́ kan), never inside compounds, where
 * mixing classical and scale words is unattested.
 */
function wholeToWords(n: bigint, mode: YorubaMode): string {
  if (mode === 'traditional') {
    const classical = classicalName(n);
    if (classical) return classical;
  }
  return bigToWords(n, mode);
}

/** Classical vigesimal name for an exact traditional value, or null. */
function classicalName(n: bigint): string | null {
  const small = Number(n < 10n ** 15n ? n : 0n);
  if (small in CLASSICAL_EXACT) return CLASSICAL_EXACT[small];
  // Exact "bags": Ọkẹ́ kan (20,000), Ọkẹ́ méjì (40,000), … REVIEW: capped at
  // 19 bags so values like 1,000,000 keep the modern Mílíọ̀nù reading rather
  // than the cowrie-era "àádọ́ta ọkẹ́"; the cut-over is a product choice.
  if (n % OKE.value === 0n) {
    const count = n / OKE.value;
    if (count >= 1n && count < 20n) {
      return `${OKE.word} ${asMultiplierBig(count, 'traditional')}`;
    }
  }
  return null;
}

/** Round a large positive float to `sig` significant figures as an exact BigInt. */
function roundedBigInt(n: number, sig: number): bigint {
  const [mantissa, expStr] = n.toExponential(sig - 1).split('e');
  const exp = parseInt(expStr, 10);
  const digits = mantissa.replace('.', '');
  const scale = exp - (sig - 1);
  return scale >= 0
    ? BigInt(digits) * 10n ** BigInt(scale)
    : BigInt(digits) / 10n ** BigInt(-scale);
}

/**
 * Render a value too large (or small) to name exactly as Yorùbá scientific
 * notation: "[mantissa] ìgbà mẹ́wàá ní ọ̀nà [exponent]" — literally
 * "mantissa times ten to the power exponent".
 */
function scientificToYoruba(n: number, mode: YorubaMode): string {
  const [mantissaRaw, expRaw] = n.toExponential(6).split('e');
  const mantissa = mantissaRaw.includes('.')
    ? mantissaRaw.replace(/0+$/, '').replace(/\.$/, '')
    : mantissaRaw;
  const exp = Number(expRaw);
  const mantissaWords = numericInputToYoruba(mantissa, mode);
  const expWords = toYoruba(Math.abs(exp), mode);
  const expPhrase = exp < 0 ? `${PARTICLES.negative} ${expWords}` : expWords;
  return `${mantissaWords} ${PARTICLES.powerOfTenPhrase} ${expPhrase}`;
}

/**
 * The generative heart of the engine: render a non-negative BigInt.
 * 0–999 use the verified tables; 1,000 and up peel off the largest scale word
 * (Ẹgbẹ̀rún … Dẹ́sílíọ̀nù) and recurse on the remainder. Empty groups vanish, so
 * 1,000,000,000 reads "Bílíọ̀nù kan" — never a string of zeros.
 */
function bigToWords(n: bigint, mode: YorubaMode): string {
  if (n < 1000n) {
    const k = Number(n);
    if (k === 0) return BASE_0_10[0];
    if (k < 100) return mode === 'traditional' ? TRADITIONAL_0_99[k] : modernUnder100(k);
    return hundredsGroup(k, mode);
  }

  const scale = SCALE_WORDS_BIG.find((s) => n >= s.value)!;
  const count = n / scale.value;
  const remainder = n % scale.value;
  const head = `${scale.word} ${asMultiplierBig(count, mode)}`;
  if (remainder === 0n) return head;
  // Traditional keeps the vigesimal additive particle "ó lé"; modern joins
  // place-value groups with the decimal "àti".
  const join = mode === 'traditional' ? PARTICLES.addJoin : PARTICLES.modernJoin;
  return `${head} ${join} ${bigToWords(remainder, mode)}`;
}

/** Multiplier after a BigInt scale word: "kan" for 1, else lower-cased name. */
function asMultiplierBig(n: bigint, mode: YorubaMode): string {
  if (n === 1n) return PARTICLES.one;
  const word = bigToWords(n, mode);
  return word.charAt(0).toLocaleLowerCase('yo-NG') + word.slice(1);
}

/**
 * Render a value 100–999 as "hundred-base ± remainder".
 * Traditional: base first, linked with "ó lé" — or, when the value falls just
 * short of the next hundred, the next base with "ó dín" (595 = Ẹgbẹ̀ta ó dín
 * Márùn-ún). Modern: "Ọgọ́rùn-ún [×n] àti [remainder]".
 */
function hundredsGroup(n: number, mode: YorubaMode): string {
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

/**
 * Modern decimal-additive form for 0–99: "[tens] àti [units]".
 * Keeps the canonical 0–14 forms; uses "àti" for 15–99 where the traditional
 * subtractive construction would otherwise apply.
 */
function modernUnder100(n: number): string {
  if (n <= 10) return BASE_0_10[n];
  if (n <= 14) return TRADITIONAL_0_99[n];
  if (n in TENS_BASE) return TENS_BASE[n];

  const tens = Math.floor(n / 10) * 10;
  const units = n % 10;
  const tensWord = tens === 10 ? BASE_0_10[10] : TENS_BASE[tens];
  if (units === 0) return tensWord;
  return `${tensWord} ${PARTICLES.modernJoin} ${BASE_0_10[units]}`;
}

/** Multiplier after a hundred word (small counts), via the BigInt path. */
function asMultiplier(n: number, mode: YorubaMode): string {
  return asMultiplierBig(BigInt(n), mode);
}

// ---- Ordinals, money -------------------------------------------------------

/**
 * Ordinal name (doc §13): verified table for 1st–10th; larger ordinals use the
 * positional fallback "Ipò [cardinal]" ("position n").
 * REVIEW: 5th–9th follow the regular ìk- pattern and the fallback phrasing
 * should be confirmed by a fluent speaker.
 */
export function toYorubaOrdinal(n: number, mode: YorubaMode = 'traditional'): string {
  if (!Number.isInteger(n) || n < 1) return '';
  if (n in ORDINALS_1_10) return ORDINALS_1_10[n];
  return `${PARTICLES.ordinalFallbackPrefix} ${lowerFirst(toYoruba(n, mode))}`;
}

/**
 * Money phrasing (doc §13): "náírà [cardinal]", with kobo appended when the
 * amount has a fractional part — ₦500 → "náírà ẹ̀ẹ́dẹ́gbẹ̀ta",
 * ₦12.50 → "náírà méjìlá àti kọ́bọ̀ àádọ́ta".
 */
export function nairaToYoruba(amount: number, mode: YorubaMode = 'traditional'): string {
  if (!Number.isFinite(amount)) return '—';
  const sign = amount < 0 ? `${PARTICLES.negative} ` : '';
  const abs = Math.abs(amount);
  const naira = Math.floor(abs);
  const kobo = Math.round((abs - naira) * 100);
  const nairaPhrase = `${PARTICLES.naira} ${lowerFirst(toYoruba(naira, mode))}`;
  if (kobo === 0) return `${sign}${nairaPhrase}`;
  return `${sign}${nairaPhrase} ${PARTICLES.modernJoin} ${PARTICLES.kobo} ${lowerFirst(toYoruba(kobo, mode))}`;
}

function lowerFirst(word: string): string {
  return word.charAt(0).toLocaleLowerCase('yo-NG') + word.slice(1);
}

// ---- Digit strings and typed input -----------------------------------------

/**
 * Spell every digit and decimal/sign mark in a numeric string. Useful for long
 * account numbers, phone numbers, leading-zero values, and any value beyond the
 * safe-integer range. Grouping commas, underscores, and spaces are ignored.
 */
export function digitSequenceToYoruba(
  value: string,
  _mode: YorubaMode = 'traditional',
): string {
  const normalized = normalizeNumericInput(value);
  if (!isNumericString(normalized)) return '';

  const words: string[] = [];
  for (const char of normalized) {
    if (char in DIGIT_WORDS) words.push(DIGIT_WORDS[char]);
    else if (char === '-') words.push(PARTICLES.negative);
    else if (char === '+') words.push(PARTICLES.positive);
    else if (char === '.') words.push(PARTICLES.decimalMark);
  }
  return words.join(' ');
}

/**
 * Render a typed numeric string. Integers within the safe-integer range use full
 * Yoruba number names; decimals use a whole-number phrase plus individually
 * spoken fractional digits ("2.5" → "Méjì ààmì Márùn-ún"); leading-zero values
 * and out-of-range magnitudes fall back to digit spelling.
 */
export function numericInputToYoruba(
  value: string,
  mode: YorubaMode = 'traditional',
): string {
  const normalized = normalizeNumericInput(value);
  if (!isNumericString(normalized)) return '';

  const sign = normalized.startsWith('-') ? `${PARTICLES.negative} ` : '';
  const unsigned = normalized.replace(/^[+-]/, '');

  if (unsigned.includes('.')) {
    const [wholePartRaw, fractionPartRaw = ''] = unsigned.split('.');
    const wholePart = wholePartRaw || '0';
    const wholeWords = integerStringToYoruba(wholePart, mode);
    const fractionWords = fractionPartRaw
      .split('')
      .map((digit) => DIGIT_WORDS[digit])
      .filter(Boolean)
      .join(' ');

    const mark = PARTICLES.decimalMark;
    return `${sign}${wholeWords}${fractionWords ? ` ${mark} ${fractionWords}` : ` ${mark}`}`.trim();
  }

  // Preserve leading-zero values as digit strings because 007 is not the same
  // written form as 7 for phone numbers, IDs, and codes.
  if (/^0\d+/.test(unsigned)) return `${sign}${digitSequenceToYoruba(unsigned, mode)}`.trim();

  return `${sign}${integerStringToYoruba(unsigned, mode)}`.trim();
}

/**
 * Name a plain integer string of any length exactly via BigInt — so a typed
 * quadrillion reads "Kwadírílíọ̀nù kan", not a precision-losing float. Beyond the
 * named scale range (≈37 digits) it falls back to digit-by-digit reading.
 */
function integerStringToYoruba(digits: string, mode: YorubaMode): string {
  const value = BigInt(digits);
  if (value < MAX_NAMED) return wholeToWords(value, mode);
  return digitSequenceToYoruba(digits, mode);
}

function normalizeNumericInput(value: string): string {
  return value.trim().replace(/[,_\s]/g, '');
}

function isNumericString(value: string): boolean {
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value);
}

// ---- Expressions and UI helpers ---------------------------------------------

/**
 * Render a Yoruba operator word for a given symbol.
 */
export function operatorWord(symbol: string): string {
  switch (symbol) {
    case '+':
      return OPERATOR_WORDS['+'];
    case '-':
    case '−':
      return OPERATOR_WORDS['-'];
    case '*':
    case '×':
      return OPERATOR_WORDS['×'];
    case '/':
    case '÷':
      return OPERATOR_WORDS['÷'];
    case '^':
      // "in n ways/places" — x^n read as "x ní ọ̀nà [n]".
      return OPERATOR_WORDS['^'];
    case '=':
      return OPERATOR_WORDS['='];
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
    .split(/([+\-−*×/÷^])/)
    .filter(Boolean);

  return tokens
    .map((token) => {
      if (/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) {
        return numericInputToYoruba(token, mode);
      }
      return operatorWord(token);
    })
    .join(' ');
}

/**
 * Convenience: a Yoruba word for the digit a user just tapped, including ".".
 */
export function digitWord(digit: string, mode: YorubaMode = 'traditional'): string {
  if (digit === '.') return PARTICLES.decimalMark;
  if (digit in DIGIT_WORDS) return DIGIT_WORDS[digit];
  const n = Number(digit);
  if (Number.isNaN(n)) return '';
  return toYoruba(n, mode);
}

/**
 * Decompose a number into the reasoning behind its traditional name — the
 * "explain this number" feature. Returns null when there is nothing to explain
 * (units, exact bases).
 */
export interface NumberExplanation {
  parts: Array<{ value: number; word: string }>;
  relation: 'add' | 'subtract';
  anchor: { value: number; word: string };
  summary: string;
}

export function explainNumber(n: number): NumberExplanation | null {
  if (!Number.isInteger(n) || n < 11 || n > 999) return null;

  if (n < 100) {
    const u = n % 10;
    if (u === 0) return null;
    if (u <= 4) {
      const anchor = Math.floor(n / 10) * 10;
      return {
        parts: [{ value: u, word: TRADITIONAL_0_99[u] }],
        relation: 'add',
        anchor: { value: anchor, word: TRADITIONAL_0_99[anchor] },
        summary: `${n} = ${anchor} + ${u}`,
      };
    }
    const anchor = Math.ceil(n / 10) * 10;
    const deficit = anchor - n;
    return {
      parts: [{ value: deficit, word: TRADITIONAL_0_99[deficit] }],
      relation: 'subtract',
      anchor: { value: anchor, word: TRADITIONAL_0_99[anchor] },
      summary: `${n} = ${anchor} − ${deficit}`,
    };
  }

  const hundreds = Math.floor((n % 1000) / 100) * 100;
  const name = toYoruba(n, 'traditional');
  if (name.includes(` ${PARTICLES.subtractJoin} `)) {
    const anchor = hundreds + 100;
    const deficit = anchor - (n % 1000);
    return {
      parts: [{ value: deficit, word: TRADITIONAL_0_99[deficit] }],
      relation: 'subtract',
      anchor: { value: anchor, word: HUNDREDS_BASE[anchor] ?? toYoruba(anchor, 'traditional') },
      summary: `${n} = ${anchor} − ${deficit}`,
    };
  }
  const remainder = n % 100;
  if (remainder === 0) return null;
  return {
    parts: [{ value: remainder, word: TRADITIONAL_0_99[remainder] }],
    relation: 'add',
    anchor: { value: n - remainder, word: toYoruba(n - remainder, 'traditional') },
    summary: `${n} = ${n - remainder} + ${remainder}`,
  };
}
