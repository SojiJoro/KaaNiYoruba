// Kàá — Kọ́ Ẹ̀kọ́ learning engine.
// Age tracks, level definitions, exercise generation, progress storage, and a
// Leitner-lite review queue. The pedagogy behind every choice here is written
// up (with sources) in docs/learning-design.md:
//   * 4–6 learn quantities before symbols (subitizing, tap-counting,
//     cardinality, count sequence) — so that track never requires reading.
//   * 7–9 learn word recognition and first spelling via syllable building.
//   * 10–13 learn the lé/dín system itself and two-way translation to 100.
//   * adults get the full range fast, with misses resurfaced.

import {
  explainNumber,
  nairaToYoruba,
  toYoruba,
  type YorubaMode,
} from './yorubaNumbers';
import { splitSyllables, spellTarget } from './syllables';

// ---- Age groups -------------------------------------------------------------

export type AgeGroup = 'kekere' | 'omode' | 'odo' | 'agba';

export interface AgeGroupInfo {
  id: AgeGroup;
  emoji: string;
  yoruba: string;
  english: string;
  ages: string;
  tagline: string;
}

export const AGE_GROUPS: AgeGroupInfo[] = [
  {
    id: 'kekere',
    emoji: '🐥',
    yoruba: 'Àwọn kékeré',
    english: 'Little ones',
    ages: '4–6',
    tagline: 'Count things you can touch — no reading needed',
  },
  {
    id: 'omode',
    emoji: '🦋',
    yoruba: 'Àwọn ọmọdé',
    english: 'Kids',
    ages: '7–9',
    tagline: 'Know the words and start spelling them',
  },
  {
    id: 'odo',
    emoji: '🥁',
    yoruba: 'Àwọn ọ̀dọ́',
    english: 'Tweens',
    ages: '10–13',
    tagline: 'Crack the lé and dín system to 100',
  },
  {
    id: 'agba',
    emoji: '🌳',
    yoruba: 'Àwọn àgbà',
    english: 'Adults',
    ages: '14+',
    tagline: 'The full system — hundreds, money, the old units',
  },
];

// ---- Exercise types ----------------------------------------------------------

export type Exercise =
  | { kind: 'count'; n: number; emoji: string; options: number[]; word: string }
  | { kind: 'subitize'; n: number; options: number[]; word: string }
  | { kind: 'sequence'; seq: number[]; answer: number; options: number[]; word: string }
  | { kind: 'match'; pairs: Array<{ n: number; word: string }> }
  | { kind: 'pick-word'; n: number; correct: string; options: string[] }
  | { kind: 'pick-number'; n: number; word: string; options: number[] }
  | { kind: 'spell'; n: number; word: string; syllables: string[]; order: number[] }
  | {
      kind: 'fill-syllable';
      n: number;
      word: string;
      syllables: string[];
      blankIndex: number;
      options: string[];
    }
  | { kind: 'type-number'; n: number; word: string }
  | {
      kind: 'anchor';
      n: number;
      word: string;
      relation: 'add' | 'subtract';
      delta: number;
      answer: number;
      options: number[];
    }
  | { kind: 'money'; amount: number; phrase: string; options: number[] };

export type ExerciseKind = Exercise['kind'];

export interface LevelDef {
  id: string;
  title: string;
  subtitle: string;
  pool: number[];
  kinds: ExerciseKind[];
}

const range = (from: number, to: number, step = 1): number[] => {
  const out: number[] = [];
  for (let n = from; n <= to; n += step) out.push(n);
  return out;
};

// Numbers whose unit digit is 1–4 attach upward with lé; 5–9 count down with
// dín — the two halves of the system the 10–13 track drills explicitly.
const LE_POOL = [21, 22, 23, 24, 31, 32, 33, 34, 41, 43, 51, 52, 61, 64, 71, 73, 81, 82, 91, 94];
const DIN_POOL = [16, 18, 25, 26, 27, 28, 29, 35, 36, 39, 45, 47, 55, 58, 65, 66, 75, 79, 85, 96];

export const LEVELS: Record<AgeGroup, LevelDef[]> = {
  kekere: [
    { id: 'k1', title: 'Ka 1–3', subtitle: 'Count 1 to 3', pool: range(1, 3), kinds: ['count', 'subitize'] },
    { id: 'k2', title: 'Ka 1–5', subtitle: 'Count 1 to 5', pool: range(1, 5), kinds: ['count', 'subitize', 'match'] },
    { id: 'k3', title: 'Ka 1–10', subtitle: 'Count 1 to 10', pool: range(1, 10), kinds: ['count', 'subitize', 'match'] },
    { id: 'k4', title: 'Tẹ̀lé e', subtitle: 'What comes next?', pool: range(1, 10), kinds: ['sequence', 'count', 'match'] },
  ],
  omode: [
    { id: 'm1', title: 'Mọ̀ wọ́n 0–10', subtitle: 'Know the words 0–10', pool: range(0, 10), kinds: ['pick-word', 'pick-number', 'match'] },
    { id: 'm2', title: 'Kọ wọ́n 1–10', subtitle: 'Spell the words 1–10', pool: range(1, 10), kinds: ['spell', 'fill-syllable', 'pick-word'] },
    { id: 'm3', title: 'Mọ̀ wọ́n 11–20', subtitle: 'Know the teens', pool: range(11, 20), kinds: ['pick-word', 'fill-syllable', 'match', 'sequence'] },
    { id: 'm4', title: 'Kọ wọ́n 11–20', subtitle: 'Spell the teens', pool: range(11, 20), kinds: ['spell', 'fill-syllable', 'pick-number'] },
    { id: 'm5', title: 'Ẹ̀wá mẹ́wàá', subtitle: 'The round tens', pool: range(10, 100, 10), kinds: ['pick-word', 'spell', 'match'] },
  ],
  odo: [
    { id: 'd1', title: 'Òfin lé', subtitle: 'The adding rule (…lé…)', pool: LE_POOL, kinds: ['anchor', 'pick-word', 'pick-number'] },
    { id: 'd2', title: 'Òfin dín', subtitle: 'The subtracting rule (…dín…)', pool: DIN_POOL, kinds: ['anchor', 'pick-word', 'type-number'] },
    { id: 'd3', title: 'Kọ àwọn ẹ̀wá', subtitle: 'Spell the tens to 100', pool: range(10, 100, 10), kinds: ['spell', 'type-number', 'pick-word'] },
    { id: 'd4', title: 'Àdàpọ̀ 21–100', subtitle: 'Everything to 100', pool: range(21, 100), kinds: ['type-number', 'pick-number', 'anchor', 'fill-syllable'] },
  ],
  agba: [
    { id: 'a1', title: 'Ìpìlẹ̀ 0–20', subtitle: 'Foundations, fast', pool: range(0, 20), kinds: ['pick-word', 'type-number'] },
    { id: 'a2', title: 'Ètò náà', subtitle: 'The system, 21–100', pool: range(21, 100), kinds: ['anchor', 'type-number', 'pick-word'] },
    {
      id: 'a3',
      title: 'Àwọn ọgọ́rùn-ún',
      subtitle: 'Hundreds and compounds',
      pool: [...range(100, 1000, 100), 105, 150, 199, 250, 305, 444, 555, 595, 650, 777, 888, 995],
      kinds: ['pick-word', 'pick-number', 'type-number'],
    },
    {
      id: 'a4',
      title: 'Owó àti ìgbàanì',
      subtitle: 'Money and the classical units',
      pool: [1000, 2000, 4000, 20000, 40000, 1000000],
      kinds: ['pick-number', 'money', 'type-number'],
    },
  ],
};

export const SESSION_LENGTH = 8;
export const COUNT_EMOJI = ['🥁', '🍊', '🐓', '🌽', '⭐', '🦋', '🐟', '🍌'];
const MONEY_AMOUNTS = [5, 20, 50, 100, 200, 500, 1000, 1250, 2000];

// ---- Deterministic RNG so a session is reproducible from its seed ------------

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Distinct distractor numbers near n, preferring the level pool. */
function numberDistractors(n: number, pool: number[], count: number, rng: () => number): number[] {
  const candidates = new Set<number>();
  for (const p of shuffled(pool, rng)) {
    if (p !== n) candidates.add(p);
    if (candidates.size >= count + 3) break;
  }
  // Confusable neighbours sharpen the discrimination the exercise teaches.
  for (const d of [n - 1, n + 1, n - 10, n + 10]) {
    if (d >= 0 && d !== n) candidates.add(d);
  }
  return shuffled([...candidates], rng).slice(0, count);
}

// ---- Exercise builders --------------------------------------------------------

function buildExercise(
  kind: ExerciseKind,
  level: LevelDef,
  mode: YorubaMode,
  rng: () => number,
  forcedN?: number,
): Exercise {
  const pool = level.pool;
  const n = forcedN ?? pick(pool, rng);
  const word = toYoruba(n, mode);

  switch (kind) {
    case 'count': {
      const target = n === 0 ? pick(pool.filter((p) => p > 0), rng) || 1 : n;
      return {
        kind,
        n: target,
        emoji: pick(COUNT_EMOJI, rng),
        word: toYoruba(target, mode),
        options: shuffled([target, ...numberDistractors(target, pool, 2, rng)], rng),
      };
    }
    case 'subitize': {
      const target = Math.min(n === 0 ? 1 : n, 10);
      return {
        kind,
        n: target,
        word: toYoruba(target, mode),
        options: shuffled([target, ...numberDistractors(target, pool, 2, rng)], rng),
      };
    }
    case 'sequence': {
      const max = Math.max(...pool);
      const answer = Math.max(3, Math.min(n, max));
      const seq = [answer - 2, answer - 1];
      return {
        kind,
        seq,
        answer,
        word: toYoruba(answer, mode),
        options: shuffled([answer, ...numberDistractors(answer, pool, 2, rng)], rng),
      };
    }
    case 'match': {
      const ns = shuffled(pool, rng).slice(0, 3);
      while (ns.length < 3) ns.push(ns[0]); // tiny pools: degrade gracefully
      return { kind, pairs: [...new Set(ns)].map((m) => ({ n: m, word: toYoruba(m, mode) })) };
    }
    case 'pick-word': {
      const distractors = numberDistractors(n, pool, 3, rng).map((d) => toYoruba(d, mode));
      return { kind, n, correct: word, options: shuffled([word, ...new Set(distractors)].slice(0, 4), rng) };
    }
    case 'pick-number': {
      return { kind, n, word, options: shuffled([n, ...numberDistractors(n, pool, 3, rng)], rng) };
    }
    case 'spell': {
      const syllables = splitSyllables(word);
      return {
        kind,
        n,
        word: spellTarget(word),
        syllables,
        order: shuffled(syllables.map((_, i) => i), rng),
      };
    }
    case 'fill-syllable': {
      const syllables = splitSyllables(word);
      const blankIndex = Math.floor(rng() * syllables.length);
      const correct = syllables[blankIndex];
      const others = new Set<string>();
      for (const d of numberDistractors(n, pool, 4, rng)) {
        for (const s of splitSyllables(toYoruba(d, mode))) {
          if (s !== correct) others.add(s);
        }
      }
      const options = shuffled([correct, ...shuffled([...others], rng).slice(0, 2)], rng);
      return { kind, n, word: spellTarget(word), syllables, blankIndex, options };
    }
    case 'type-number':
      return { kind, n, word };
    case 'anchor': {
      const ex = explainNumber(n);
      if (!ex) return buildExercise('pick-word', level, mode, rng, n);
      const answer = ex.anchor.value;
      const options = shuffled(
        [answer, ...numberDistractors(answer, [answer - 10, answer + 10, n], 2, rng)],
        rng,
      );
      return {
        kind,
        n,
        word,
        relation: ex.relation,
        delta: ex.parts[0].value,
        answer,
        options,
      };
    }
    case 'money': {
      const amount = pick(MONEY_AMOUNTS, rng);
      return {
        kind,
        amount,
        phrase: nairaToYoruba(amount, mode),
        options: shuffled([amount, ...numberDistractors(amount, MONEY_AMOUNTS, 2, rng)], rng),
      };
    }
  }
}

// ---- Session assembly ----------------------------------------------------------

export function buildSession(
  age: AgeGroup,
  level: LevelDef,
  mode: YorubaMode,
  reviewNumbers: number[],
  seed: number,
): Exercise[] {
  const rng = mulberry32(seed);
  const exercises: Exercise[] = [];

  // Up to two review items lead the session (spaced repetition of misses),
  // in a form the age group can answer.
  const reviewKind: ExerciseKind = age === 'kekere' ? 'count' : age === 'omode' ? 'pick-word' : 'type-number';
  for (const n of reviewNumbers.slice(0, 2)) {
    exercises.push(buildExercise(reviewKind, { ...level, pool: [...level.pool, n] }, mode, rng, n));
  }

  const kinds = shuffled(level.kinds, rng);
  let i = 0;
  while (exercises.length < SESSION_LENGTH) {
    exercises.push(buildExercise(kinds[i % kinds.length], level, mode, rng));
    i++;
  }
  return exercises;
}

/** The number an exercise teaches — what goes into the review queue on a miss. */
export function exerciseNumber(ex: Exercise): number | null {
  switch (ex.kind) {
    case 'match':
      return null;
    case 'sequence':
      return ex.answer;
    case 'money':
      return ex.amount;
    default:
      return ex.n;
  }
}

// ---- Progress storage ------------------------------------------------------------

export interface LevelProgress {
  stars: number; // best stars earned, 0–3
  attempts: number;
}

export interface LearnProgress {
  age: AgeGroup | null;
  levels: Record<string, LevelProgress>; // keyed `${age}/${levelId}`
  review: Record<string, number[]>; // per age group: numbers to resurface
  streak: number;
  lastDay: string;
}

const STORAGE_KEY = 'kaa-learn-v2';

export function loadLearnProgress(): LearnProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LearnProgress;
      if (parsed && typeof parsed === 'object' && parsed.levels) return parsed;
    }
  } catch {
    // fall through to a fresh start
  }
  return { age: null, levels: {}, review: {}, streak: 0, lastDay: '' };
}

export function saveLearnProgress(p: LearnProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // Private browsing: progress just won't persist.
  }
}

export function starsFor(correct: number): number {
  if (correct >= SESSION_LENGTH) return 3;
  if (correct >= SESSION_LENGTH - 1) return 2;
  if (correct >= Math.ceil(SESSION_LENGTH * 0.6)) return 1;
  return 0;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function applySessionResult(
  p: LearnProgress,
  age: AgeGroup,
  levelId: string,
  correct: number,
  missedNumbers: number[],
  clearedNumbers: number[],
): LearnProgress {
  const key = `${age}/${levelId}`;
  const prev = p.levels[key] ?? { stars: 0, attempts: 0 };
  const stars = starsFor(correct);

  const day = today();
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const streak = p.lastDay === day ? p.streak : p.lastDay === yesterday ? p.streak + 1 : 1;

  const queue = new Set(p.review[age] ?? []);
  for (const n of clearedNumbers) queue.delete(n);
  for (const n of missedNumbers) queue.add(n);

  return {
    ...p,
    age,
    levels: {
      ...p.levels,
      [key]: { stars: Math.max(prev.stars, stars), attempts: prev.attempts + 1 },
    },
    review: { ...p.review, [age]: [...queue].slice(-12) },
    streak,
    lastDay: day,
  };
}
