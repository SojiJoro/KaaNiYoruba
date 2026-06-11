// Kàá — native-speaker review packet generator.
// Dumps a reviewable CSV of generated Yorùbá number names so a fluent speaker
// can verify them in one sitting. Run with:
//   npm run review-packet
// Output: docs/review/yoruba-review-packet.csv (UTF-8 with BOM so spreadsheet
// apps detect the encoding and the diacritics survive).

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { nairaToYoruba, toYoruba, toYorubaOrdinal } from '../src/lib/yorubaNumbers';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Every value 0–219 (the fully hand-verified zone plus the first hundred join),
// every hundred boundary ±6, a spread through the thousands, and the classical
// units — the ranges where published sources diverge.
const values = new Set<number>();
for (let n = 0; n <= 219; n++) values.add(n);
for (let h = 100; h <= 1000; h += 100) {
  for (let d = -6; d <= 6; d++) {
    const v = h + d;
    if (v >= 0) values.add(v);
  }
}
for (const v of [
  555, 558, 590, 595, 644, 777, 888, 995, 999,
  1000, 1001, 1015, 1100, 1500, 1995, 2000, 2001, 2232, 2500,
  3000, 4000, 4001, 5000, 6789, 9999,
  10000, 12345, 20000, 20001, 40000, 60000, 64594, 100000,
  1000000, 1258222,
]) {
  values.add(v);
}

type Row = [kind: string, value: string, generated: string, flag: string];

const rows: Row[] = [];

const flagFor = (n: number): string => {
  if (n >= 100 && n <= 999 && n % 100 !== 0) {
    return n % 100 >= 90 ? 'ó dín join — dialect-variable' : 'ó lé join — dialect-variable';
  }
  if (n === 2000 || n === 4000 || (n >= 20000 && n % 20000 === 0)) return 'classical unit';
  if (n > 1000) return 'generated compound';
  return '';
};

for (const n of [...values].sort((a, b) => a - b)) {
  rows.push(['cardinal-traditional', String(n), toYoruba(n, 'traditional'), flagFor(n)]);
}
for (const n of [...values].sort((a, b) => a - b)) {
  if (n > 100 && n % 100 !== 0 && n % 7 !== 0) continue; // thinner modern sample
  rows.push(['cardinal-modern', String(n), toYoruba(n, 'modern'), '']);
}
for (let n = 1; n <= 12; n++) {
  rows.push(['ordinal', String(n), toYorubaOrdinal(n), n >= 5 && n <= 9 ? 'REVIEW: regular ìk- pattern' : '']);
}
for (const amount of [5, 50, 200, 500, 1250, 12.5, 99.99]) {
  rows.push(['naira', `₦${amount}`, nairaToYoruba(amount), '']);
}

const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const header = [
  'kind',
  'value',
  'generated_yoruba',
  'engine_flag',
  'correct (Y/N)',
  'correction',
  'notes',
];
const csv =
  '﻿' +
  [header, ...rows.map((r) => [...r, '', '', ''])]
    .map((r) => r.map(esc).join(','))
    .join('\n') +
  '\n';

const outDir = join(root, 'docs', 'review');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'yoruba-review-packet.csv');
writeFileSync(outFile, csv);
console.log(`Wrote ${rows.length} rows to ${outFile}`);
