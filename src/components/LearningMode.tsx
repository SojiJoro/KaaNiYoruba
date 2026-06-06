'use client';

import { useMemo, useState } from 'react';
import { toYoruba, type YorubaMode } from '@/lib/yorubaNumbers';

interface LearningModeProps {
  mode: YorubaMode;
  onSpeak: (text: string) => void;
}

const RANGE_END = 20;

export function LearningMode({ mode, onSpeak }: LearningModeProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [quizChoice, setQuizChoice] = useState<string | null>(null);

  const correct = useMemo(() => toYoruba(index, mode), [index, mode]);
  const choices = useMemo(() => buildChoices(index, correct, mode), [index, correct, mode]);

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
    <div className="rounded-3xl bg-paper/80 dark:bg-cocoa/40 border border-cocoa/10 dark:border-cream/10 px-6 py-6 flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-cocoa dark:text-cream text-xl">
            Kọ́ Ẹ̀kọ́ (Learn)
          </h2>
          <p className="text-xs text-cocoa/60 dark:text-cream/60 mt-0.5">
            Nọ́mbà 0–{RANGE_END} • Iye àbáyọ: {score.right}/{score.total}
          </p>
        </div>
        <button
          type="button"
          onClick={next}
          className="rounded-full bg-moss text-cream px-4 py-1.5 text-sm font-semibold hover:bg-moss-dark transition-colors"
        >
          Tókàn →
        </button>
      </header>

      <div className="text-center bg-paper-dark/40 dark:bg-cocoa-light/40 rounded-2xl py-8 px-4 border border-cocoa/10 dark:border-cream/10">
        <div className="text-8xl font-bold font-mono text-cocoa dark:text-cream leading-none">
          {index}
        </div>
        <div className="mt-4 min-h-[3rem] flex items-center justify-center">
          {revealed ? (
            <span className="text-3xl font-serif text-moss-dark dark:text-moss-light">
              {correct}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="text-cocoa/60 dark:text-cream/60 underline text-sm"
            >
              Tẹ láti rí ìdáhùn
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => onSpeak(correct)}
          className="mt-2 inline-flex items-center gap-1 text-moss-dark dark:text-moss-light text-sm hover:underline"
        >
          <SpeakerIcon /> Gbọ́ pípè
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-cocoa/50 dark:text-cream/50">
          Yan ìdáhùn tó tọ́
        </p>
        <div className="grid grid-cols-2 gap-2">
          {choices.map((c) => {
            const isPicked = quizChoice === c;
            const isCorrect = c === correct;
            const showCorrect = revealed && isCorrect;
            const showWrong = revealed && isPicked && !isCorrect;
            const klass = showCorrect
              ? 'bg-moss text-cream border-moss-dark'
              : showWrong
              ? 'bg-rust/10 text-rust border-rust/30'
              : 'bg-paper dark:bg-cocoa text-cocoa dark:text-cream border-cocoa/10 dark:border-cream/10 hover:bg-paper-dark dark:hover:bg-cocoa-light';
            return (
              <button
                key={c}
                type="button"
                disabled={!!quizChoice}
                onClick={() => handleQuiz(c)}
                className={`rounded-2xl px-3 py-3 border text-base font-serif transition-colors ${klass}`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function buildChoices(n: number, correct: string, mode: YorubaMode): string[] {
  const set = new Set<string>([correct]);
  // Pick 3 distractors from the same 0..RANGE_END window.
  const pool: number[] = [];
  for (let i = 0; i <= RANGE_END; i++) if (i !== n) pool.push(i);
  // Shuffle deterministically by n so the same card always shows the same options.
  const seed = (a: number, b: number) => ((a * 9301 + b * 49297) % 233280) / 233280;
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
