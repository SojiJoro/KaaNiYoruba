"use client";

import { useMemo, useState } from "react";
import { toYoruba, type YorubaMode } from "@/lib/yorubaNumbers";

interface LearningModeProps {
  mode: YorubaMode;
  onSpeak: (text: string) => void;
}

const RANGE_END = 20;

const COUNTING_INSIGHTS = [
  {
    title: "Base-20 backbone",
    yoruba: "Ogún ni ìpìlẹ̀",
    detail:
      "Traditional Yorùbá counting is vigesimal: 40 is read as two twenties, 60 as three twenties, and 80 as four twenties.",
    example: "40 → Ogójì • 60 → Ọgọ́ta • 80 → Ọgọ́rin",
    source: "NACLO Yoruba counting solution",
    sourceUrl: "https://naclo.org/resources/problems/2020/N2020-OS.pdf",
  },
  {
    title: "Count back near targets",
    yoruba: "Dín = count back",
    detail:
      "Numbers just before the next ten or score often subtract from a target, so 35 is five less than 40 and 75 is five less than 80.",
    example: "35 → Márùndínlógójì • 75 → Márùndínlọ́gọ́rin",
    source: "NACLO examples; Olubode-Sawe 2013",
    sourceUrl:
      "https://www.researchgate.net/publication/355043747_Sources_of_Complexity_in_the_Yoruba_Numeral_System_p_210-223",
  },
  {
    title: "Tone and compounding matter",
    yoruba: "Ohùn yí ọ̀rọ̀ padà",
    detail:
      "Research notes that number words combine arithmetic operations with phonological changes, so the spoken form can differ from a literal word-by-word build.",
    example: "19 → Mọ́kàndínlógún • 25 → Mẹ́ẹ̀dọ́gbọ̀n",
    source: "Olubode-Sawe, Sources of Complexity",
    sourceUrl:
      "https://www.researchgate.net/publication/355043747_Sources_of_Complexity_in_the_Yoruba_Numeral_System_p_210-223",
  },
  {
    title: "App fallback for every digit",
    yoruba: "Ka díjítì kọ̀ọ̀kan",
    detail:
      "Because long IDs, phone numbers, leading zeros, and decimal fractions are not always ordinary counting numbers, the app also spells each digit so no input falls back to raw Arabic numerals.",
    example: "007 → Òdo Òdo Méje • 12.05 → Méjìlá Ẹsẹ Òdo Márùn-ún",
    source: "Yoruba Decimal System notes",
    sourceUrl:
      "https://yoruba-scipedia.wikidot.com/wiki%3Amodification-of-yoruba-numeral-system-for-use-in-scienc",
  },
];

export function LearningMode({ mode, onSpeak }: LearningModeProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [quizChoice, setQuizChoice] = useState<string | null>(null);

  const correct = useMemo(() => toYoruba(index, mode), [index, mode]);
  const choices = useMemo(
    () => buildChoices(index, correct, mode),
    [index, correct, mode],
  );

  const next = () => {
    setIndex((i) => (i + 1) % (RANGE_END + 1));
    setRevealed(false);
    setQuizChoice(null);
  };

  const handleQuiz = (choice: string) => {
    if (quizChoice) return;
    setQuizChoice(choice);
    setRevealed(true);
    setScore((s) => ({
      right: s.right + (choice === correct ? 1 : 0),
      total: s.total + 1,
    }));
  };

  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-border bg-warm-cream px-6 py-6 shadow-card">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-deep-green">
            Kọ́ Ẹ̀kọ́ (Learn)
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Nọ́mbà 0–{RANGE_END} • Iye àbáyọ: {score.right}/{score.total}
          </p>
        </div>
        <button
          type="button"
          onClick={next}
          className="rounded-full bg-primary-green px-4 py-2 text-sm font-bold text-warm-cream transition-colors hover:bg-deep-green"
        >
          Tókàn →
        </button>
      </header>

      <div className="rounded-3xl border border-border bg-background/70 px-4 py-8 text-center">
        <div className="font-mono text-8xl font-bold leading-none text-text-dark">
          {index}
        </div>
        <div className="mt-4 min-h-[3rem] flex items-center justify-center">
          {revealed ? (
            <span className="font-serif text-3xl text-deep-green">
              {correct}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="text-sm text-muted underline"
            >
              Tẹ láti rí ìdáhùn
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => onSpeak(correct)}
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-green hover:underline"
        >
          <SpeakerIcon /> Gbọ́ pípè
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">
          Yan ìdáhùn tó tọ́
        </p>
        <div className="grid grid-cols-2 gap-2">
          {choices.map((c) => {
            const isPicked = quizChoice === c;
            const isCorrect = c === correct;
            const showCorrect = revealed && isCorrect;
            const showWrong = revealed && isPicked && !isCorrect;
            const klass = showCorrect
              ? "border-primary-green bg-primary-green text-warm-cream"
              : showWrong
                ? "border-error/30 bg-error/10 text-error"
                : "border-border bg-warm-cream text-text-dark hover:bg-pale-green";
            return (
              <button
                key={c}
                type="button"
                disabled={!!quizChoice}
                onClick={() => handleQuiz(c)}
                className={`rounded-2xl border px-3 py-3 font-serif text-base transition-colors ${klass}`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <section className="rounded-3xl border border-border bg-background/75 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Research notes
            </p>
            <h3 className="mt-1 font-serif text-2xl text-deep-green">
              Yorùbá number counting
            </h3>
          </div>
          <span className="rounded-full bg-pale-green px-3 py-1 text-xs font-bold text-primary-green">
            20-base
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {COUNTING_INSIGHTS.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border bg-warm-cream p-4 shadow-button"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-serif text-lg font-semibold text-deep-green">
                  {item.title}
                </h4>
                <span className="text-xs font-bold text-primary-green">
                  {item.yoruba}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
              <p className="mt-3 rounded-2xl bg-pale-green/70 px-3 py-2 font-serif text-sm text-deep-green">
                {item.example}
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted/80">
                Source:{" "}
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-green underline-offset-2 hover:underline"
                >
                  {item.source}
                </a>
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function buildChoices(n: number, correct: string, mode: YorubaMode): string[] {
  const set = new Set<string>([correct]);
  // Pick 3 distractors from the same 0..RANGE_END window.
  const pool: number[] = [];
  for (let i = 0; i <= RANGE_END; i++) if (i !== n) pool.push(i);
  // Shuffle deterministically by n so the same card always shows the same options.
  const seed = (a: number, b: number) =>
    ((a * 9301 + b * 49297) % 233280) / 233280;
  pool.sort((a, b) => seed(a, n) - seed(b, n));
  let i = 0;
  while (set.size < 4 && i < pool.length) {
    set.add(toYoruba(pool[i], mode));
    i++;
  }
  const arr = Array.from(set);
  arr.sort((a, b) => seed(a.length, n) - seed(b.length, n));
  return arr;
}

function SpeakerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}
