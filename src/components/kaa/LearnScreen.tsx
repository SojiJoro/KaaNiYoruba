"use client";

// Kọ́ Ẹ̀kọ́ — the learning game, fitted to the Kàá design.
// Pick an age track, work a level's 8-question session (built and rated by the
// engine in src/lib/learn.ts), and watch stars + a daily streak accumulate.
// The research-backed design is written up in docs/learning-design.md.

import { useEffect, useMemo, useState } from "react";
import type { YorubaMode } from "@/lib/yorubaNumbers";
import {
  AGE_GROUPS,
  LEVELS,
  applySessionResult,
  loadLearnProgress,
  saveLearnProgress,
  type AgeGroup,
  type LearnProgress,
  type LevelDef,
} from "@/lib/learn";
import { Session } from "../learn/Session";

function StarRow({ stars }: { stars: number }) {
  return (
    <span
      className="text-sm tracking-widest text-gold"
      aria-label={`${stars} of 3 stars`}
    >
      {"★".repeat(stars)}
      <span className="text-border">{"★".repeat(3 - stars)}</span>
    </span>
  );
}

export function LearnScreen({ mode }: { mode: YorubaMode }) {
  const [progress, setProgress] = useState<LearnProgress>({
    age: null,
    levels: {},
    review: {},
    streak: 0,
    lastDay: "",
  });
  const [age, setAge] = useState<AgeGroup | null>(null);
  const [activeLevel, setActiveLevel] = useState<LevelDef | null>(null);

  // Restore saved progress after mount (SSR renders the empty default).
  useEffect(() => {
    const p = loadLearnProgress();
    setProgress(p);
    setAge(p.age);
  }, []);

  const ageInfo = useMemo(
    () => AGE_GROUPS.find((g) => g.id === age) ?? null,
    [age],
  );
  const reviewNumbers = age ? progress.review[age] ?? [] : [];

  const handleComplete = (
    correct: number,
    missed: number[],
    cleared: number[],
  ) => {
    if (!age || !activeLevel) return;
    const next = applySessionResult(
      progress,
      age,
      activeLevel.id,
      correct,
      missed,
      cleared,
    );
    setProgress(next);
    saveLearnProgress(next);
  };

  const selectAge = (id: AgeGroup) => {
    setAge(id);
    setActiveLevel(null);
    const next = { ...progress, age: id };
    setProgress(next);
    saveLearnProgress(next);
  };

  // ---- A session is running: hand the whole screen to it -------------------
  if (age && activeLevel) {
    return (
      <div className="screen screen-learn">
        <Session
          age={age}
          level={activeLevel}
          mode={mode}
          reviewNumbers={reviewNumbers}
          onComplete={handleComplete}
          onExit={() => setActiveLevel(null)}
        />
      </div>
    );
  }

  // ---- Selection: pick a track, then a level -------------------------------
  return (
    <div className="screen screen-learn">
      <header className="screen-head">
        <div>
          <h1 className="screen-title">Kọ́ ẹ̀kọ́</h1>
          <p className="screen-sub">
            {ageInfo
              ? `${ageInfo.yoruba} · ${ageInfo.ages} — ${ageInfo.tagline}`
              : "Yan ẹgbẹ́ rẹ — choose a track to start playing"}
          </p>
        </div>
        <div className="learn-head-pills">
          {progress.streak > 0 && (
            <span className="streak-pill" title="Ọjọ́ ìtẹ̀síwájú (daily streak)">
              ✶ {progress.streak}
            </span>
          )}
          {reviewNumbers.length > 0 && (
            <span className="score-pill" title="Numbers queued for review">
              ↻ {reviewNumbers.length}
            </span>
          )}
        </div>
      </header>

      {/* Age tracks */}
      <div className="grid grid-cols-2 gap-3">
        {AGE_GROUPS.map((g) => {
          const on = g.id === age;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => selectAge(g.id)}
              className={`flex flex-col items-start gap-1 rounded-3xl border px-4 py-4 text-left transition-colors ${
                on
                  ? "border-primary-green bg-pale-green shadow-card"
                  : "border-border bg-warm-cream hover:bg-pale-green"
              }`}
            >
              <span className="text-3xl">{g.emoji}</span>
              <span className="font-serif text-lg font-semibold text-deep-green">
                {g.yoruba}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                {g.english} · {g.ages}
              </span>
              <span className="text-xs leading-5 text-muted">{g.tagline}</span>
            </button>
          );
        })}
      </div>

      {/* Level map for the chosen track */}
      {age && (
        <section className="flex flex-col gap-3">
          <span className="eyebrow gold">Àwọn ipele — levels</span>
          <div className="flex flex-col gap-2.5">
            {LEVELS[age].map((level, i) => {
              const prog = progress.levels[`${age}/${level.id}`];
              const stars = prog?.stars ?? 0;
              // Levels unlock in order: the first is always open, the rest
              // open once the previous one has earned at least one star.
              const prevId = i > 0 ? LEVELS[age][i - 1].id : null;
              const prevStars = prevId
                ? progress.levels[`${age}/${prevId}`]?.stars ?? 0
                : 1;
              const locked = i > 0 && prevStars < 1;
              return (
                <button
                  key={level.id}
                  type="button"
                  disabled={locked}
                  onClick={() => setActiveLevel(level)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                    locked
                      ? "cursor-not-allowed border-border bg-background/50 opacity-60"
                      : "border-border bg-warm-cream shadow-button hover:bg-pale-green"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-lg font-bold ${
                      stars > 0
                        ? "bg-primary-green text-warm-cream"
                        : "bg-pale-green text-deep-green"
                    }`}
                  >
                    {locked ? "🔒" : i + 1}
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="font-serif text-base font-semibold text-deep-green">
                      {level.title}
                    </span>
                    <span className="text-xs text-muted">{level.subtitle}</span>
                  </span>
                  {!locked && <StarRow stars={stars} />}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
