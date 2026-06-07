// Kàá — Yoruba number engine test cases
// ---------------------------------------------------------------------------
// Runnable as a plain Node script (`node --import tsx src/lib/yorubaNumbers.test.ts`)
// or under any test runner that recognises `assert`-based files. The shape is
// intentionally minimal so the suite stays vendor-neutral.

import assert from 'node:assert/strict';
import {
  digitSequenceToYoruba,
  expressionToYoruba,
  numericInputToYoruba,
  operatorWord,
  toYoruba,
} from './yorubaNumbers';

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
  // Hundreds and larger typed values
  { n: 65, trad: 'Márùndínláàádọ́rin', modern: 'Ọgọ́ta àti Márùn-ún' },
  { n: 200, trad: 'Igba', modern: 'Ọgọ́rùn-ún méjì' },
  { n: 300, trad: 'Ọ̀ọ́dúnrún' },
  { n: 400, trad: 'Irinwó' },
  { n: 500, trad: 'Ẹ̀ẹ́dẹ́gbẹ̀ta', modern: 'Ọgọ́rùn-ún márùn-ún' },
  // Hundreds + remainder: base-first "ó lé" (traditional), "àti" (modern)
  { n: 105, trad: 'Ọgọ́rùn-ún ó lé Márùn-ún', modern: 'Ọgọ́rùn-ún àti Márùn-ún' },
  { n: 250, trad: 'Igba ó lé Àádọ́ta', modern: 'Ọgọ́rùn-ún méjì àti Àádọ́ta' },
  { n: 555, trad: 'Ẹ̀ẹ́dẹ́gbẹ̀ta ó lé Márùndínlọ́gọ́ta', modern: 'Ọgọ́rùn-ún márùn-ún àti Àádọ́ta àti Márùn-ún' },
  // Thousands and beyond — generated, never digit-spelled
  { n: 1000, trad: 'Ẹgbẹ̀rún kan', modern: 'Ẹgbẹ̀rún kan' },
  { n: 1001, trad: 'Ẹgbẹ̀rún kan ó lé Ọ̀kan', modern: 'Ẹgbẹ̀rún kan àti Ọ̀kan' },
  { n: 558, trad: 'Ẹ̀ẹ́dẹ́gbẹ̀ta ó lé Méjìdínlọ́gọ́ta', modern: 'Ọgọ́rùn-ún márùn-ún àti Àádọ́ta àti Mẹ́jọ' },
  { n: 2232, trad: 'Ẹgbẹ̀rún méjì ó lé Igba ó lé Méjìlélọ́gbọ̀n', modern: 'Ẹgbẹ̀rún méjì àti Ọgọ́rùn-ún méjì àti Ọgbọ̀n àti Méjì' },
  { n: 64594, trad: 'Ẹgbẹ̀rún mẹ́rìnlélọ́gọ́ta ó lé Ẹ̀ẹ́dẹ́gbẹ̀ta ó lé Mẹ́rìnléláàádọ́rùn', modern: 'Ẹgbẹ̀rún ọgọ́ta àti Mẹ́rin àti Ọgọ́rùn-ún márùn-ún àti Àádọ́rùn àti Mẹ́rin' },
  { n: 1_000_000, trad: 'Mílíọ̀nù kan', modern: 'Mílíọ̀nù kan' },
  { n: 1_258_222, trad: 'Mílíọ̀nù kan ó lé Ẹgbẹ̀rún igba ó lé Méjìdínlọ́gọ́ta ó lé Igba ó lé Méjìlélógún' },
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
  assert.equal(expressionToYoruba('2.5+3'), 'Méjì Ẹsẹ Márùn-ún pẹ̀lú Mẹ́ta');
  assert.equal(expressionToYoruba('2^10'), 'Méjì ní ọ̀nà Mẹ́wàá');
  pass += 6;
} catch (e) {
  fail += 5;
  console.error(' ✗', (e as Error).message);
}

// Typed numbers, decimals, and arbitrary digit strings
try {
  assert.equal(numericInputToYoruba('007'), 'Òdo Òdo Méje');
  // A leading-zero string still reads digit-by-digit (phone numbers / IDs).
  assert.equal(digitSequenceToYoruba('007'), 'Òdo Òdo Méje');
  assert.equal(numericInputToYoruba('12.05'), 'Méjìlá Ẹsẹ Òdo Márùn-ún');
  assert.equal(toYoruba(1_000_000), 'Mílíọ̀nù kan');
  assert.equal(numericInputToYoruba('1258222'), 'Mílíọ̀nù kan ó lé Ẹgbẹ̀rún igba ó lé Méjìdínlọ́gọ́ta ó lé Igba ó lé Méjìlélógún');
  assert.equal(digitSequenceToYoruba('-90.1'), 'Òdì Mẹ́sàn-án Òdo Ẹsẹ Ọ̀kan');
  // Borrowed scale words past a trillion (exact via BigInt) — quadrillion → decillion.
  assert.equal(toYoruba(1e15), 'Kwadírílíọ̀nù kan');
  assert.equal(toYoruba(1e18), 'Kwíntílíọ̀nù kan');
  assert.equal(toYoruba(1e21), 'Sẹ́kítílíọ̀nù kan');
  assert.equal(toYoruba(1e24), 'Sẹ́ptílíọ̀nù kan');
  assert.equal(numericInputToYoruba('1000000000000'), 'Tirílíọ̀nù kan');
  assert.equal(numericInputToYoruba('1000000000000000000000000000000000'), 'Dẹ́sílíọ̀nù kan');
  // Large values never produce an "Òdo Òdo" run.
  assert.equal(/Òdo Òdo Òdo/.test(toYoruba(2.232e30)), false);
  pass += 13;
} catch (e) {
  fail += 5;
  console.error(' ✗', (e as Error).message);
}

// Operator words
try {
  assert.equal(operatorWord('+'), 'pẹ̀lú');
  assert.equal(operatorWord('−'), 'yọ');
  assert.equal(operatorWord('×'), 'ìgbà');
  assert.equal(operatorWord('÷'), 'pín sí');
  assert.equal(operatorWord('^'), 'ní ọ̀nà');
  pass += 5;
} catch (e) {
  fail += 4;
  console.error(' ✗', (e as Error).message);
}

console.log(`Kàá tests — ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
