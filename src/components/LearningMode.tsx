"use client";

// Kàá — Kọ́ Ẹ̀kọ́ home: pick an age track, see the level map with stars and the
// daily streak, and start sessions. The pedagogy is documented (with sources)
// in docs/learning-design.md.

import { useEffect, useState } from "react";
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
import type { YorubaMode } from "@/lib/yorubaNumbers";
import { Session } from "./learn/Session";

interface LearningModeProps {
  mode: YorubaMode;
}

export function LearningMode({ mode }: LearningModeProps) {
  const [progress, setProgress] = useState<LearnProgress | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [activeLevel, setActiveLevel] = useState<LevelDef | null>(null);

  useEffect(() => {
    setProgress(loadLearnProgress());
  }, []);

  if (progress === null) {
    return (
      <div className="rounded-[2rem] border border-border bg-warm-cream px-6 py-16 text-center shadow-card">
        <p className="font-serif text-2xl text-deep-green">Kọ́ Ẹ̀kọ́…</p>
      </div>
    );
  }

  const age = progress.age;

  if (!age || choosing) {
    return (
      <AgePicker
        current={age}
        onPick={(picked) => {
          const next = { ...progress, age: picked };
          setProgress(next);
          saveLearnProgress(next);
          setChoosing(false);
        }}
      />
    );
  }

  if (activeLevel) {
    return (
      <Session
        age={age}
        level={activeLevel}
        mode={mode}
        reviewNumbers={progress.review[age] ?? []}
        onComplete={(correct, missed, cleared) => {
          setProgress((p) => {
            if (!p) return p;
            const next = applySessionResult(p, age, activeLevel.id, correct, missed, cleared);
            saveLearnProgress(next);
            return next;
          });
        }}
        onExit={() => setActiveLevel(null)}
      />
    );
  }

  const info = AGE_GROUPS.find((g) => g.id === age)!;
  const levels = LEVELS[age];
  const reviewCount = (progress.review[age] ?? []).length;

  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-border bg-warm-cream px-6 py-6 shadow-card">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-deep-green">Kọ́ Ẹ̀kọ́ (Learn)</h2>
          <p className="mt-0.5 text-sm text-muted">
            {info.emoji} {info.yoruba} · {info.ages}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {progress.streak > 0 ? (
            <span
              title="Ọjọ́ ìtẹ̀síwájú (daily streak)"
              className="rounded-full bg-gold/15 px-3 py-1 text-sm font-bold text-gold"
            >
              ✶ {progress.streak}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setChoosing(true)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted hover:bg-pale-green"
          >
            Yí padà
          </button>
        </div>
      </header>

      {reviewCount > 0 ? (
        <p className="rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-muted">
          ↻ Àtúnyẹ̀wò: nọ́mbà {reviewCount} ń dúró — wọ́n á farahàn nínú eré tókàn.
        </p>
      ) : null}

      <ol className="flex flex-col gap-3">
        {levels.map((level, i) => {
          const lp = progress.levels[`${age}/${level.id}`];
          const stars = lp?.stars ?? 0;
          const prevStars = i === 0 ? 1 : progress.levels[`${age}/${levels[i - 1].id}`]?.stars ?? 0;
          const locked = prevStars === 0;
          return (
            <li key={level.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => setActiveLevel(level)}
                className={`flex w-full items-center justify-between gap-3 rounded-3xl border px-5 py-4 text-left transition-colors ${
                  locked
                    ? "border-border bg-background/40 opacity-60"
                    : "border-border bg-background/70 hover:bg-pale-green"
                }`}
              >
                <div className="min-w-0">
                  <p className="font-serif text-xl font-semibold text-deep-green">
                    {locked ? "🔒 " : ""}
                    {level.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{level.subtitle}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-lg tracking-widest text-gold" aria-label={`${stars} of 3 stars`}>
                    {"★".repeat(stars)}
                    <span className="text-border">{"★".repeat(3 - stars)}</span>
                  </span>
                  {!locked ? (
                    <span className="rounded-full bg-primary-green px-4 py-1 text-xs font-bold text-warm-cream">
                      Ṣeré →
                    </span>
                  ) : (
                    <span className="text-xs text-muted">Gba ìràwọ̀ kínní ṣáájú</span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <details className="rounded-3xl border border-border bg-background/75 p-4">
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.18em] text-gold">
          Fún àwọn òbí àti olùkọ́ — how this is designed
        </summary>
        <p className="mt-3 text-sm leading-6 text-muted">
          The youngest track builds number sense the way research says children
          acquire it — recognizing small quantities at a glance (subitizing),
          tap-counting with one-to-one correspondence, and the count sequence —
          before any reading. Ages 7–9 add word recognition and spelling by
          building Yorùbá&apos;s clean (C)V syllables from tiles. Ages 10–13 learn
          the lé/dín system itself, and adults drill the full range with missed
          numbers automatically resurfaced (spaced repetition). Sessions are
          short with immediate feedback; every wrong answer shows the arithmetic
          inside the word. Full write-up with sources:{" "}
          <a
            href="https://github.com/SojiJoro/K-/blob/main/docs/learning-design.md"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary-green underline-offset-2 hover:underline"
          >
            learning-design.md
          </a>
          .
        </p>
      </details>
    </div>
  );
}

function AgePicker({
  current,
  onPick,
}: {
  current: AgeGroup | null;
  onPick: (age: AgeGroup) => void;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-border bg-warm-cream px-6 py-6 shadow-card">
      <header className="text-center">
        <h2 className="font-serif text-2xl text-deep-green">Ta ló ń kọ́ ẹ̀kọ́ lónìí?</h2>
        <p className="mt-1 text-sm text-muted">Who&apos;s learning today? Pick an age group.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {AGE_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => onPick(g.id)}
            className={`flex flex-col items-center gap-2 rounded-3xl border px-5 py-6 text-center transition-all hover:scale-[1.01] ${
              current === g.id
                ? "border-primary-green bg-pale-green"
                : "border-border bg-background/70 hover:bg-pale-green"
            }`}
          >
            <span className="text-5xl">{g.emoji}</span>
            <span className="font-serif text-xl font-semibold text-deep-green">{g.yoruba}</span>
            <span className="rounded-full bg-gold/15 px-3 py-0.5 text-xs font-bold text-gold">
              {g.english} · {g.ages}
            </span>
            <span className="text-xs leading-5 text-muted">{g.tagline}</span>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-muted">
        Ìtẹ̀síwájú ti ẹgbẹ́ kọ̀ọ̀kan ni a tọ́jú lọ́tọ̀ọ̀tọ̀ — ìdílé kan, fóònù kan. (Each
        group&apos;s progress is kept separately — one family can share one phone.)
      </p>
    </div>
  );
}
