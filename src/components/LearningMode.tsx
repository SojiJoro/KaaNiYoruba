"use client";

import { useEffect, useMemo, useState } from "react";
import { explainNumber, toYoruba, type YorubaMode } from "@/lib/yorubaNumbers";

interface LearningModeProps {
  mode: YorubaMode;
}

// ---- Levels: units → teens → the dín rule → tens → hundred anchors ---------

interface Level {
  id: string;
  title: string;
  subtitle: string;
  pool: number[];
}

const range = (from: number, to: number, step = 1) => {
  const out: number[] = [];
  for (let n = from; n <= to; n += step) out.push(n);
  return out;
};

const LEVELS: Level[] = [
  { id: "units", title: "Àwọn ìpìlẹ̀", subtitle: "Units 0–10", pool: range(0, 10) },
  { id: "teens", title: "Lé àti dín", subtitle: "Teens 11–20", pool: range(11, 20) },
  {
    id: "din-rule",
    title: "Òfin dín",
    subtitle: "The subtraction rule, 21–40",
    pool: range(21, 40),
  },
  {
    id: "tens",
    title: "Ogún-ogún",
    subtitle: "Round tens to 100",
    pool: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  },
  {
    id: "hundreds",
    title: "Igba àti ẹgbẹ̀-",
    subtitle: "Hundred anchors",
    pool: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
  },
];

// ---- Local progress: per-level scores and a daily streak --------------------

interface Progress {
  scores: Record<string, { right: number; total: number }>;
  streak: number;
  lastDay: string; // YYYY-MM-DD
}

const PROGRESS_KEY = "kaa-learn-progress";

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to a fresh start
  }
  return { scores: {}, streak: 0, lastDay: "" };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function bumpStreak(p: Progress): Progress {
  const day = today();
  if (p.lastDay === day) return p;
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  return { ...p, streak: p.lastDay === yesterday ? p.streak + 1 : 1, lastDay: day };
}

// ---- Component --------------------------------------------------------------

type QuizKind = "pick-word" | "type-number";

export function LearningMode({ mode }: LearningModeProps) {
  const [levelId, setLevelId] = useState(LEVELS[0].id);
  const [questionSeed, setQuestionSeed] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [quizChoice, setQuizChoice] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [progress, setProgress] = useState<Progress>({ scores: {}, streak: 0, lastDay: "" });

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const level = LEVELS.find((l) => l.id === levelId)!;
  const n = level.pool[questionSeed % level.pool.length];
  const kind: QuizKind = questionSeed % 3 === 2 ? "type-number" : "pick-word";

  const correct = useMemo(() => toYoruba(n, mode), [n, mode]);
  const choices = useMemo(
    () => buildChoices(n, correct, mode, level.pool),
    [n, correct, mode, level.pool],
  );
  const explanation = revealed ? explainNumber(n) : null;

  const record = (right: boolean) => {
    setProgress((p) => {
      const prev = p.scores[level.id] ?? { right: 0, total: 0 };
      const next = bumpStreak({
        ...p,
        scores: {
          ...p.scores,
          [level.id]: { right: prev.right + (right ? 1 : 0), total: prev.total + 1 },
        },
      });
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      } catch {
        // Private browsing: progress just won't persist.
      }
      return next;
    });
  };

  const nextQuestion = () => {
    setQuestionSeed((s) => s + 1);
    setRevealed(false);
    setQuizChoice(null);
    setTyped("");
  };

  const handlePick = (choice: string) => {
    if (quizChoice || revealed) return;
    setQuizChoice(choice);
    setRevealed(true);
    record(choice === correct);
  };

  const handleTyped = () => {
    if (revealed) return;
    setRevealed(true);
    record(Number(typed.trim()) === n);
  };

  const score = progress.scores[level.id] ?? { right: 0, total: 0 };
  const pct = score.total ? Math.round((100 * score.right) / score.total) : 0;

  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-border bg-warm-cream px-6 py-6 shadow-card">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-deep-green">Kọ́ Ẹ̀kọ́ (Learn)</h2>
          <p className="mt-0.5 text-xs text-muted">
            {level.subtitle} • {score.right}/{score.total}
            {score.total ? ` (${pct}%)` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {progress.streak > 0 ? (
            <span
              title="Ọjọ́ ìtẹ̀síwájú (daily streak)"
              className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold"
            >
              ✶ {progress.streak}
            </span>
          ) : null}
          <button
            type="button"
            onClick={nextQuestion}
            className="rounded-full bg-primary-green px-4 py-2 text-sm font-bold text-warm-cream transition-colors hover:bg-deep-green"
          >
            Tókàn →
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => {
          const s = progress.scores[l.id];
          const mastered = s && s.total >= 10 && s.right / s.total >= 0.8;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                setLevelId(l.id);
                setQuestionSeed(0);
                setRevealed(false);
                setQuizChoice(null);
                setTyped("");
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                l.id === levelId
                  ? "border-primary-green bg-primary-green text-warm-cream"
                  : "border-border bg-background/70 text-muted hover:bg-pale-green"
              }`}
            >
              {mastered ? "✓ " : ""}
              {l.title}
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-border bg-background/70 px-4 py-8 text-center">
        {kind === "pick-word" ? (
          <div className="font-mono text-8xl font-bold leading-none text-text-dark">{n}</div>
        ) : (
          <div className="break-words px-2 font-serif text-4xl font-bold leading-tight text-deep-green [overflow-wrap:anywhere]">
            {correct}
          </div>
        )}
        <div className="mt-4 flex min-h-[3rem] items-center justify-center">
          {revealed ? (
            <span className={kind === "pick-word" ? "font-serif text-3xl text-deep-green" : "font-mono text-4xl font-bold text-deep-green"}>
              {kind === "pick-word" ? correct : n}
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
      </div>

      {explanation ? (
        <p className="rounded-2xl border border-gold/40 bg-background/70 px-4 py-3 text-sm leading-6 text-muted">
          <span className="font-bold text-gold">Kí ló dé? </span>
          <span className="font-mono font-semibold text-text-dark">{explanation.summary}</span>
          {" — "}
          {explanation.relation === "subtract" ? (
            <>
              <span className="font-serif font-semibold text-deep-green">{explanation.parts[0].word}</span>{" "}
              short of <span className="font-serif font-semibold text-deep-green">{explanation.anchor.word}</span>.
            </>
          ) : (
            <>
              <span className="font-serif font-semibold text-deep-green">{explanation.anchor.word}</span>{" "}
              plus <span className="font-serif font-semibold text-deep-green">{explanation.parts[0].word}</span>.
            </>
          )}
        </p>
      ) : null}

      {kind === "pick-word" ? (
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
                  disabled={revealed}
                  onClick={() => handlePick(c)}
                  className={`rounded-2xl border px-3 py-3 font-serif text-base transition-colors ${klass}`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            Tẹ nọ́mbà náà (type the number)
          </p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleTyped();
            }}
          >
            <input
              type="text"
              inputMode="numeric"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={revealed}
              aria-label="Your answer in digits"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-mono text-2xl text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
            />
            <button
              type="submit"
              disabled={revealed || typed.trim() === ""}
              className="rounded-2xl bg-primary-green px-5 py-3 text-sm font-bold text-warm-cream transition-colors hover:bg-deep-green disabled:opacity-50"
            >
              Dán wò
            </button>
          </form>
          {revealed ? (
            <p
              className={`text-sm font-bold ${
                Number(typed.trim()) === n ? "text-primary-green" : "text-error"
              }`}
            >
              {Number(typed.trim()) === n ? "Ó dára! Correct." : `Rárá — ìdáhùn ni ${n}.`}
            </p>
          ) : null}
        </div>
      )}

      <ResearchNotes />
    </div>
  );
}

function buildChoices(
  n: number,
  correct: string,
  mode: YorubaMode,
  pool: number[],
): string[] {
  const set = new Set<string>([correct]);
  const others = pool.filter((i) => i !== n);
  // Shuffle deterministically by n so the same card always shows the same options.
  const seed = (a: number, b: number) => ((a * 9301 + b * 49297) % 233280) / 233280;
  others.sort((a, b) => seed(a, n) - seed(b, n));
  let i = 0;
  while (set.size < 4 && i < others.length) {
    set.add(toYoruba(others[i], mode));
    i++;
  }
  const arr = Array.from(set);
  arr.sort((a, b) => seed(a.length, n) - seed(b.length, n));
  return arr;
}

const COUNTING_INSIGHTS = [
  {
    title: "Base-20 backbone",
    yoruba: "Ogún ni ìpìlẹ̀",
    detail:
      "Traditional Yorùbá numerals are commonly described as vigesimal, so round numbers lean on scores: 40 is two twenties, 60 is three twenties, and 80 is four twenties.",
    example: "40 → Ogójì • 60 → Ọgọ́ta • 80 → Ọgọ́rin",
    source: "Omniglot Yoruba numbers",
    sourceUrl: "https://www.omniglot.com/language/numbers/yoruba.htm",
  },
  {
    title: "Arithmetic builds words",
    yoruba: "Ìṣirò wà nínú ọ̀rọ̀",
    detail:
      "Recent morphology research frames Yorùbá number names as form-meaning constructions that encode arithmetic operations such as addition, subtraction, and multiplication.",
    example: "21 adds to 20 • 35 subtracts from 40 • 200 groups scores",
    source: "A Construction Morphology Approach to Yoruba Numerals",
    sourceUrl: "https://constructions.journals.hhu.de/article/view/549",
  },
  {
    title: "Count back near targets",
    yoruba: "Dín = count back",
    detail:
      "Many forms before the next ten or score use subtractive phrasing, so the app teaches 35 as five less than 40 and 75 as five less than 80.",
    example: "35 → Márùndínlógójì • 75 → Márùndínlọ́gọ́rin",
    source: "Linguistic analysis of the structure of Yoruba numerals",
    sourceUrl: "https://www.tandfonline.com/doi/abs/10.1080/10228195.2013.857362",
  },
  {
    title: "Modern decimal help",
    yoruba: "Ọ̀nà òde-òní",
    detail:
      "Some modern teaching proposals simplify hard subtractive forms with more decimal, additive phrasing. That is why Kàá keeps both traditional and modern modes visible.",
    example: "75 traditional → Márùndínlọ́gọ́rin • modern → Àádọ́rin àti Márùn-ún",
    source: "Proposal for a Yoruba decimal counting system",
    sourceUrl: "https://repository.ui.edu.ng/items/6164afe0-3ef5-4e30-9fb1-c303a6e783b6",
  },
  {
    title: "App fallback for every digit",
    yoruba: "Ka díjítì kọ̀ọ̀kan",
    detail:
      "Long IDs, phone numbers, leading zeros, and decimals are not always ordinary counting numbers, so Kàá can spell each digit instead of showing raw Arabic numerals.",
    example: "007 → Òdo Òdo Méje • 12.05 → Méjìlá ààmì Òdo Márùn-ún",
    source: "Kàá number engine",
    sourceUrl: "https://www.omniglot.com/language/numbers/yoruba.htm",
  },
];

function ResearchNotes() {
  return (
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
              <span className="text-xs font-bold text-primary-green">{item.yoruba}</span>
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
  );
}
