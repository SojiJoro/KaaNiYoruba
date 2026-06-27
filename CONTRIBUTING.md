# Contributing to Kàá

Thanks for considering a contribution. Kàá has two implementations sharing
one number engine, so changes to counting logic need to land in both places.

## Setup

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Yoruba engine test suite
npx tsc --noEmit      # typecheck
npm run build
```

The iOS app lives in `ios/` — see `ios/README.md` for the Xcode setup.

## Project structure

- `shared/yoruba-language-pack.json` is the **single source of truth** for
  Yorùbá number forms. Both the web (`src/lib/yorubaTables.generated.ts`) and
  iOS (`ios/Kaa/YorubaNumberTables.generated.swift`) tables are generated
  from it — never edit the generated files directly.
- After changing the language pack, run `npm run generate` to regenerate
  both tables. CI checks that the generated files are in sync with the
  source pack, so commit the regenerated output with your change.
- `docs/yoruba-number-logic.md` is the researched reference for the counting
  system itself (vigesimal tens, hundreds, thousands, the add/subtract
  rule). Read it before changing the engine; update it if your change
  affects the logic it documents.
- `ENGINE.md` documents how the current implementation works.

## Correcting or verifying Yorùbá forms

This is the contribution this project most needs. The traditional engine is
well-attested for 0–99; forms above 100 carry `// REVIEW:` comments where
published sources diverge.

1. Run `npm run review-packet`, which writes
   `docs/review/yoruba-review-packet.csv` — every generated form, with
   contested ones flagged, plus columns for corrections.
2. Work through it (a fluent speaker can do this in one sitting) and note
   any corrections.
3. Open a PR editing `shared/yoruba-language-pack.json` with the fixes, then
   run `npm run generate` to regenerate both tables, and `npm test` to
   confirm nothing broke.
4. Mention what you verified in the PR description — confirmed reviewers
   get credited in the README's "Ìmúdájú — verified by" section.

The language data itself is licensed CC-BY-SA-4.0 (see `shared/LICENSE`),
so corrections flow back under the same terms.

## Code contributions

- Keep the engine logic identical in TypeScript (`src/lib/yorubaNumbers.ts`)
  and Swift (`ios/Kaa/YorubaNumberEngine.swift`) — both pass the same test
  corpus, and CI will fail if the generated tables drift apart.
- Run `npm test`, `npx tsc --noEmit`, and `npm run build` before opening a PR.
- Keep PRs focused; explain the "why" in the description.

## Branding

The code is MIT-licensed, but the "Kàá" name, wordmark, and icon are
reserved — see `TRADEMARKS.md`. Forks should use their own name and
branding.

## Reporting issues

Open a GitHub issue. For incorrect Yorùbá forms, please point to the
published source you're comparing against if you have one (Abraham 1958;
Bamgboṣe 1966 are the engine's primary references).
