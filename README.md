# Káà — Yoruba Number & Calculator App

A calculator that teaches and preserves Yoruba counting logic. Káà is not a translation of a calculator — it is a Yoruba-first numeric experience. Every digit, expression, and result is rendered in proper Yoruba with diacritics intact, alongside small Arabic numerals for reference.

This repository contains two implementations sharing the same number engine logic:

- **Repo root** — Next.js 14 (App Router) + TypeScript + Tailwind CSS, deployable to Vercel.
- **`ios/`** — SwiftUI (iOS 16+), Xcode project source.

---

## 1. Product specification

### 1.1 Core concept

Káà ("Káà" meaning "house/room" — a cultural home for numbers) is a calculator that:

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
| 5 | Number converter (Arabic → Yoruba, 0–1,000) | Implemented |
| 6 | Traditional Yoruba mode (subtractive) | Implemented (verified 0–99, hundreds need native review) |
| 7 | Modern Yoruba mode (additive only) | Implemented |
| 8 | History of calculations | Implemented |
| 9 | Audio pronunciation placeholder | Implemented (button + hook for TTS/recorded audio) |
| 10 | Learning mode (children) | Implemented (0–20 flashcards with quiz) |

### 1.3 Yoruba operator vocabulary

| Symbol | Yoruba | Literal |
|--------|--------|---------|
| `+`    | `pẹ̀lú` | with |
| `−`    | `yọ`   | take away |
| `×`    | `ìgbà` | times |
| `÷`    | `pín sí` | divide into |
| `=`    | `dọ́gba` | equals |

### 1.4 Design direction

- **Background:** warm off-white `#FAF7F0`
- **Primary text:** deep brown `#3D2417`
- **Accent:** soft green `#7A9E7E` (operators, result emphasis)
- **Pattern:** subtle adire/aso-oke-inspired SVG motif at low opacity
- **Typography:** geometric sans for digits, humanist serif option for Yoruba words on result screens
- Dark mode reverses the brown background, lifts text to warm cream `#F5EBDF`, keeps the green accent.

---

## 2. UI layout plan

```
┌──────────────────────────────────────┐
│  Káà            ●Trad ○Modern  🎧    │ ← top bar: mode toggle + audio
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

## 4. Native speaker review needed

The traditional Yoruba number engine is well-attested for 0–99. For 100–1000 the published sources diverge on combining forms (`lé` vs `ó` linker, vowel elision at hundred boundaries). Entries flagged with `// REVIEW:` in `src/lib/yorubaNumbers.ts` should be verified by a fluent speaker before shipping.
