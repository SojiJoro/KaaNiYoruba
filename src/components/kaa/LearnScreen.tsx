"use client";

import { useMemo, useState } from "react";
import { toYoruba, type YorubaMode } from "@/lib/yorubaNumbers";
import { SpeakerGlyph } from "./shared";
import { VOICE_ENABLED } from "./types";

const LEARN_RANGE_END = 20;

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

// Deterministic pseudo-shuffle so the quiz shows stable choices per number
// (no hydration-unsafe Math.random in render).
function seededSort(pool: number[], n: number): number[] {
  const seed = (a: number, b: number) => ((a * 9301 + b * 49297) % 233280) / 233280;
  return [...pool].sort((a, b) => seed(a, n) - seed(b, n));
}

function buildChoices(
  n: number,
  correct: string,
  mode: YorubaMode,
  end: number,
): string[] {
  const set = new Set<string>([correct]);
  const pool: number[] = [];
  for (let i = 0; i <= end; i++) if (i !== n) pool.push(i);
  const shuffled = seededSort(pool, n);
  let i = 0;
  while (set.size < 4 && i < shuffled.length) {
    set.add(toYoruba(shuffled[i], mode));
    i++;
  }
  const seed = (a: number, b: number) => ((a * 9301 + b * 49297) % 233280) / 233280;
  return Array.from(set).sort((a, b) => seed(a.length, n) - seed(b.length, n));
}

export function LearnScreen({
  mode,
  onSpeak,
}: {
  mode: YorubaMode;
  onSpeak: (text: string) => void;
}) {
  const rangeEnd = LEARN_RANGE_END;
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [quizChoice, setQuizChoice] = useState<string | null>(null);

  const correct = useMemo(() => toYoruba(index, mode), [index, mode]);
  const choices = useMemo(
    () => buildChoices(index, correct, mode, rangeEnd),
    [index, correct, mode, rangeEnd],
  );

  const next = () => {
    setIndex((i) => (i + 1) % (rangeEnd + 1));
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
    <div className="screen screen-learn">
      <header className="screen-head">
        <div>
          <h1 className="screen-title">Kọ́ ẹ̀kọ́</h1>
          <p className="screen-sub">
            Learn the numbers 0–{rangeEnd} — guess, reveal, listen
          </p>
        </div>
        <span className="score-pill" aria-label="Score">
          {score.right}
          <i>/{score.total}</i>
        </span>
      </header>

      <section className="learn-card">
        <div className="learn-number">{index}</div>
        <div className="learn-answer">
          {revealed ? (
            <span className="learn-word">{correct}</span>
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
          <button type="button" className="primary-btn" onClick={next}>
            Tókàn →
          </button>
        </div>
      </section>

      <section className="quiz">
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
                disabled={!!quizChoice}
                className={"quiz-choice" + cls}
                onClick={() => handleQuiz(c)}
              >
                {c}
              </button>
            );
          })}
        </div>
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
