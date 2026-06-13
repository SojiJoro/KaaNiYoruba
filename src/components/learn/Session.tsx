"use client";

// Kàá — a learning session: 8 exercises, immediate feedback with the Kí ló dé?
// decomposition where it applies, then a star-rated results screen.

import { useEffect, useMemo, useState } from "react";
import {
  buildSession,
  exerciseNumber,
  starsFor,
  SESSION_LENGTH,
  type AgeGroup,
  type LevelDef,
} from "@/lib/learn";
import { explainNumber, type YorubaMode } from "@/lib/yorubaNumbers";
import { ExerciseView } from "./Exercises";

interface SessionProps {
  age: AgeGroup;
  level: LevelDef;
  mode: YorubaMode;
  reviewNumbers: number[];
  onComplete: (correct: number, missed: number[], cleared: number[]) => void;
  onExit: () => void;
}

const PRAISE = ["Ó dára!", "Kú iṣẹ́!", "Ẹ̀wà rẹ̀!", "Dáadáa!", "Bẹ́ẹ̀ ni!"];

export function Session({ age, level, mode, reviewNumbers, onComplete, onExit }: SessionProps) {
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const exercises = useMemo(
    () => buildSession(age, level, mode, reviewNumbers, seed),
    [age, level, mode, reviewNumbers, seed],
  );

  const [index, setIndex] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<number[]>([]);
  const [cleared, setCleared] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [reported, setReported] = useState(false);

  // Report the result once, after render, so the parent's state update never
  // happens mid-render.
  useEffect(() => {
    if (finished && !reported) {
      setReported(true);
      onComplete(correctCount, missed, cleared);
    }
  }, [finished, reported, correctCount, missed, cleared, onComplete]);

  const ex = exercises[index];
  const isReviewItem = index < Math.min(reviewNumbers.length, 2);

  const handleAnswer = (correct: boolean) => {
    if (resolved) return;
    setResolved(true);
    setLastCorrect(correct);
    setCorrectCount((c) => c + (correct ? 1 : 0));
    const n = exerciseNumber(ex);
    if (n !== null) {
      if (correct && isReviewItem) setCleared((c) => [...c, n]);
      if (!correct) setMissed((m) => (m.includes(n) ? m : [...m, n]));
    }
  };

  const advance = () => {
    if (index + 1 >= exercises.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setResolved(false);
  };

  if (finished) {
    const stars = starsFor(correctCount);
    return (
      <div className="flex flex-col items-center gap-5 rounded-[2rem] border border-border bg-warm-cream px-6 py-10 text-center shadow-card">
        <div className="text-6xl">{stars >= 3 ? "🎉" : stars >= 1 ? "🌟" : "💪"}</div>
        <div className="text-4xl tracking-widest" aria-label={`${stars} of 3 stars`}>
          {"★".repeat(stars)}
          <span className="text-border">{"★".repeat(3 - stars)}</span>
        </div>
        <p className="font-serif text-2xl text-deep-green">
          {stars >= 3
            ? "Pípé! Gbogbo rẹ̀ ló tọ̀nà."
            : stars >= 1
              ? `${PRAISE[correctCount % PRAISE.length]} ${correctCount}/${SESSION_LENGTH} tọ̀nà.`
              : "Má ṣe jọ̀wọ́ — gbìyànjú lẹ́ẹ̀kan sí i!"}
        </p>
        {missed.length > 0 ? (
          <p className="text-sm text-muted">
            A ó tún béèrè: {missed.join(", ")} — wọ́n ń bọ̀ ní ìgbà tókàn.
          </p>
        ) : null}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-border bg-background px-6 py-3 text-sm font-bold text-muted hover:bg-pale-green"
          >
            ← Padà
          </button>
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setResolved(false);
              setCorrectCount(0);
              setMissed([]);
              setCleared([]);
              setFinished(false);
              setReported(false);
            }}
            className="rounded-full bg-primary-green px-6 py-3 text-sm font-bold text-warm-cream hover:bg-deep-green"
          >
            Tún ṣe ↻
          </button>
        </div>
      </div>
    );
  }

  const n = exerciseNumber(ex);
  const explanation = resolved && !lastCorrect && n !== null ? explainNumber(n) : null;

  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-border bg-warm-cream px-6 py-6 shadow-card">
      <header className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit session"
          className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-bold text-muted hover:bg-pale-green"
        >
          ✕
        </button>
        <div className="flex flex-1 items-center gap-1.5" aria-label={`Question ${index + 1} of ${exercises.length}`}>
          {exercises.map((_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < index ? "bg-primary-green" : i === index ? "bg-gold" : "bg-border"
              }`}
            />
          ))}
        </div>
        {isReviewItem ? (
          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">↻ àtúnyẹ̀wò</span>
        ) : null}
      </header>

      <ExerciseView ex={ex} resolved={resolved} onAnswer={handleAnswer} />

      {resolved ? (
        <div
          className={`flex flex-col gap-2 rounded-2xl border px-4 py-3 ${
            lastCorrect ? "border-primary-green/40 bg-pale-green" : "border-error/30 bg-error/5"
          }`}
        >
          <p className={`font-bold ${lastCorrect ? "text-primary-green" : "text-error"}`}>
            {lastCorrect ? `✓ ${PRAISE[index % PRAISE.length]}` : "✗ Kò tọ̀nà — wo ìdí rẹ̀:"}
          </p>
          {explanation ? (
            <p className="text-sm leading-6 text-muted">
              <span className="font-mono font-semibold text-text-dark">{explanation.summary}</span>
              {" — "}
              {explanation.relation === "subtract" ? (
                <>
                  <span className="font-serif font-semibold text-deep-green">{explanation.parts[0].word}</span>{" "}
                  short of{" "}
                  <span className="font-serif font-semibold text-deep-green">{explanation.anchor.word}</span>.
                </>
              ) : (
                <>
                  <span className="font-serif font-semibold text-deep-green">{explanation.anchor.word}</span>{" "}
                  plus{" "}
                  <span className="font-serif font-semibold text-deep-green">{explanation.parts[0].word}</span>.
                </>
              )}
            </p>
          ) : null}
          <button
            type="button"
            onClick={advance}
            className="self-end rounded-full bg-primary-green px-6 py-2.5 text-sm font-bold text-warm-cream hover:bg-deep-green"
          >
            {index + 1 >= exercises.length ? "Parí ✓" : "Tókàn →"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
