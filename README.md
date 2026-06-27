# Kàá — Yoruba Number & Calculator App

A calculator that teaches and preserves Yoruba counting logic. Kàá is not a translation of a calculator — it is a Yoruba-first numeric experience. Every digit, expression, and result is rendered in proper Yoruba with diacritics intact, alongside small Arabic numerals for reference.

This repository contains two implementations sharing the same number engine logic:

- **Repo root** — Next.js 14 (App Router) + TypeScript + Tailwind CSS, deployable to Vercel.
- **`ios/`** — SwiftUI (iOS 16+), Xcode project source.

---

## 1. Product specification

### 1.1 Core concept

Kàá ("Kàá" meaning "house/room" — a cultural home for numbers) is a calculator that:

1. Renders every tapped number with its Yoruba word directly beneath it.
2. Renders every operator with its Yoruba word (`pẹ̀lú`, `yọ`, `ìgbà`, `pín sí`).
3. Displays calculation results as **Yoruba words primary, Arabic numerals secondary** — inverting the usual hierarchy.
4. Supports **two counting systems**: traditional vigesimal subtractive logic, and a modern additive simplification.

### 1.2 Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Calculator with +, −, ×, ÷ | Implemented |
| 2 | Yoruba word display under every input | Implemented |
| 3 | Yoruba result as the main output | Implemented |
| 4 | Tiny Arabic result on the right | Implemented |
| 5 | Number converter (Arabic → Yoruba, any safe integer) | Implemented (generative — no upper limit) |
| 6 | Traditional Yoruba mode (subtractive) | Implemented (verified 0–99 table; 100+ generated, join particle pending native review) |
| 7 | Modern Yoruba mode (additive only) | Implemented |
| 8 | History of calculations | Implemented |
| 9 | Learning mode (children) | Implemented (0–20 flashcards with quiz) |
| 10 | Onboarding welcome tour | Implemented (3 steps, counting-mode choice) |
| 11 | Settings (Ètò) | Implemented (counting system, palette, keypad style, pattern, dark mode, sound, data) |
| 12 | Voice pronunciation | UI disabled until native recordings are done (speech backend kept; flip `VOICE_ENABLED` to restore) |

### 1.3 Yoruba operator vocabulary

| Symbol | Yoruba | Literal |
|--------|--------|---------|
| `+`    | `pẹ̀lú` | with |
| `−`    | `yọ`   | take away |
| `×`    | `ìgbà` | times |
| `÷`    | `pín sí` | divide into |
| `=`    | `dọ́gba` | equals |

### 1.4 Design direction — "Adire Indigo"

- **Background:** warm cream `#F3EEE3`
- **Primary:** deep indigo `#25307A` (Yorùbá words, nav, emphasis)
- **Accent:** burnt clay `#BC5429` (equals key, speak buttons, highlights)
- **Pattern:** subtle adire dot-grid veil at low opacity (intensity adjustable in Ètò)
- **Typography:** Gentium Book Plus for Yorùbá words (renders tone marks beautifully), IBM Plex Sans for UI, IBM Plex Mono for numerals
- Dark mode deepens the indigo night palette; two alternate palettes (Forest Heritage, Clay & Ember) ship as settings.
- Yorùbá stays primary throughout; English is the quiet subtitle.

---

## 2. UI layout plan

```
┌──────────────────────────────────────┐
│  Kàá            ●Trad ○Modern       │ ← top bar: mode toggle
├──────────────────────────────────────┤
│                                      │
│   2 + 2                              │ ← expression line (Arabic, small)
│   Méjì pẹ̀lú Méjì                     │ ← expression line (Yoruba, medium)
│                                      │
│   Mérin              ╱ 4 ╲          │ ← result (Yoruba, huge) + tiny Arabic right
│                                      │
├──────────────────────────────────────┤
│  ┌────┬────┬────┬────┐               │
│  │ C  │ ⌫ │ ÷  │ ×  │               │
│  ├────┼────┼────┼────┤               │
│  │ 7  │ 8  │ 9  │ −  │               │
│  ├────┼────┼────┼────┤               │
│  │ 4  │ 5  │ 6  │ +  │               │
│  ├────┼────┼────┼────┤               │
│  │ 1  │ 2  │ 3  │    │               │
│  ├────┼────┤    │ =  │               │
│  │ 0  │ .  │    │    │               │
│  └────┴────┴────┴────┘               │
├──────────────────────────────────────┤
│  History  ·  Converter  ·  Learn     │ ← tab bar
└──────────────────────────────────────┘
```

Each digit button displays the Arabic numeral large and the Yoruba word small beneath:

```
┌──────┐
│  2   │
│ Méjì │
└──────┘
```

---

## 3. Deployment

See [`WEB.md`](./WEB.md) for Vercel deployment steps and [`ios/README.md`](./ios/README.md) for Xcode setup.

Quick start:

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # 40 Yoruba engine test cases
npm run build        # production build
```

Then connect the repo to Vercel — leave Root Directory as the default (`.`) and Vercel will detect Next.js automatically.

---

## 4. Counting logic (source of truth)

The full, researched counting system — vigesimal tens, hundreds, thousands,
`ọkẹ́` (20,000), the add/subtract rule, the corrected hundreds combiner, and the
modern decimal layer — lives in **[`docs/yoruba-number-logic.md`](./docs/yoruba-number-logic.md)**.
Read it before touching the engine; update it when you change the engine.

The product backlog (50 concrete steps toward a shipped app) is in
**[`docs/app-roadmap-50.md`](./docs/app-roadmap-50.md)**.

## 5. Native speaker review

The traditional engine is well-attested for 0–99. For 100–1,000 published sources diverge on combining forms (`ó lé` vs `ó dín` cut-over, vowel elision at hundred boundaries); those spots carry `// REVIEW:` comments in both engines.

To review, run `npm run review-packet` — it writes `docs/review/yoruba-review-packet.csv`, a spreadsheet of every generated form (with the contested ones flagged) plus columns for corrections. A fluent speaker can work through it in one sitting; corrections go into `shared/yoruba-language-pack.json` (the single source of truth for the web and iOS engines — regenerate with `npm run generate`).

### Ìmúdájú — verified by

*This section credits the fluent speakers who have verified the engine's output. Awaiting first review.*

## 6. Contributing

Contributions are welcome — especially native-speaker corrections to the
Yorùbá forms above 100. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for setup,
the language-pack workflow, and the review-packet process. Please also read
the [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## 7. Support

Kàá is free, with no paid tiers, accounts, or locked features — that's
permanent, not a trial. If you'd like to support development, look for a
"Sponsor" button on this repository (configured in
[`.github/FUNDING.yml`](./.github/FUNDING.yml)); donations are entirely
optional.

## 8. License

The code in this repository is licensed under the [MIT License](./LICENSE).

The Yorùbá language data in [`shared/yoruba-language-pack.json`](./shared/yoruba-language-pack.json)
is licensed separately under [CC-BY-SA-4.0](./shared/LICENSE) — share and
adapt it freely, with attribution, under the same terms.

The "Kàá" name, wordmark, and app icon are reserved — see
[`TRADEMARKS.md`](./TRADEMARKS.md).
