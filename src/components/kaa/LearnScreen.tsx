"use client";

import { useEffect, useMemo, useState } from "react";
import { explainNumber, toYoruba, type YorubaMode } from "@/lib/yorubaNumbers";
import { SpeakerGlyph } from "./shared";
import { VOICE_ENABLED } from "./types";

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

// ---- Quiz helpers -----------------------------------------------------------

type QuizKind = "pick-word" | "type-number";

// Deterministic pseudo-shuffle so the same card always shows the same options
// (no hydration-unsafe Math.random in render).
function buildChoices(
  n: number,
  correct: string,
  mode: YorubaMode,
  pool: number[],
): string[] {
  const set = new Set<string>([correct]);
  const others = pool.filter((i) => i !== n);
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

const LEARN_INSIGHTS = [
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
    sourceUrl:
      "https://repository.ui.edu.ng/items/6164afe0-3ef5-4e30-9fb1-c303a6e783b6",
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

const APP_POLISH_ITEMS = [
  "Single-screen calculator layout", "Safe-area friendly spacing", "Bottom navigation",
  "Compact header", "Mode segmented control", "Large tap targets", "Clear visual hierarchy",
  "Rounded app cards", "Soft elevation shadows", "Consistent icon set", "Immediate input feedback",
  "Live result preview", "Native keyboard support", "Voice pronunciation action",
  "Accessible aria labels", "Responsive phone width", "Desktop companion panel",
  "Persistent calculator tab", "History reuse", "History clearing", "Converter utility",
  "Learn mode quiz", "Score tracking", "Research notes", "External source links",
  "Traditional mode", "Modern mode", "Yorùbá subtitles on keys", "Cultural color palette",
  "Textile-inspired background", "Premium display panel", "Operator color contrast",
  "Error state styling", "Hover states", "Pressed states", "Focus rings",
  "Scrollable content sections", "Truncated long labels", "Word-wrap display",
  "Finite history cap", "App-like max width", "No mobile horizontal scroll",
  "Full-height mobile view", "Sticky desktop nav", "Fixed utility nav", "Reusable guide cards",
  "Deterministic quiz choices", "Readable source badges", "Warm empty states",
  "Production build readiness",
];

// ---- Screen -------------------------------------------------------------------

export function LearnScreen({
  mode,
  onSpeak,
}: {
  mode: YorubaMode;
  onSpeak: (text: string) => void;
}) {
  const [levelId, setLevelId] = useState(LEVELS[0].id);
  const [questionSeed, setQuestionSeed] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [quizChoice, setQuizChoice] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [progress, setProgress] = useState<Progress>({
    scores: {},
    streak: 0,
    lastDay: "",
  });

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const level = LEVELS.find((l) => l.id === levelId)!;
  const n = level.pool[questionSeed % level.pool.length];
  // Every third card flips the direction: word shown, number typed.
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
          [level.id]: {
            right: prev.right + (right ? 1 : 0),
            total: prev.total + 1,
          },
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

  const selectLevel = (id: string) => {
    setLevelId(id);
    setQuestionSeed(0);
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
    <div className="screen screen-learn">
      <header className="screen-head">
        <div>
          <h1 className="screen-title">Kọ́ ẹ̀kọ́</h1>
          <p className="screen-sub">
            {level.subtitle} — guess, reveal, learn the why
          </p>
        </div>
        <div className="learn-head-pills">
          {progress.streak > 0 && (
            <span className="streak-pill" title="Ọjọ́ ìtẹ̀síwájú (daily streak)">
              ✶ {progress.streak}
            </span>
          )}
          <span className="score-pill" aria-label="Score">
            {score.right}
            <i>/{score.total}</i>
            {score.total > 0 && <i> · {pct}%</i>}
          </span>
        </div>
      </header>

      <div className="chip-row learn-levels" role="tablist" aria-label="Levels">
        {LEVELS.map((l) => {
          const s = progress.scores[l.id];
          const mastered = s && s.total >= 10 && s.right / s.total >= 0.8;
          return (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={l.id === levelId}
              title={l.subtitle}
              className={"chip" + (l.id === levelId ? " chip-on" : "")}
              onClick={() => selectLevel(l.id)}
            >
              {mastered ? "✓ " : ""}
              {l.title}
            </button>
          );
        })}
      </div>

      <section className="learn-card">
        {kind === "pick-word" ? (
          <div className="learn-number">{n}</div>
        ) : (
          <div className="learn-word-q">{correct}</div>
        )}
        <div className="learn-answer">
          {revealed ? (
            kind === "pick-word" ? (
              <span className="learn-word">{correct}</span>
            ) : (
              <span className="learn-answer-num">{n}</span>
            )
          ) : (
            <button
              type="button"
              className="link-btn"
              onClick={() => setRevealed(true)}
            >
              Tẹ láti rí ìdáhùn — tap to reveal
            </button>
          )}
        </div>
        <div className="learn-card-actions">
          {VOICE_ENABLED && (
            <button type="button" className="ghost-btn" onClick={() => onSpeak(correct)}>
              <SpeakerGlyph size={14} /> Gbọ́ pípè
            </button>
          )}
          <button type="button" className="primary-btn" onClick={nextQuestion}>
            Tókàn →
          </button>
        </div>
      </section>

      {explanation && (
        <p className="explain-card">
          <b>Kí ló dé? </b>
          <span className="explain-sum">{explanation.summary}</span>
          {" — "}
          {explanation.relation === "subtract" ? (
            <>
              <span className="explain-word">{explanation.parts[0].word}</span>{" "}
              short of{" "}
              <span className="explain-word">{explanation.anchor.word}</span>.
            </>
          ) : (
            <>
              <span className="explain-word">{explanation.anchor.word}</span>{" "}
              plus <span className="explain-word">{explanation.parts[0].word}</span>.
            </>
          )}
        </p>
      )}

      <section className="quiz">
        {kind === "pick-word" ? (
          <>
            <span className="eyebrow">
              Yan ìdáhùn tó tọ́ <i>pick the right answer</i>
            </span>
            <div className="quiz-grid">
              {choices.map((c) => {
                const isPicked = quizChoice === c;
                const isCorrect = c === correct;
                const cls =
                  revealed && isCorrect
                    ? " quiz-right"
                    : revealed && isPicked && !isCorrect
                      ? " quiz-wrong"
                      : "";
                return (
                  <button
                    key={c}
                    type="button"
                    disabled={revealed}
                    className={"quiz-choice" + cls}
                    onClick={() => handlePick(c)}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <span className="eyebrow">
              Tẹ nọ́mbà náà <i>type the number</i>
            </span>
            <form
              className="quiz-type"
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
              />
              <button
                type="submit"
                className="primary-btn"
                disabled={revealed || typed.trim() === ""}
              >
                Dán wò
              </button>
            </form>
            {revealed && (
              <p
                className={
                  "quiz-feedback " + (Number(typed.trim()) === n ? "ok" : "err")
                }
              >
                {Number(typed.trim()) === n
                  ? "Ó dára! Correct."
                  : `Rárá — ìdáhùn ni ${n}.`}
              </p>
            )}
          </>
        )}
      </section>

      <section className="insights">
        <div className="insights-head">
          <div>
            <span className="eyebrow gold">Research notes</span>
            <h2 className="insights-title">Yorùbá number counting</h2>
          </div>
          <span className="badge-pill">20-base</span>
        </div>
        <div className="insight-grid">
          {LEARN_INSIGHTS.map((item) => (
            <article key={item.title} className="insight-card">
              <div className="insight-card-head">
                <h3>{item.title}</h3>
                <span className="insight-yo">{item.yoruba}</span>
              </div>
              <p className="insight-detail">{item.detail}</p>
              <p className="insight-example">{item.example}</p>
              <p className="insight-source">
                Source:{" "}
                <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                  {item.source}
                </a>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="insights">
        <div className="insights-head">
          <div>
            <span className="eyebrow gold">App checklist</span>
            <h2 className="insights-title">50 polish details</h2>
          </div>
          <span className="badge-pill">{APP_POLISH_ITEMS.length} items</span>
        </div>
        <ol className="polish-grid">
          {APP_POLISH_ITEMS.map((item, idx) => (
            <li key={item} className="polish-item">
              <span className="polish-num">{idx + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
