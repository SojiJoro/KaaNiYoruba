# Kọ́ Ẹ̀kọ́ — learning design (research-based)

Why the Learn tab is built the way it is. Written for future contributors and
for grant applications (this is evidence-based design, cite it).

## Research the design rests on

1. **Early numeracy is pre-literate.** Children build number sense through
   *subitizing* (instantly recognizing 1–3 items at age ~2, up to 5 by age
   4–5), one-to-one correspondence counting, and the *cardinality principle*
   (the last count word tells you how many). Counting skill develops in
   phases: subitize small sets → learn the count sequence → count objects →
   understand cardinality. So the youngest track uses objects and quantities,
   never text input.
   ([Hechinger Report on subitizing](https://hechingerreport.org/proof-points-subitizing/),
   [Learning Trajectories: Subitizing](https://www.learningtrajectories.org/math/learning-trajectories/subitizing),
   [Early Number Concepts — FHSU Pressbooks](https://fhsu.pressbooks.pub/ecumath/chapter/chapter-9-early-number-concepts-number-sense/),
   [HeadStart.gov: Number Recognition and Subitizing](https://headstart.gov/video/math-number-recognition-subitizing))
2. **Spelling is learned by segmenting and building, not memorizing strings.**
   Effective spelling instruction starts at the syllable level (segmenting,
   blending, Elkonin-style boxes) and uses manipulable tiles to *build* words.
   Yorùbá's strict (C)V syllable structure makes syllable tiles a perfect
   fit — and far kinder than hunting for ẹ́/ọ̀/ṣ on a keyboard.
   ([Reading Rockets: Blending and Segmenting Games](https://www.readingrockets.org/classroom/classroom-strategies/blending-and-segmenting-games),
   [NWEA: science of reading and decoding](https://www.nwea.org/blog/2025/what-the-science-of-reading-tells-us-about-how-to-teach-decoding-including-phonics/),
   [My Teaching Cupboard: phonemic awareness strategies](https://www.myteachingcupboard.com/blog/effective-strategies-for-teaching-phonemic-awareness))
3. **Games beat repetition for vocabulary, across cultures and ages.**
   Game-based vocabulary teaching consistently outperforms rote repetition in
   controlled studies with young learners, including for heritage-language
   learners specifically.
   ([SAGE: educational games for vocabulary, quasi-experimental](https://journals.sagepub.com/doi/full/10.1177/21582440221079806),
   [Springer: digital traditional games for vocabulary](https://link.springer.com/article/10.1007/s44217-025-00485-8),
   [Mobile Games for Heritage Language Learning](https://www.academia.edu/11591682/Mobile_Games_for_Heritage_and_Foreign_Language_Learning_and_Revitalization))
4. **Short sessions + immediate feedback + spaced repetition + streaks.**
   Spaced repetition measurably improves retention; streak-style social
   mechanics sustain daily use far better than badges alone.
   ([Spaced repetition in undergraduate learning, PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12343689/),
   [Educational App Store: what effective learning apps look like](https://www.educationalappstore.com/blog/what-effective-learning-apps-look-like))

## The four age tracks

| Track | Ages | What research says they need | Exercise kinds |
|---|---|---|---|
| **Àwọn kékeré** | 4–6 | Quantities before symbols: subitizing, tap-to-count, cardinality, count sequence. Big targets, zero typing, zero reading required. | count objects, subitize patterns, what-comes-next, match quantity↔number |
| **Àwọn ọmọdé** | 7–9 | Word recognition and first spelling: segmenting/blending, syllable building for 0–20 and the tens. | pick-the-word, syllable builder, missing syllable, match pairs, sequence |
| **Àwọn ọ̀dọ́** | 10–13 | The *system*: the lé (add) and dín (subtract) rules, anchors, two-way translation to 100. | anchor rule, pick word/number both ways, type the number, missing syllable |
| **Àwọn àgbà** | adults | Full range fast: hundreds and compounds, classical units, money, with misses resurfaced. | everything above 100–1,000+, money, classical units, type both ways |

## Session mechanics

- **8 questions per session** (2–4 minutes), ★/★★/★★★ by accuracy (5/7/8 of 8).
- **Immediate feedback** with the Kí ló dé? decomposition where it applies —
  the wrong answer becomes a tiny lesson in the lé/dín system.
- **Review queue (Leitner-lite):** numbers answered wrongly are stored and up
  to two are injected into each later session until answered correctly twice.
- **Daily streak** carries over from the old Learn mode; level map shows stars
  per level so kids (and parents) see progress.
- The **mode toggle** (traditional/modern) applies to all tracks, so diaspora
  parents can choose which system their child drills.

## Deliberately not in v1

Timers (stressful for the youngest, penalize thoughtful counting), sounds
(blocked on the recording plan — `docs/audio/recording-plan.md`; listen-and-pick
exercises slot in the moment clips exist), accounts/leaderboards (offline-first,
no data collection).
