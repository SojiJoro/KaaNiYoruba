// Káà — Yoruba number engine test cases
// ---------------------------------------------------------------------------
// Runnable as a plain Node script (`node --import tsx web/src/lib/yorubaNumbers.test.ts`)
// or under any test runner that recognises `assert`-based files. The shape is
// intentionally minimal so the suite stays vendor-neutral.

import assert from 'node:assert/strict';
import { toYoruba, expressionToYoruba, operatorWord } from './yorubaNumbers';

interface Case {
  n: number;
  trad: string;
  modern?: string; // omit when modern == trad
}

const CASES: Case[] = [
  // Units
  { n: 0, trad: 'Òdo' },
  { n: 1, trad: 'Ọ̀kan' },
  { n: 2, trad: 'Méjì' },
  { n: 3, trad: 'Mẹ́ta' },
  { n: 4, trad: 'Mẹ́rin' },
  { n: 5, trad: 'Márùn-ún' },
  { n: 9, trad: 'Mẹ́sàn-án' },
  { n: 10, trad: 'Mẹ́wàá' },
  // Teens (additive 11-14, subtractive 15-19)
  { n: 11, trad: 'Mọ́kànlá' },
  { n: 14, trad: 'Mẹ́rìnlá' },
  { n: 15, trad: 'Mẹ́ẹ̀dógún' },
  { n: 16, trad: 'Mẹ́rìndínlógún' },
  { n: 19, trad: 'Mọ́kàndínlógún' },
  { n: 20, trad: 'Ogún' },
  // Round tens
  { n: 30, trad: 'Ọgbọ̀n' },
  { n: 40, trad: 'Ogójì' },
  { n: 50, trad: 'Àádọ́ta' },
  { n: 60, trad: 'Ọgọ́ta' },
  { n: 70, trad: 'Àádọ́rin' },
  { n: 80, trad: 'Ọgọ́rin' },
  { n: 90, trad: 'Àádọ́rùn' },
  { n: 100, trad: 'Ọgọ́rùn-ún' },
  // Required examples from the spec
  { n: 35, trad: 'Márùndínlógójì', modern: 'Ọgbọ̀n àti Márùn-ún' },
  { n: 45, trad: 'Márùndínláàádọ́ta', modern: 'Ogójì àti Márùn-ún' },
  { n: 75, trad: 'Márùndínlọ́gọ́rin', modern: 'Àádọ́rin àti Márùn-ún' },
  // Modern-only sanity
  { n: 15, trad: 'Mẹ́ẹ̀dógún', modern: 'Mẹ́wàá àti Márùn-ún' },
  { n: 25, trad: 'Mẹ́ẹ̀dọ́gbọ̀n', modern: 'Ogún àti Márùn-ún' },
  // Hundreds
  { n: 200, trad: 'Igba' },
  { n: 300, trad: 'Ọ̀ọ́dúnrún' },
  { n: 400, trad: 'Irinwó' },
  { n: 500, trad: 'Ẹ̀ẹ́dẹ́gbẹ̀ta' },
  { n: 1000, trad: 'Ẹgbẹ̀rún' },
];

let pass = 0;
let fail = 0;

for (const c of CASES) {
  try {
    assert.equal(toYoruba(c.n, 'traditional'), c.trad, `traditional(${c.n})`);
    if (c.modern) {
      assert.equal(toYoruba(c.n, 'modern'), c.modern, `modern(${c.n})`);
    }
    pass++;
  } catch (e) {
    fail++;
    console.error(' ✗', (e as Error).message);
  }
}

// Expressions
try {
  assert.equal(expressionToYoruba('2+2'), 'Méjì pẹ̀lú Méjì');
  assert.equal(expressionToYoruba('12×3'), 'Méjìlá ìgbà Mẹ́ta');
  assert.equal(expressionToYoruba('10-4'), 'Mẹ́wàá yọ Mẹ́rin');
  assert.equal(expressionToYoruba('100÷5'), 'Ọgọ́rùn-ún pín sí Márùn-ún');
  pass += 4;
} catch (e) {
  fail += 4;
  console.error(' ✗', (e as Error).message);
}

// Operator words
try {
  assert.equal(operatorWord('+'), 'pẹ̀lú');
  assert.equal(operatorWord('−'), 'yọ');
  assert.equal(operatorWord('×'), 'ìgbà');
  assert.equal(operatorWord('÷'), 'pín sí');
  pass += 4;
} catch (e) {
  fail += 4;
  console.error(' ✗', (e as Error).message);
}

console.log(`Káà tests — ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
