// Kàá — Yoruba number engine test cases
// ---------------------------------------------------------------------------
// Runnable as a plain Node script (`node --import tsx src/lib/yorubaNumbers.test.ts`)
// or under any test runner that recognises `assert`-based files. The shape is
// intentionally minimal so the suite stays vendor-neutral.
//
// The named cases mirror the verification corpus in
// docs/yoruba-number-logic.md §15 — keep the three in sync (this file, the doc,
// and ios/KaaTests/YorubaNumberEngineTests.swift).

import assert from 'node:assert/strict';
import {
  digitSequenceToYoruba,
  expressionToYoruba,
  explainNumber,
  nairaToYoruba,
  numericInputToYoruba,
  operatorWord,
  toYoruba,
  toYorubaOrdinal,
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
  // Just under the next hundred: subtractive "ó dín" (doc §11, §15)
  { n: 199, trad: 'Igba ó dín Ọ̀kan', modern: 'Ọgọ́rùn-ún àti Àádọ́rùn àti Mẹ́sàn-án' },
  { n: 590, trad: 'Ẹgbẹ̀ta ó dín Mẹ́wàá' },
  { n: 595, trad: 'Ẹgbẹ̀ta ó dín Márùn-ún' },
  { n: 995, trad: 'Ẹgbẹ̀rún ó dín Márùn-ún' },
  // Classical large units, exact values only (doc §9, §15)
  { n: 2000, trad: 'Ẹgbàá', modern: 'Ẹgbẹ̀rún méjì' },
  { n: 4000, trad: 'Ẹgbàájì', modern: 'Ẹgbẹ̀rún mẹ́rin' },
  { n: 20000, trad: 'Ọkẹ́ kan', modern: 'Ẹgbẹ̀rún ogún' },
  { n: 40000, trad: 'Ọkẹ́ méjì', modern: 'Ẹgbẹ̀rún ogójì' },
  // Thousands and beyond — generated, never digit-spelled
  { n: 1000, trad: 'Ẹgbẹ̀rún kan', modern: 'Ẹgbẹ̀rún kan' },
  { n: 1001, trad: 'Ẹgbẹ̀rún kan ó lé Ọ̀kan', modern: 'Ẹgbẹ̀rún kan àti Ọ̀kan' },
  { n: 558, trad: 'Ẹ̀ẹ́dẹ́gbẹ̀ta ó lé Méjìdínlọ́gọ́ta', modern: 'Ọgọ́rùn-ún márùn-ún àti Àádọ́ta àti Mẹ́jọ' },
  { n: 2232, trad: 'Ẹgbẹ̀rún méjì ó lé Igba ó lé Méjìlélọ́gbọ̀n', modern: 'Ẹgbẹ̀rún méjì àti Ọgọ́rùn-ún méjì àti Ọgbọ̀n àti Méjì' },
  { n: 64594, trad: 'Ẹgbẹ̀rún mẹ́rìnlélọ́gọ́ta ó lé Ẹgbẹ̀ta ó dín Mẹ́fà', modern: 'Ẹgbẹ̀rún ọgọ́ta àti Mẹ́rin àti Ọgọ́rùn-ún márùn-ún àti Àádọ́rùn àti Mẹ́rin' },
  { n: 1_000_000, trad: 'Mílíọ̀nù kan', modern: 'Mílíọ̀nù kan' },
  { n: 1_258_222, trad: 'Mílíọ̀nù kan ó lé Ẹgbẹ̀rún igba ó lé Méjìdínlọ́gọ́ta ó lé Igba ó lé Méjìlélógún' },
];

let pass = 0;
let fail = 0;

function check(label: string, fn: () => void) {
  try {
    fn();
    pass++;
  } catch (e) {
    fail++;
    console.error(' ✗', label, '—', (e as Error).message);
  }
}

for (const c of CASES) {
  check(`case ${c.n}`, () => {
    assert.equal(toYoruba(c.n, 'traditional'), c.trad, `traditional(${c.n})`);
    if (c.modern) {
      assert.equal(toYoruba(c.n, 'modern'), c.modern, `modern(${c.n})`);
    }
  });
}

// Expressions
check('expressions', () => {
  assert.equal(expressionToYoruba('2+2'), 'Méjì pẹ̀lú Méjì');
  assert.equal(expressionToYoruba('12×3'), 'Méjìlá ìgbà Mẹ́ta');
  assert.equal(expressionToYoruba('10-4'), 'Mẹ́wàá yọ Mẹ́rin');
  assert.equal(expressionToYoruba('100÷5'), 'Ọgọ́rùn-ún pín sí Márùn-ún');
  assert.equal(expressionToYoruba('2.5+3'), 'Méjì ààmì Márùn-ún pẹ̀lú Mẹ́ta');
  assert.equal(expressionToYoruba('2^10'), 'Méjì ní ọ̀nà Mẹ́wàá');
});

// Typed numbers, decimals, and arbitrary digit strings
check('typed input', () => {
  assert.equal(numericInputToYoruba('007'), 'Òdo Òdo Méje');
  // A leading-zero string still reads digit-by-digit (phone numbers / IDs).
  assert.equal(digitSequenceToYoruba('007'), 'Òdo Òdo Méje');
  // The decimal point reads "ààmì" and fractional digits read one by one (§12).
  assert.equal(numericInputToYoruba('2.5'), 'Méjì ààmì Márùn-ún');
  assert.equal(numericInputToYoruba('12.05'), 'Méjìlá ààmì Òdo Márùn-ún');
  assert.equal(toYoruba(1_000_000), 'Mílíọ̀nù kan');
  assert.equal(numericInputToYoruba('1258222'), 'Mílíọ̀nù kan ó lé Ẹgbẹ̀rún igba ó lé Méjìdínlọ́gọ́ta ó lé Igba ó lé Méjìlélógún');
  assert.equal(digitSequenceToYoruba('-90.1'), 'Òdì Mẹ́sàn-án Òdo ààmì Ọ̀kan');
  // Borrowed scale words past a trillion (exact via BigInt) — quadrillion → decillion.
  assert.equal(toYoruba(1e15), 'Kwadírílíọ̀nù kan');
  assert.equal(toYoruba(1e18), 'Kwíntílíọ̀nù kan');
  assert.equal(toYoruba(1e21), 'Sẹ́kítílíọ̀nù kan');
  assert.equal(toYoruba(1e24), 'Sẹ́ptílíọ̀nù kan');
  assert.equal(numericInputToYoruba('1000000000000'), 'Tirílíọ̀nù kan');
  assert.equal(numericInputToYoruba('1000000000000000000000000000000000'), 'Dẹ́sílíọ̀nù kan');
  // Large values never produce an "Òdo Òdo" run.
  assert.equal(/Òdo Òdo Òdo/.test(toYoruba(2.232e30)), false);
});

// Operator words
check('operators', () => {
  assert.equal(operatorWord('+'), 'pẹ̀lú');
  assert.equal(operatorWord('−'), 'yọ');
  assert.equal(operatorWord('×'), 'ìgbà');
  assert.equal(operatorWord('÷'), 'pín sí');
  assert.equal(operatorWord('^'), 'ní ọ̀nà');
});

// Ordinals (doc §13)
check('ordinals', () => {
  assert.equal(toYorubaOrdinal(1), 'Àkọ́kọ́');
  assert.equal(toYorubaOrdinal(2), 'Ìkejì');
  assert.equal(toYorubaOrdinal(3), 'Ìkẹta');
  assert.equal(toYorubaOrdinal(4), 'Ìkẹrin');
  assert.equal(toYorubaOrdinal(10), 'Ìkẹwàá');
  assert.equal(toYorubaOrdinal(11), 'Ipò mọ́kànlá');
  assert.equal(toYorubaOrdinal(0), '');
});

// Money (doc §13): ₦500 = náírà ẹ̀ẹ́dẹ́gbẹ̀ta
check('naira', () => {
  assert.equal(nairaToYoruba(500), 'náírà ẹ̀ẹ́dẹ́gbẹ̀ta');
  assert.equal(nairaToYoruba(12.5), 'náírà méjìlá àti kọ́bọ̀ àádọ́ta');
  assert.equal(nairaToYoruba(-20), 'Òdì náírà ogún');
});

// Explain-this-number decomposition
check('explain', () => {
  const e75 = explainNumber(75)!;
  assert.equal(e75.relation, 'subtract');
  assert.equal(e75.anchor.value, 80);
  assert.equal(e75.summary, '75 = 80 − 5');
  const e21 = explainNumber(21)!;
  assert.equal(e21.relation, 'add');
  assert.equal(e21.anchor.value, 20);
  const e595 = explainNumber(595)!;
  assert.equal(e595.relation, 'subtract');
  assert.equal(e595.anchor.value, 600);
  assert.equal(explainNumber(40), null);
});

// ---- Property tests: every name 0–9,999 in both modes must be well-formed
// and unique. Uniqueness is the round-trip property — if two numbers shared a
// name, Yorùbá → number would be ambiguous.
for (const mode of ['traditional', 'modern'] as const) {
  check(`property: ${mode} 0–9999 well-formed and unique`, () => {
    const seen = new Map<string, number>();
    for (let n = 0; n <= 9999; n++) {
      const word = toYoruba(n, mode);
      assert.ok(word.length > 0, `${mode}(${n}) is empty`);
      assert.ok(!word.includes('undefined'), `${mode}(${n}) contains undefined`);
      assert.ok(!word.includes('  '), `${mode}(${n}) has a double space`);
      assert.ok(!/\d/.test(word), `${mode}(${n}) leaked a digit: ${word}`);
      if (n > 0) {
        assert.ok(!word.includes('Òdo'), `${mode}(${n}) contains a zero word: ${word}`);
      }
      const dup = seen.get(word);
      assert.equal(dup, undefined, `${mode}: ${n} and ${dup} share the name "${word}"`);
      seen.set(word, n);
    }
  });
}


// ---- Syllable splitter (powers the spelling games) --------------------------
import { splitSyllables, spellTarget } from './syllables';

check('syllables', () => {
  assert.deepEqual(splitSyllables('Méjì'), ['Mé', 'jì']);
  assert.deepEqual(splitSyllables('Ọ̀kan'), ['Ọ̀', 'kan']);
  assert.deepEqual(splitSyllables('Ogún'), ['O', 'gún']);
  assert.deepEqual(splitSyllables('Ọgbọ̀n'), ['Ọ', 'gbọ̀n']);
  assert.deepEqual(splitSyllables('Márùn-ún'), ['Má', 'rùn', 'ún']);
  assert.deepEqual(splitSyllables('Mọ́kànlélógún'), ['Mọ́', 'kàn', 'lé', 'ló', 'gún']);
  assert.deepEqual(splitSyllables('Àádọ́ta'), ['À', 'á', 'dọ́', 'ta']);
  assert.deepEqual(splitSyllables('Ẹgbẹ̀rún'), ['Ẹ', 'gbẹ̀', 'rún']);
  assert.deepEqual(splitSyllables('Mẹ́wàá'), ['Mẹ́', 'wà', 'á']);
  // Round-trip: rebuilding the tiles must reproduce the word for every name
  // the spelling games can serve (0–100 plus the hundred anchors).
  for (let n = 0; n <= 100; n++) {
    const word = toYoruba(n, 'traditional');
    assert.equal(
      splitSyllables(word).join('').normalize('NFC'),
      spellTarget(word).normalize('NFC'),
      `syllable round-trip failed for ${n}: ${word}`,
    );
  }
  for (const n of [200, 300, 400, 500, 600, 700, 800, 900, 1000]) {
    const word = toYoruba(n, 'traditional');
    assert.equal(
      splitSyllables(word).join('').normalize('NFC'),
      spellTarget(word).normalize('NFC'),
      `syllable round-trip failed for ${n}: ${word}`,
    );
  }
});


// ---- Learn engine: every level in every age group must build clean sessions
import { AGE_GROUPS, LEVELS, buildSession, exerciseNumber } from './learn';

check('learn sessions generate cleanly', () => {
  for (const group of AGE_GROUPS) {
    for (const level of LEVELS[group.id]) {
      for (const mode of ['traditional', 'modern'] as const) {
        for (let seed = 1; seed <= 25; seed++) {
          const session = buildSession(group.id, level, mode, seed % 3 === 0 ? [7, 12] : [], seed);
          assert.equal(session.length, 8, `${group.id}/${level.id} session length`);
          for (const ex of session) {
            exerciseNumber(ex); // must not throw
            if ('options' in ex) {
              assert.ok(ex.options.length >= 2, `${group.id}/${level.id} ${ex.kind} has too few options`);
              assert.equal(new Set(ex.options).size, ex.options.length, `${group.id}/${level.id} ${ex.kind} duplicate options`);
            }
            if (ex.kind === 'spell') {
              assert.ok(ex.syllables.length >= 2, `${group.id}/${level.id} spell word too short: ${ex.word}`);
              assert.equal(ex.syllables.join('').normalize('NFC'), ex.word.normalize('NFC'), `spell tiles mismatch for ${ex.word}`);
            }
            if (ex.kind === 'pick-word') {
              assert.ok(ex.options.includes(ex.correct), `pick-word options missing answer for ${ex.n}`);
            }
            if (ex.kind === 'match') {
              assert.ok(ex.pairs.length >= 2, `${group.id}/${level.id} match has too few pairs`);
            }
          }
        }
      }
    }
  }
});

console.log(`Kàá tests — ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
