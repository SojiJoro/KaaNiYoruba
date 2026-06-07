# Yorùbá Number Logic — Memory & Source of Truth

> **Status:** Canonical reference for Kàá's number engine.
> This file is the *memory* of the project: the place where the counting logic
> is researched, written down, and kept. Before changing
> `src/lib/yorubaNumbers.ts` or `ios/Kaa/YorubaNumberEngine.swift`, read this
> file. After changing the engine, update this file so the two never drift.
>
> Last researched: 2026-06. Sources are listed at the bottom.

---

## 0. Why this document exists

The earlier engine was correct for **0–99** but:

1. **Stopped being real Yorùbá above ~1,000** — it fell back to spelling each
   Arabic digit (`1000000` → "Ọ̀kan Òdo Òdo …"), which is not how the language
   counts.
2. **Used a questionable combiner for 100–999.** It emitted
   `"[remainder] ó lé ní [hundred]"` (remainder first, with a stray `ní`). The
   attested order is **base first**: `"[hundred] ó lé [remainder]"`, and it
   should switch to **`ó dín`** when the remainder sits within five of the next
   hundred.
3. **Never modelled the real large-number lexemes** — `igba` (200),
   `ọ̀ọ́dúnrún` (300), `irinwó` (400), `ẹgbàá` (2,000), `ọkẹ́` (20,000),
   `ẹgbẹ̀ẹ̀gbẹ̀rún` (1,000,000) — so the vigesimal system was invisible above
   the hundreds bases.

This document fixes the *knowledge* gap. The engine work tracks against it.

---

## 1. The system in one paragraph

Yorùbá counting (**Ònkà Yorùbá**) is **vigesimal** — base **20** (`ogún`) —
and leans heavily on **subtraction**. You build a number by naming the nearest
"anchor" (a multiple of ten) and then **adding** a small unit with **`lé`**
("exceeds / added to") or **subtracting** a small unit with **`dín`**
("falls short / reduced from"). The decisive rule:

> **Units 1, 2, 3, 4 are ADDED to the ten below.
> Units 5, 6, 7, 8, 9 are SUBTRACTED from the ten above.**

So 21 is "one **over** twenty" but 25 is "five **short of** thirty", and 28 is
"two short of thirty". This single rule, applied recursively over vigesimal
anchors, generates almost the whole system.

---

## 2. Two word-shapes: bare vs. counting (`m-`) form

Each small number has two surface forms:

| Value | Bare / nominal | Counting (`m-`) form — used when enumerating |
|------:|----------------|----------------------------------------------|
| 1 | ọ̀kan / ení | **ọ̀kan** |
| 2 | èjì | **méjì** |
| 3 | ẹ̀ta | **mẹ́ta** |
| 4 | ẹ̀rin | **mẹ́rin** |
| 5 | àrún(-ún) | **márùn-ún** |
| 6 | ẹ̀fà | **mẹ́fà** |
| 7 | èje | **méje** |
| 8 | ẹ̀jọ | **mẹ́jọ** |
| 9 | ẹ̀sàn(-án) | **mẹ́sàn-án** |
| 10 | ẹ̀wá | **mẹ́wàá** |

The **counting form** (with the `m-`/`mẹ́-` prefix) is what a calculator
should display, because the user is enumerating a quantity. Inside compounds
the root mutates for tone/vowel harmony (`mẹ́ta` → `…mẹ́tà…`,
`mẹ́rin` → `…mẹ́rìn…`). **Diacritics are not optional** — tone marks and the
sub-dot (ẹ, ọ, ṣ) are part of spelling and change meaning.

---

## 3. The two operators (and a third)

| Particle | Role | Gloss | Example |
|----------|------|-------|---------|
| **lé** | addition | "exceeds / is over" | 21 = `ọ̀kànlélógún` (one **over** 20) |
| **dín** | subtraction | "falls short / less" | 28 = `méjìdínlọ́gbọ̀n` (two **short of** 30) |
| **ọ̀nà / reduplication** | multiplication | "times" | 40 = `ogójì` = ogún×2 |

In longer compounds the linkers surface as standalone **`ó lé`** ("it exceeds")
and **`ó dín`** ("it is short"). The contracted prefixes **`àádín-` → `àád-`**
("ten less") and **`ẹ̀ẹ́dín-` → `ẹ̀ẹ́dẹ́-`** ("a hundred less") are frozen
versions of `dín`.

---

## 4. Units 0–10 (engine Tier 1)

```
0  Òdo
1  Ọ̀kan        6  Mẹ́fà
2  Méjì         7  Méje
3  Mẹ́ta         8  Mẹ́jọ
4  Mẹ́rin        9  Mẹ́sàn-án
5  Márùn-ún     10 Mẹ́wàá
```

`Òdo` (zero) is a modern borrowing; classical Yorùbá expressed "none" lexically
(`kò sí`). For a calculator, `Òdo` is correct.

---

## 5. Teens 11–19

11–14 **add** to ten (`-lá` = contracted `lé ẹ̀wá`); 15–19 **subtract** from
twenty (`-dínlógún` = "short of twenty"). 15 uses the older contracted
"five-into-twenty" form rather than a plain `dín`:

```
11 Mọ́kànlá          16 Mẹ́rìndínlógún
12 Méjìlá            17 Mẹ́tàdínlógún
13 Mẹ́tàlá            18 Méjìdínlógún
14 Mẹ́rìnlá           19 Mọ́kàndínlógún
15 Mẹ́ẹ̀dógún  (5-into-20, not Márùndínlógún)
```

---

## 6. The tens 20–200 (engine Tier 2)

Two kinds of tens:

**(a) Multiples of twenty** — `ogún × n`, basic and regular:

| Value | Word | Literal |
|------:|------|---------|
| 20 | **Ogún** | twenty |
| 40 | **Ogójì** | ogún × 2 |
| 60 | **Ọgọ́ta** | ogún × 3 |
| 80 | **Ọgọ́rin** | ogún × 4 |
| 100 | **Ọgọ́rùn-ún** | ogún × 5 |
| 120 | **Ọgọ́fà** | ogún × 6 |
| 140 | **Ọgọ́je** | ogún × 7 |
| 160 | **Ọgọ́jọ** | ogún × 8 |
| 180 | **Ọgọ́sàn** | ogún × 9 |
| 200 | **Igba** | (basic lexeme — *not* ogún × 10) |

**(b) The "odd" tens** — formed by **subtracting 10** from the next multiple of
twenty, with the prefix `àád(ọ́)-` ("ten less than"):

| Value | Word | Literal |
|------:|------|---------|
| 30 | **Ọgbọ̀n** | (basic lexeme) |
| 50 | **Àádọ́ta** | 60 − 10 |
| 70 | **Àádọ́rin** | 80 − 10 |
| 90 | **Àádọ́rùn** | 100 − 10 |
| 110 | **Àádọ́fà** | 120 − 10 |
| 130 | **Àádọ́je** | 140 − 10 |
| 150 | **Àádọ́jọ** | 160 − 10 |
| 170 | **Àádọ́sàn** | 180 − 10 |

(30 is irregular — a basic word, not `àád-`.)

---

## 7. The general algorithm for 1–199

```
to_yoruba(n):                       # 1 ≤ n ≤ 199
    u = n mod 10                    # unit digit
    if u == 0:        return TEN[n]           # exact ten, from §6
    if u in {1,2,3,4}:                          # ADD to ten below
        anchor = floor(n/10)*10
        return UNIT[u] + "lé" + TEN[anchor]    # e.g. 21, 32, 143
    if u in {5,6,7,8,9}:                        # SUBTRACT from ten above
        anchor = ceil(n/10)*10
        return UNIT[10-u] + "dín" + TEN[anchor] # e.g. 26→4 short of 30
```

Surface spelling needs tone/vowel-harmony glue (`lé` → `lél…/lélá…`,
`dín` → `dínl…/dínlá…`), which is why the engine keeps an **explicit,
hand-verified 0–99 table** instead of generating strings. The algorithm above
is the *meaning*; the table is the *spelling*. The special cases that resist
generation are **15** (`Mẹ́ẹ̀dógún`) and **25** (`Mẹ́ẹ̀dọ́gbọ̀n`), which use the
older "five-into" contraction rather than `dín`.

---

## 8. Hundreds 100–1,000 (engine Tier 3)

The hundreds are built on **`igba` (200)**. The prefix **`ẹgbẹ̀-`** means
`igba × n` (200 × n):

| Value | Word | Literal |
|------:|------|---------|
| 100 | **Ọgọ́rùn-ún** | 20 × 5 |
| 200 | **Igba** | basic |
| 300 | **Ọ̀ọ́dúnrún** | basic (≈ 20 × 15) |
| 400 | **Irinwó** | basic (≈ 20 × 20) |
| 500 | **Ẹ̀ẹ́dẹ́gbẹ̀ta** | 600 − 100 |
| 600 | **Ẹgbẹ̀ta** | igba × 3 |
| 700 | **Ẹ̀ẹ́dẹ́gbẹ̀rin** | 800 − 100 |
| 800 | **Ẹgbẹ̀rin** | igba × 4 |
| 900 | **Ẹ̀ẹ́dẹ́gbẹ̀rún** | 1,000 − 100 |
| 1,000 | **Ẹgbẹ̀rún** | igba × 5 |

Note the **alternating pattern**: even hundreds (600, 800, 1000) are clean
multiples of 200 (`ẹgbẹ̀-`), and odd hundreds (500, 700, 900) are
"**a hundred less**" than the next even hundred (`ẹ̀ẹ́dẹ́-`). 300 and 400 keep
their own basic words.

---

## 9. Thousands and the large vigesimal units

| Value | Traditional | Literal / note |
|------:|-------------|----------------|
| 1,000 | **Ẹgbẹ̀rún** | igba × 5 |
| 2,000 | **Ẹgbàá** (= Ẹgbẹ̀wá) | igba × 10 |
| 4,000 | **Ẹgbàájì** | ẹgbàá × 2 |
| 20,000 | **Ọkẹ́ kan** | one "bag" (the big classical unit) |
| 40,000 | **Ọkẹ́ méjì** | ọkẹ́ × 2 |
| 1,000,000 | **Ẹgbẹ̀ẹ̀gbẹ̀rún** | 1,000 × 1,000; also `àádọ́ta ọkẹ́` (50 bags) |

Above the hundreds the classical system gets genuinely irregular and
dialect-specific (cowrie-counting math: a "bag" `ọkẹ́` = 20,000 cowries; a
"head" `orí` = 2,000). **For a calculator, prefer the modern decimal forms in
§10**, and reserve the classical large units for the learning/reference screens
where their cultural logic is the point.

---

## 10. Modern decimal forms (recommended for results > 200)

Contemporary speech — and all school maths, money, and phone numbers — uses a
transparent **decimal-style** layer that mirrors English place value and joins
parts with **`àti`** ("and"):

```
100   Ọgọ́rùn-ún
200   Ọgọ́rùn-ún méjì          (or Igba)
500   Ọgọ́rùn-ún márùn-ún      (or Ẹ̀ẹ́dẹ́gbẹ̀ta)
1,000 Ẹgbẹ̀rún (kan)
2,000 Ẹgbẹ̀rún méjì
10,000 Ẹgbẹ̀rún mẹ́wàá
1,000,000 Mílíọ̀nù kan
105   Ọgọ́rùn-ún àti Márùn-ún
1,234 Ẹgbẹ̀rún (kan) àti Igba àti Mẹ́rìnlélọ́gbọ̀n
```

This is why Kàá ships **two modes**:

* **Traditional** — vigesimal + subtractive (`§7`, `§8`); the cultural system.
* **Modern** — decimal-additive with `àti`; how most people read big numbers
  and money today.

---

## 11. Combining full compound numbers (the corrected rule)

For a number `N = base + r` (base = the largest table value ≤ N, r = remainder):

* **Traditional, base ≥ 100:** put the **base first**, then the linker, then the
  remainder.
  * If `r` is small and the next base is close, use **`ó dín`** (short of):
    `595 = Ẹgbẹ̀ta ó dín Márùn-ún` (600 − 5).
  * Otherwise use **`ó lé`** (over):
    `105 = Ọgọ́rùn-ún ó lé Márùn-ún`; `555 = Ẹ̀ẹ́dẹ́gbẹ̀ta ó lé Márùndínlọ́gọ́ta`.
* **Modern:** join every part with **`àti`**, largest first:
  `555 = Ọgọ́rùn-ún márùn-ún àti Àádọ́ta àti Márùn-ún`.

> **This corrects the old engine**, which wrote
> `"[remainder] ó lé ní [hundred]"` (remainder-first, stray `ní`). Base-first
> with `ó lé` / `ó dín` and no `ní` is the attested order. Exact vowel elision
> at the join (`ọ́ lé` vs `ó lé`) varies by dialect and is flagged for a fluent
> speaker.

---

## 12. Operator vocabulary (for the calculator)

| Symbol | Yorùbá | Literal |
|--------|--------|---------|
| `+` | **pẹ̀lú** | with |
| `−` | **yọ** | take away |
| `×` | **ìṣẹ́po / ìgbà** | times |
| `÷` | **pín sí** | divide into |
| `=` | **dọ́gba** | equals |
| `.` (point) | **ààmì** | mark |
| `−n` (negative) | **òdì** | negative |

The decimal point is read as a separator and the fractional digits are read
**one by one** (`2.5` → `Méjì ààmì Márùn-ún`), matching how speakers say
fractions aloud.

---

## 13. Beyond cardinals (reference layer the app can teach)

* **Ordinals** — prefix `ìk-`/`ẹk-`: 1st `àkọ́kọ́`/`ìkíní`, 2nd `ìkejì`,
  3rd `ìkẹta`, 4th `ìkẹrin`, 10th `ìkẹwàá`.
* **"How many" / counting people** — uses `mẹ́ji`, `mẹ́ta` … with `ènìyàn`:
  `ènìyàn mẹ́ta` = three people.
* **Money (`owó`)** — historically counted in cowries by the `ọkẹ́` (bag,
  20,000) and `orí` (head, 2,000). Modern Naira just uses the cardinal +
  `náírà`: `₦500 = náírà ẹ̀ẹ́dẹ́gbẹ̀ta`.
* **Distributives** — reduplication: `méjìméjì` = "two by two / in twos".

These are not needed for arithmetic but are excellent **Learn-mode** content.

---

## 14. Known limits & review flags

1. **15 / 25** use the irregular "five-into" form (`Mẹ́ẹ̀dógún`,
   `Mẹ́ẹ̀dọ́gbọ̀n`) — keep them as table entries, never generate.
2. **`ó lé` vs `ọ́ lé` elision** at hundred/thousand joins is dialect-variable.
3. **Classical large units** (`ọkẹ́`, `orí`, cowrie math) are irregular; the app
   uses modern decimal forms for arithmetic and reserves the classical forms for
   teaching.
4. Any value the engine cannot name in real Yorùbá should fall back to the
   **modern decimal** construction (§10) — **not** to digit-by-digit spelling,
   except for true digit strings (phone numbers, IDs, leading zeros).

---

## 15. Verification corpus (must stay green in both engines)

```
0   Òdo                 15  Mẹ́ẹ̀dógún            75  Márùndínlọ́gọ́rin
5   Márùn-ún            20  Ogún                 100 Ọgọ́rùn-ún
10  Mẹ́wàá               25  Mẹ́ẹ̀dọ́gbọ̀n          200 Igba
11  Mọ́kànlá             35  Márùndínlógójì       300 Ọ̀ọ́dúnrún
14  Mẹ́rìnlá             50  Àádọ́ta               400 Irinwó
                        500 Ẹ̀ẹ́dẹ́gbẹ̀ta          1000 Ẹgbẹ̀rún

105 (trad) Ọgọ́rùn-ún ó lé Márùn-ún       (modern) Ọgọ́rùn-ún àti Márùn-ún
595 (trad) Ẹgbẹ̀ta ó dín Márùn-ún
2000 (trad) Ẹgbàá                          (modern) Ẹgbẹ̀rún méjì
20000 (trad) Ọkẹ́ kan
```

Keep this list mirrored in `src/lib/yorubaNumbers.test.ts` and
`ios/KaaTests/YorubaNumberEngineTests.swift`.

---

## Sources

Cross-checked against multiple references (full-page fetches were blocked in the
build environment; the following were read via search excerpts and prior
linguistic descriptions):

- [Yoruba numerals — Wikipedia](https://en.wikipedia.org/wiki/Yoruba_numerals)
- [Numbers in Yoruba — Omniglot](https://www.omniglot.com/language/numbers/yoruba.htm)
- [Yoruba/Numbers — Wikibooks](https://en.wikibooks.org/wiki/Yoruba/Numbers)
- [Yoruba Numerals Made Easy — NKENNE](https://www.nkenne.com/blog/yoruba-numerals-made-easy-counting-from-1-to-100-like-a-local)
- [Ònkà Yorùbá — Numbers & Numbering System (A. A. Adebola)](https://drbiggie.wordpress.com/2013/11/19/onka-yoruba-numbers-numbering-system-in-yoruba-by-ahmed-adebayo-adebola/)
- Standard grammars: Abraham, *Dictionary of Modern Yoruba* (1958);
  Bamgboṣe, *A Grammar of Yoruba* (1966).
</content>
</invoke>
