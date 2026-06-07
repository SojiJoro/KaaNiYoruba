# The Yoruba Number Engine

> **Canonical counting reference:** [`docs/yoruba-number-logic.md`](./docs/yoruba-number-logic.md)
> is the project's *logic memory* — the researched source of truth for the whole
> counting system (units, vigesimal tens, hundreds, thousands, `ọkẹ́`, combining
> rules, and the modern decimal layer). This file describes the current
> *implementation*; that file describes what the implementation should be.
> See also the product backlog in [`docs/app-roadmap-50.md`](./docs/app-roadmap-50.md).

This document explains how Kàá converts an Arabic integer into a Yoruba word. The same algorithm is implemented twice — once in TypeScript (`src/lib/yorubaNumbers.ts`) and once in Swift (`ios/Kaa/YorubaNumberEngine.swift`) — and both pass an identical test corpus.

## Why this isn't a simple lookup

Yoruba counting is **vigesimal** (base 20) and **subtractive at the upper half of each tens window**. A naive `"1: one, 2: two, ..."` table won't capture it. Consider 75:

> 75 = "five less than eighty" → **Márùndínlọ́gọ́rin**
> (márùn = 5, dín = less, lọ́gọ́rin = "of-eighty")

Or 35:

> 35 = "five less than forty" → **Márùndínlógójì**

So a number like 36 doesn't follow the European pattern "thirty-six". Instead it's "four less than forty" — Mẹ́rìndínlógójì.

## Four tiers

The engine layers four tables:

| Tier | Range | Strategy |
|------|-------|----------|
| 1 | 0–10 | Hand-coded canonicals: Òdo, Ọ̀kan, Méjì, ... |
| 2 | round tens 20–100 | Hand-coded base words: Ogún, Ọgbọ̀n, ... |
| 3 | hundreds 100, 200, 300, ..., 1000 | Hand-coded base words: Igba, Irinwó, Ẹgbẹ̀rún, ... |
| 4 | every other integer 11–99 | Hand-coded combinations of tiers 1+2 with subtractive logic |

Above the tables the engine is **generative** and runs on **BigInt**, so it names integers of any magnitude exactly. 100–999 combine a hundred base with a remainder; 1,000+ are grouped by scale words and the largest group is peeled off recursively. The scale words run `Ẹgbẹ̀rún` (10³), then the borrowed international names `Mílíọ̀nù` (10⁶), `Bílíọ̀nù` (10⁹), `Tirílíọ̀nù` (10¹²), `Kwadírílíọ̀nù` (10¹⁵), `Kwíntílíọ̀nù` (10¹⁸), `Sẹ́kítílíọ̀nù` (10²¹), `Sẹ́ptílíọ̀nù` (10²⁴), `Ọ́kítílíọ̀nù` (10²⁷), `Nónílíọ̀nù` (10³⁰), `Dẹ́sílíọ̀nù` (10³³). Typed numbers are named exactly to any length; a computed result beyond ~15 significant figures is first rounded to calculator precision (so its float noise becomes clean zeros). Only values above ~10³⁶ fall back to scientific notation, and only true digit strings (leading-zero codes, phone numbers, decimal fraction digits) are read digit-by-digit.

The Swift port reaches a quintillion (`Int` is 64-bit); the higher scales need the web engine's BigInt.

## Why tier 4 is hand-coded

You'd expect 11–99 to be derivable from rules like:

> for n in [10..19]: `unit-of(n-10) + 'lá'`  → 11 = Mọ́kànlá, 12 = Méjìlá
> for n in [11..19] if n%10 in {5..9}: `unit-of(20-n) + 'dín' + 'lógún'`  → 16 = Mẹ́rìndínlógún

That's mostly true. **But** the unit forms morph when they enter a compound (e.g. `Mẹ́ta` → `Mẹ́tà`, `Mẹ́rin` → `Mẹ́rìn`), and 15 and 25 use a contracted "in/to" form rather than a "less than" form:

- 15 = **Mẹ́ẹ̀dógún** (literally "five in twenty"), not Márùndínlógún
- 25 = **Mẹ́ẹ̀dọ́gbọ̀n** ("five in thirty")
- 35 = **Márùndínlógójì** ("five less than forty") — back to the regular pattern

These exceptions are easy to mis-handle algorithmically and easy to verify in a table, so we use a table.

## Combining rule for hundreds and above

For 100–999 non-multiples (e.g. 105, 250, 555):

- **Traditional:** base first, `[hundred] ó lé [remainder]` — e.g. 105 → `Ọgọ́rùn-ún ó lé Márùn-ún`, 555 → `Ẹ̀ẹ́dẹ́gbẹ̀ta ó lé Márùndínlọ́gọ́ta`. (This corrected the earlier remainder-first `… ó lé ní …` form.)
- **Modern:** `[hundred] àti [remainder]` — e.g. 105 → `Ọgọ́rùn-ún àti Márùn-ún`.

For 1,000 and above, the engine peels off the largest scale word, names the multiplier (`kan` for 1, otherwise the lower-cased number word), and recurses on the remainder. The join particle is **mode-dependent**: traditional keeps the vigesimal additive `ó lé` (consistent with the hundreds), modern uses the decimal `àti`:

> 1,024 (trad) → `Ẹgbẹ̀rún kan ó lé Mẹ́rìnlélógún` &nbsp;·&nbsp; (modern) → `Ẹgbẹ̀rún kan àti Mẹ́rìnlélógún`
> 1,258,222 (trad) → `Mílíọ̀nù kan ó lé Ẹgbẹ̀rún igba ó lé Méjìdínlọ́gọ́ta ó lé Igba ó lé Méjìlélógún`

Exact vowel elision at the joins (`ó lé` vs `ọ́ lé`) is dialect-variable; see `docs/yoruba-number-logic.md`.

## Operator words

| Symbol | Yoruba | Meaning |
|---|---|---|
| `+` | `pẹ̀lú` | with |
| `−` | `yọ` | take away |
| `×` | `ìgbà` | times |
| `÷` | `pín sí` | divide into |
| `^` | `ní ọ̀nà` | to the power of ("in n places") |
| `=` | `dọ́gba` | equals |

## Negatives and decimals

- **Negative integers** are rendered as `Òdì ` + positive form (e.g. `-3` → `Òdì Mẹ́ta`).
- **Decimals** are truncated for the headline Yoruba word; the small Arabic numeral on the right preserves the full precision. This matches how speakers naturally render fractional results in conversation (the integer part gets a name; the fraction stays numeric).

## Mode differences at a glance

| n | Traditional | Modern |
|---|---|---|
| 11 | Mọ́kànlá | Mọ́kànlá |
| 15 | Mẹ́ẹ̀dógún | Mẹ́wàá àti Márùn-ún |
| 25 | Mẹ́ẹ̀dọ́gbọ̀n | Ogún àti Márùn-ún |
| 35 | Márùndínlógójì | Ọgbọ̀n àti Márùn-ún |
| 75 | Márùndínlọ́gọ́rin | Àádọ́rin àti Márùn-ún |

Modern mode uses a decimal additive `[tens] àti [units]` form throughout 15–99, which is how the system is most often introduced in contemporary teaching materials. Traditional keeps the vigesimal subtractive logic.

## Hand-verified test corpus

See `src/lib/yorubaNumbers.test.ts` and `ios/KaaTests/YorubaNumberEngineTests.swift` (same coverage, including hundreds, thousands, millions). Adding a case is one line:

```ts
{ n: 19, trad: 'Mọ́kàndínlógún' }
```

## Limitations

1. The hundreds/thousands join particle (`ó lé` vs `ọ́ lé`, vowel elision) is dialect-variable; the engine uses a single consistent base-first `ó lé` form. Flagged for native-speaker confirmation in `docs/yoruba-number-logic.md`.
2. Large numbers use the **modern decimal** scale words (`Ẹgbẹ̀rún`, `Mílíọ̀nù`, …) rather than the irregular classical "bag" units (`Ẹgbàá` = 2,000, `Ọkẹ́` = 20,000). The classical units are documented for the Learn/reference layer; the decimal scale is what makes naming *any* number tractable.
3. Multipliers lower-case only their leading word (e.g. `Ẹgbẹ̀rún igba ó lé Méjìdínlọ́gọ́ta`); fully natural running text would lower-case throughout. This is a display convention, not a meaning change.
4. The audio button uses `AVSpeechSynthesisVoice(language: "yo-NG")` / Web Speech API `lang="yo-NG"`. Neither platform ships a high-quality Yoruba TTS voice on every device; production deployments should bundle recorded clips.
