# Káà — 50 things that make it feel like a real app

A backlog of concrete, mostly self-contained improvements that move Káà from
"a calculator that prints Yorùbá words" to a product people open every day.
Grouped by theme; roughly ordered by impact within each group. Pair this with
`docs/yoruba-number-logic.md` (the counting source of truth).

## A. Core number engine (correctness first)
1. **Extend real Yorùbá past 1,000** using §9–§10 of the logic memory instead of digit-spelling.
2. **Fix the hundreds combiner** to base-first `ó lé` / `ó dín` (drop the stray `ní`).
3. **Add classical large units** — `igba` (200), `ọ̀ọ́dúnrún` (300), `ẹgbàá` (2,000), `ọkẹ́` (20,000).
4. **Single source of truth** — generate the Swift and TS tables from one shared JSON so they can't drift.
5. **Property-based tests** — round-trip Yorùbá → number for the whole 0–9,999 range.
6. **Native-speaker review pass** on every `// REVIEW` entry, then remove the flags.
7. **Ordinals** (`àkọ́kọ́`, `ìkejì`, `ìkẹta`…) as a selectable output mode.
8. **Fraction & decimal phrasing** that reads fractional digits one-by-one (`2.5 → Méjì ààmì Márùn-ún`).
9. **Negative / percentage / scientific** results all get proper Yorùbá phrasing.
10. **Money mode** — format results as `₦` / `naira` with correct cardinal agreement.

## B. Audio & pronunciation (the feature people will love)
11. **Bundle recorded human audio** for 0–20, the tens, and the hundreds bases (don't rely on `yo-NG` TTS).
12. **Tap-to-hear** on every digit button and every result.
13. **Syllable-by-syllable playback** with the word highlighting as it speaks.
14. **Adjustable speech speed** (slow for learners, natural for fluent users).
15. **Record-yourself + compare** so a learner can check their pronunciation.
16. **Offline audio cache** so pronunciation works with no network.

## C. Learning mode (turn it into an edtech product)
17. **Structured lessons** — units → teens → tens → subtraction rule → hundreds, each a short level.
18. **Spaced-repetition flashcards** (SM-2) that resurface numbers you get wrong.
19. **Quiz formats** — multiple choice, type-the-number, listen-and-pick.
20. **Streaks & daily goal** ("count every day") with a gentle reminder.
21. **XP, levels, and badges** ("Mastered the 5–9 subtraction rule").
22. **Progress dashboard** — which ranges are mastered vs. shaky.
23. **"Explain this number"** popover that decomposes e.g. 75 into `5 dín 80`.
24. **Number-of-the-day** push with its breakdown and a usage sentence.
25. **Kids mode** — bigger buttons, fewer numbers, playful sounds, no history clutter.

## D. Calculator UX
26. **Scientific / second keypad** (%, √, x², parentheses, memory M+/M−).
27. **Live Yorùbá expression preview** that updates as you type, above the result.
28. **Swipe-to-delete** a digit; long-press `C` to clear all.
29. **Haptic feedback** on key taps and on `=`.
30. **Copy result** as Yorùbá text, Arabic numeral, or both.
31. **Persistent, searchable history** with timestamps, stored locally.
32. **Pin / favourite** calculations and re-run them.
33. **Landscape & tablet layouts**; responsive breakpoints for the web build.
34. **Keyboard support** on web (number row, Enter = `=`, Backspace = ⌫).

## E. Polish, identity & accessibility
35. **App icon, splash screen, and a real name lockup** with the adire motif.
36. **Dark / light / system theme** with the warm-brown palette from the README.
37. **A couple of themed skins** (adire, aṣọ-òkè, plain) as a settings choice.
38. **Smooth micro-animations** — result flips in, buttons spring on press.
39. **Full screen-reader labels** in Yorùbá + English; dynamic-type / font scaling.
40. **High-contrast mode** and a colour-blind-safe accent.
41. **Onboarding** — 3 cards explaining "why Yorùbá counting is different" on first launch.
42. **Empty states** that teach (history empty → "Try 35: it's *five less than forty*").

## F. Platform, growth & "realness"
43. **PWA**: installable, offline-first, app manifest + service worker.
44. **Settings screen** — default mode, audio on/off, theme, reset progress.
45. **Localised UI** — toggle the chrome between Yorùbá and English.
46. **Share card generator** — a pretty image of a number + its Yorùbá name for social.
47. **Deep links / shortcuts** — `kaa://convert/75` and iOS Home-Screen quick actions.
48. **Analytics + crash reporting** (privacy-respecting) to see which ranges confuse users.
49. **App Store / Play / web landing page** with screenshots, and CI that ships it.
50. **Feedback + "report a wrong number" button** that files an issue with the value and mode.

---

### Suggested first sprint (highest impact, lowest risk)
`#2` fix the combiner · `#4` shared data source · `#11`+`#12` real audio for 0–100 ·
`#27` live preview · `#31` persistent history · `#35`+`#36` icon & dark mode ·
`#43` make it an installable PWA.

These seven turn the demo into something that looks and behaves like a shipped app
without waiting on the full large-number or lessons work.
</content>
