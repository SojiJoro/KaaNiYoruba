#!/usr/bin/env node
// Kàá — table generator.
// Reads shared/yoruba-language-pack.json (the single source of truth) and emits
//   src/lib/yorubaTables.generated.ts        (web engine)
//   ios/Kaa/YorubaNumberTables.generated.swift (iOS engine)
// Run with `npm run generate`. CI fails if the generated files are stale.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pack = JSON.parse(
  readFileSync(join(root, 'shared', 'yoruba-language-pack.json'), 'utf8'),
);

const HEADER =
  'GENERATED from shared/yoruba-language-pack.json — do not edit by hand.\n' +
  'Run `npm run generate` after changing the language pack.';

const numEntries = (obj) =>
  Object.entries(obj)
    .filter(([k]) => !k.startsWith('$'))
    .map(([k, v]) => [Number(k), v])
    .sort((a, b) => a[0] - b[0]);

// ---------------------------------------------------------------- TypeScript

function tsRecord(obj) {
  const body = numEntries(obj)
    .map(([k, v]) => `  ${k}: '${v}',`)
    .join('\n');
  return `{\n${body}\n}`;
}

function tsStringRecord(obj) {
  const body = Object.entries(obj)
    .filter(([k]) => !k.startsWith('$'))
    .map(([k, v]) => `  '${k}': '${v}',`)
    .join('\n');
  return `{\n${body}\n}`;
}

const ts = `// ${HEADER.split('\n').join('\n// ')}

export const BASE_0_10: Record<number, string> = ${tsRecord(pack.base0to10)};

export const TENS_BASE: Record<number, string> = ${tsRecord(pack.tensBase)};

export const HUNDREDS_BASE: Record<number, string> = ${tsRecord(pack.hundredsBase)};

export const TRADITIONAL_0_99: Record<number, string> = ${tsRecord(pack.traditional0to99)};

export const SCALE_WORDS_BIG: Array<{ value: bigint; word: string }> = [
${pack.scaleWords
  .slice()
  .sort((a, b) => b.exp - a.exp)
  .map((s) => `  { value: 10n ** ${s.exp}n, word: '${s.word}' },`)
  .join('\n')}
];

export const CLASSICAL_EXACT: Record<number, string> = ${tsRecord(pack.classicalUnits.exact)};

export const OKE = { value: ${pack.classicalUnits.oke.value}n, word: '${pack.classicalUnits.oke.word}' } as const;

export const ORDINALS_1_10: Record<number, string> = ${tsRecord(pack.ordinals1to10)};

export const PARTICLES = ${tsStringRecord(pack.particles)} as const;

export const OPERATOR_WORDS: Record<string, string> = ${tsStringRecord(pack.operators)};
`;

writeFileSync(join(root, 'src', 'lib', 'yorubaTables.generated.ts'), ts);

// --------------------------------------------------------------------- Swift

function swiftDict(obj) {
  const body = numEntries(obj)
    .map(([k, v]) => `        ${k}: "${v}",`)
    .join('\n');
  return `[\n${body}\n    ]`;
}

function swiftStringDict(obj) {
  const body = Object.entries(obj)
    .filter(([k]) => !k.startsWith('$'))
    .map(([k, v]) => `        "${k}": "${v}",`)
    .join('\n');
  return `[\n${body}\n    ]`;
}

// Swift Int is 64-bit: scale words above a quintillion (10^18) don't fit.
const swiftScales = pack.scaleWords
  .filter((s) => s.exp <= 18)
  .sort((a, b) => b.exp - a.exp)
  .map((s) => `        (${BigInt(10) ** BigInt(s.exp)}, "${s.word}"),`)
  .join('\n');

const swift = `// ${HEADER.split('\n').join('\n// ')}

import Foundation

public enum YorubaTables {
    public static let base0to10: [Int: String] = ${swiftDict(pack.base0to10)}

    public static let tensBase: [Int: String] = ${swiftDict(pack.tensBase)}

    public static let hundredsBase: [Int: String] = ${swiftDict(pack.hundredsBase)}

    public static let traditional0to99: [Int: String] = ${swiftDict(pack.traditional0to99)}

    /// Largest first. Capped at a quintillion (10^18) — the Int64 ceiling.
    public static let scaleWords: [(value: Int, word: String)] = [
${swiftScales}
    ]

    public static let classicalExact: [Int: String] = ${swiftDict(pack.classicalUnits.exact)}

    public static let okeValue: Int = ${pack.classicalUnits.oke.value}
    public static let okeWord: String = "${pack.classicalUnits.oke.word}"

    public static let ordinals1to10: [Int: String] = ${swiftDict(pack.ordinals1to10)}

    public static let particles: [String: String] = ${swiftStringDict(pack.particles)}

    public static let operatorWords: [String: String] = ${swiftStringDict(pack.operators)}
}
`;

writeFileSync(join(root, 'ios', 'Kaa', 'YorubaNumberTables.generated.swift'), swift);

console.log('Generated yorubaTables.generated.ts and YorubaNumberTables.generated.swift');
