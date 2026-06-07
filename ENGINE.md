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

For 100–999 non-multiples of 100 we apply a **programmatic** combining rule (see below) and flag those entries for native-speaker review.

## Why tier 4 is hand-coded

You'd expect 11–99 to be derivable from rules like:

> for n in [10..19]: `unit-of(n-10) + 'lá'`  → 11 = Mọ́kànlá, 12 = Méjìlá
> for n in [11..19] if n%10 in {5..9}: `unit-of(20-n) + 'dín' + 'lógún'`  → 16 = Mẹ́rìndínlógún

That's mostly true. **But** the unit forms morph when they enter a compound (e.g. `Mẹ́ta` → `Mẹ́tà`, `Mẹ́rin` → `Mẹ́rìn`), and 15 and 25 use a contracted "in/to" form rather than a "less than" form:

- 15 = **Mẹ́ẹ̀dógún** (literally "five in twenty"), not Márùndínlógún
- 25 = **Mẹ́ẹ̀dọ́gbọ̀n** ("five in thirty")
- 35 = **Márùndínlógójì** ("five less than forty") — back to the regular pattern

These exceptions are easy to mis-handle algorithmically and easy to verify in a table, so we use a table.

## Combining rule for hundreds

For 100–999 non-multiples (e.g. 105, 250, 595), we apply:

- **Traditional:** `[remainder] ó lé ní [hundred]` — e.g. 105 → `Márùn-ún ó lé ní Ọgọ́rùn-ún`
- **Modern:** `[hundred] àti [remainder]` — e.g. 105 → `Ọgọ́rùn-ún àti Márùn-ún`

Fluent speakers report dialectal variation here (vowel elision, choice of linker), so these forms carry a `REVIEW:` comment in the source and should be confirmed before shipping.

## Operator words

| Symbol | Yoruba | Meaning |
|---|---|---|
| `+` | `pẹ̀lú` | with |
| `−` | `yọ` | take away |
| `×` | `ìgbà` | times |
| `÷` | `pín sí` | divide into |
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

See `src/lib/yorubaNumbers.test.ts` (40 cases) and `ios/KaaTests/YorubaNumberEngineTests.swift` (same coverage). Adding a case is one line:

```ts
{ n: 19, trad: 'Mọ́kàndínlógún' }
```

## Limitations

1. Hundreds combining forms (101–999 non-multiples) are programmatic and flagged for review.
2. Numbers above 1,000 currently fall back to the Arabic numeral — extending past 1,000 requires another layer (Ẹgbẹ̀wá for 2,000, Ẹgbàá for 2,000 in some dialects, etc.) and a fluent speaker.
3. The audio button uses `AVSpeechSynthesisVoice(language: "yo-NG")` / Web Speech API `lang="yo-NG"`. Neither platform ships a high-quality Yoruba TTS voice on every device; production deployments should bundle recorded clips.
