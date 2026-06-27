# Kàá — pronunciation recording plan

One sitting (~45–60 min) yields everything tap-to-hear needs for 0–1,000.
PR #18 removed browser TTS for good reason: tone is the heart of Yorùbá
numbers, and only a human voice teaches it. These are the recordings that
replace it.

## Who records

A fluent speaker with clear tone production — ideally the same person who
does the native review (one session can cover both).

## What to record (129 clips)

| Group | Items | Count |
|---|---|---|
| Units & teens | 0–20, each as its standalone cardinal | 21 |
| Twenties–nineties | every number 21–99 is compound; record the 8 round tens (30…100) plus all 79 compounds *or* (minimum set) just 21–99 odd/even samples — full set recommended | 79 |
| Hundred anchors | 100–1000 by hundreds (Ọgọ́rùn-ún, Igba, Ọ̀ọ́dúnrún, Irinwó, Ẹ̀ẹ́dẹ́gbẹ̀ta, Ẹgbẹ̀ta, Ẹ̀ẹ́dẹ́gbẹ̀rin, Ẹgbẹ̀rin, Ẹ̀ẹ́dẹ́gbẹ̀rún, Ẹgbẹ̀rún) | 10 |
| Particles | ó lé, ó dín, àti, ààmì, Òdì, kan | 6 |
| Classical units | Ẹgbàá, Ẹgbàájì, Ọkẹ́ | 3 |
| Scale words | Mílíọ̀nù, Bílíọ̀nù, Tirílíọ̀nù | 3 |
| Operators | pẹ̀lú, yọ, ìgbà, pín sí, dọ́gba, ní ọ̀nà, náírà, kọ́bọ̀ | 8 |

With particles recorded separately, compounds above 100 can be stitched
(base + particle + remainder), so 129 clips cover every number the engine
can name. Record compounds 100–199 too if time allows — stitched audio is
serviceable, single-breath recordings are beautiful.

## Technical spec

- Quiet room, phone is fine if 30 cm from the mouth; laptop fan off.
- Format: WAV or highest-quality m4a; we convert to web formats afterwards.
- 44.1 kHz, mono. Aim for consistent volume; do not whisper the particles.
- Each clip: half a second of silence before and after; natural speed.
- One take per word is fine; re-record only on stumbles.

## File naming

`public/audio/yo/<key>.mp3` where key is the number (`35.mp3`), the particle
name (`o-le.mp3`, `o-din.mp3`, `aami.mp3`), or the word in ASCII
(`egbaa.mp3`, `oke.mp3`, `milionu.mp3`, `pelu.mp3`).

## After recording

Drop the files in `public/audio/yo/` and open an issue titled "Audio ready" —
wiring tap-to-hear to those files is a small, already-scoped code task
(roadmap items 11–14 in `docs/app-roadmap-50.md`).
