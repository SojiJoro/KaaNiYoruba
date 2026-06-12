"use client";

// Kàá — Kọ́ Ẹ̀kọ́ exercise renderers. One component per exercise kind; each
// resolves exactly once by calling onAnswer(correct). Feedback and advancing
// are the Session's job, so these stay focused on the interaction itself.

import { useMemo, useState } from "react";
import type { Exercise } from "@/lib/learn";
import { mulberry32 } from "@/lib/learn";

interface ExerciseProps<E extends Exercise> {
  ex: E;
  resolved: boolean;
  onAnswer: (correct: boolean) => void;
}

// ---- Shared option button -----------------------------------------------------

function OptionButton({
  label,
  sub,
  state,
  big,
  disabled,
  onClick,
}: {
  label: string;
  sub?: string;
  state: "idle" | "correct" | "wrong";
  big?: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const klass =
    state === "correct"
      ? "border-primary-green bg-primary-green text-warm-cream"
      : state === "wrong"
        ? "border-error/40 bg-error/10 text-error"
        : "border-border bg-warm-cream text-text-dark hover:bg-pale-green";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-14 flex-col items-center justify-center rounded-2xl border px-3 py-3 transition-colors ${klass} ${
        big ? "text-3xl font-bold" : "font-serif text-base"
      }`}
    >
      <span className="break-words [overflow-wrap:anywhere]">{label}</span>
      {sub ? <span className="mt-0.5 text-xs font-normal opacity-80">{sub}</span> : null}
    </button>
  );
}

function optionState(
  value: string | number,
  correct: string | number,
  picked: string | number | null,
  resolved: boolean,
): "idle" | "correct" | "wrong" {
  if (!resolved) return "idle";
  if (value === correct) return "correct";
  if (value === picked) return "wrong";
  return "idle";
}

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-sm font-bold uppercase tracking-wider text-muted">
      {children}
    </p>
  );
}

// ---- count: tap each object, then say how many (1:1 correspondence +
// cardinality — the last tap's number answers the question) --------------------

export function CountExercise({
  ex,
  resolved,
  onAnswer,
}: ExerciseProps<Extract<Exercise, { kind: "count" }>>) {
  const [tapped, setTapped] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);

  // Scatter the objects deterministically so they don't form a countable line.
  const offsets = useMemo(() => {
    const rng = mulberry32(ex.n * 7919 + ex.emoji.codePointAt(0)!);
    return Array.from({ length: ex.n }, () => ({
      x: Math.floor(rng() * 24) - 12,
      y: Math.floor(rng() * 16) - 8,
      r: Math.floor(rng() * 30) - 15,
    }));
  }, [ex.n, ex.emoji]);

  return (
    <div className="flex flex-col gap-5">
      <Prompt>Tẹ kọ̀ọ̀kan kí o sì kà á — mélòó ni?</Prompt>
      <div className="flex min-h-36 flex-wrap items-center justify-center gap-4 rounded-3xl border border-border bg-background/70 p-6">
        {offsets.map((o, i) => {
          const order = tapped.indexOf(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() =>
                setTapped((t) => (t.includes(i) ? t : [...t, i]))
              }
              className="relative text-5xl transition-transform active:scale-90"
              style={{ transform: `translate(${o.x}px, ${o.y}px) rotate(${o.r}deg)` }}
              aria-label={`object ${i + 1}`}
            >
              <span className={order >= 0 ? "opacity-100" : "opacity-90 grayscale-[25%]"}>
                {ex.emoji}
              </span>
              {order >= 0 ? (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-warm-cream">
                  {order + 1}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ex.options.map((o) => (
          <OptionButton
            key={o}
            label={String(o)}
            big
            state={optionState(o, ex.n, picked, resolved)}
            disabled={resolved}
            onClick={() => {
              setPicked(o);
              onAnswer(o === ex.n);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---- subitize: a ten-frame pattern, recognized at a glance ---------------------

export function SubitizeExercise({
  ex,
  resolved,
  onAnswer,
}: ExerciseProps<Extract<Exercise, { kind: "subitize" }>>) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-5">
      <Prompt>Wò ó kíákíá — mélòó ni? (don&apos;t count, just see!)</Prompt>
      <div className="mx-auto grid w-fit grid-cols-5 gap-2 rounded-3xl border border-border bg-background/70 p-5">
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className={`h-9 w-9 rounded-full border ${
              i < ex.n ? "border-primary-green bg-primary-green" : "border-border bg-transparent"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ex.options.map((o) => (
          <OptionButton
            key={o}
            label={String(o)}
            big
            state={optionState(o, ex.n, picked, resolved)}
            disabled={resolved}
            onClick={() => {
              setPicked(o);
              onAnswer(o === ex.n);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---- sequence: the count sequence, "what comes next?" --------------------------

export function SequenceExercise({
  ex,
  resolved,
  onAnswer,
}: ExerciseProps<Extract<Exercise, { kind: "sequence" }>>) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-5">
      <Prompt>Kí ni ó tẹ̀lé e? (what comes next?)</Prompt>
      <div className="flex items-center justify-center gap-3">
        {ex.seq.map((s) => (
          <span
            key={s}
            className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background/70 font-mono text-3xl font-bold text-text-dark"
          >
            {s}
          </span>
        ))}
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-gold bg-gold/10 font-mono text-3xl font-bold text-gold">
          ?
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ex.options.map((o) => (
          <OptionButton
            key={o}
            label={String(o)}
            big
            state={optionState(o, ex.answer, picked, resolved)}
            disabled={resolved}
            onClick={() => {
              setPicked(o);
              onAnswer(o === ex.answer);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---- match: pair numerals with their words --------------------------------------

export function MatchExercise({
  ex,
  resolved,
  onAnswer,
}: ExerciseProps<Extract<Exercise, { kind: "match" }>>) {
  const words = useMemo(() => {
    const rng = mulberry32(ex.pairs.reduce((a, p) => a + p.n, 17));
    const w = [...ex.pairs];
    for (let i = w.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [w[i], w[j]] = [w[j], w[i]];
    }
    return w;
  }, [ex.pairs]);

  const [selectedN, setSelectedN] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [shake, setShake] = useState<string | null>(null);

  const tryMatch = (word: string, wordN: number) => {
    if (selectedN === null || matched.includes(wordN)) return;
    if (selectedN === wordN) {
      const nextMatched = [...matched, wordN];
      setMatched(nextMatched);
      setSelectedN(null);
      if (nextMatched.length === ex.pairs.length) {
        onAnswer(mistakes <= 1);
      }
    } else {
      setMistakes((m) => m + 1);
      setShake(word);
      setTimeout(() => setShake(null), 350);
      setSelectedN(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Prompt>So nọ́mbà pọ̀ mọ́ ọ̀rọ̀ rẹ̀ (match each pair)</Prompt>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {ex.pairs.map((p) => (
            <button
              key={p.n}
              type="button"
              disabled={resolved || matched.includes(p.n)}
              onClick={() => setSelectedN(p.n)}
              className={`rounded-2xl border px-3 py-4 font-mono text-2xl font-bold transition-colors ${
                matched.includes(p.n)
                  ? "border-primary-green bg-primary-green text-warm-cream"
                  : selectedN === p.n
                    ? "border-gold bg-gold/15 text-text-dark"
                    : "border-border bg-warm-cream text-text-dark hover:bg-pale-green"
              }`}
            >
              {p.n}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {words.map((p) => (
            <button
              key={p.word}
              type="button"
              disabled={resolved || matched.includes(p.n)}
              onClick={() => tryMatch(p.word, p.n)}
              className={`rounded-2xl border px-3 py-4 font-serif text-lg transition-colors ${
                matched.includes(p.n)
                  ? "border-primary-green bg-primary-green text-warm-cream"
                  : shake === p.word
                    ? "border-error bg-error/10 text-error"
                    : "border-border bg-warm-cream text-text-dark hover:bg-pale-green"
              }`}
            >
              {p.word}
            </button>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-muted">
        Tẹ nọ́mbà ní apá òsì, lẹ́yìn náà ọ̀rọ̀ rẹ̀ ní apá ọ̀tún.
      </p>
    </div>
  );
}

// ---- pick-word / pick-number: recognition both ways ------------------------------

export function PickWordExercise({
  ex,
  resolved,
  onAnswer,
}: ExerciseProps<Extract<Exercise, { kind: "pick-word" }>>) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-5">
      <Prompt>Yan ọ̀rọ̀ tó tọ́ fún…</Prompt>
      <div className="text-center font-mono text-7xl font-bold text-text-dark">{ex.n}</div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ex.options.map((o) => (
          <OptionButton
            key={o}
            label={o}
            state={optionState(o, ex.correct, picked, resolved)}
            disabled={resolved}
            onClick={() => {
              setPicked(o);
              onAnswer(o === ex.correct);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function PickNumberExercise({
  ex,
  resolved,
  onAnswer,
}: ExerciseProps<Extract<Exercise, { kind: "pick-number" }>>) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-5">
      <Prompt>Nọ́mbà wo ni èyí?</Prompt>
      <div className="break-words text-center font-serif text-4xl font-bold leading-tight text-deep-green [overflow-wrap:anywhere]">
        {ex.word}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ex.options.map((o) => (
          <OptionButton
            key={o}
            label={String(o)}
            big
            state={optionState(o, ex.n, picked, resolved)}
            disabled={resolved}
            onClick={() => {
              setPicked(o);
              onAnswer(o === ex.n);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---- spell: build the word from syllable tiles ------------------------------------

export function SpellExercise({
  ex,
  resolved,
  onAnswer,
}: ExerciseProps<Extract<Exercise, { kind: "spell" }>>) {
  const [placed, setPlaced] = useState<number[]>([]); // indices into ex.syllables

  const place = (idx: number) => {
    if (resolved || placed.includes(idx)) return;
    const next = [...placed, idx];
    setPlaced(next);
    if (next.length === ex.syllables.length) {
      const built = next.map((i) => ex.syllables[i]).join("");
      onAnswer(built.normalize("NFC") === ex.word.normalize("NFC"));
    }
  };

  const unplace = (pos: number) => {
    if (resolved) return;
    setPlaced((p) => p.filter((_, i) => i !== pos));
  };

  return (
    <div className="flex flex-col gap-5">
      <Prompt>Kọ ọ̀rọ̀ náà — to àwọn sílébù jọ</Prompt>
      <div className="text-center font-mono text-6xl font-bold text-text-dark">{ex.n}</div>

      <div className="flex min-h-16 flex-wrap items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border bg-background/70 p-4">
        {placed.length === 0 ? (
          <span className="text-sm text-muted">Tẹ àwọn sílébù nísàlẹ̀…</span>
        ) : (
          placed.map((idx, pos) => (
            <button
              key={`${idx}-${pos}`}
              type="button"
              onClick={() => unplace(pos)}
              className="rounded-xl border border-primary-green bg-pale-green px-3 py-2 font-serif text-xl font-semibold text-deep-green"
            >
              {ex.syllables[idx]}
            </button>
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {ex.order.map((idx) => (
          <button
            key={idx}
            type="button"
            disabled={resolved || placed.includes(idx)}
            onClick={() => place(idx)}
            className={`rounded-xl border px-4 py-3 font-serif text-xl font-semibold transition-all ${
              placed.includes(idx)
                ? "border-border bg-background/40 text-muted/40"
                : "border-border bg-warm-cream text-text-dark shadow-button hover:bg-pale-green active:scale-95"
            }`}
          >
            {ex.syllables[idx]}
          </button>
        ))}
      </div>
      {resolved ? (
        <p className="text-center font-serif text-2xl font-semibold text-deep-green">{ex.word}</p>
      ) : null}
    </div>
  );
}

// ---- fill-syllable: the missing piece ------------------------------------------------

export function FillSyllableExercise({
  ex,
  resolved,
  onAnswer,
}: ExerciseProps<Extract<Exercise, { kind: "fill-syllable" }>>) {
  const [picked, setPicked] = useState<string | null>(null);
  const correct = ex.syllables[ex.blankIndex];
  return (
    <div className="flex flex-col gap-5">
      <Prompt>Sílébù wo ló sọnù? ({ex.n})</Prompt>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {ex.syllables.map((s, i) =>
          i === ex.blankIndex && !resolved ? (
            <span
              key={i}
              className="flex h-12 min-w-14 items-center justify-center rounded-xl border-2 border-dashed border-gold bg-gold/10 px-2 font-serif text-xl font-bold text-gold"
            >
              ?
            </span>
          ) : (
            <span
              key={i}
              className={`flex h-12 items-center justify-center rounded-xl border px-3 font-serif text-xl font-semibold ${
                i === ex.blankIndex
                  ? "border-primary-green bg-pale-green text-deep-green"
                  : "border-border bg-background/70 text-text-dark"
              }`}
            >
              {s}
            </span>
          ),
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ex.options.map((o) => (
          <OptionButton
            key={o}
            label={o}
            state={optionState(o, correct, picked, resolved)}
            disabled={resolved}
            onClick={() => {
              setPicked(o);
              onAnswer(o === correct);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---- type-number: production, the hardest direction -----------------------------------

export function TypeNumberExercise({
  ex,
  resolved,
  onAnswer,
}: ExerciseProps<Extract<Exercise, { kind: "type-number" }>>) {
  const [typed, setTyped] = useState("");
  return (
    <div className="flex flex-col gap-5">
      <Prompt>Tẹ nọ́mbà náà (type it in digits)</Prompt>
      <div className="break-words text-center font-serif text-4xl font-bold leading-tight text-deep-green [overflow-wrap:anywhere]">
        {ex.word}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!resolved && typed.trim() !== "") onAnswer(Number(typed.trim()) === ex.n);
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          disabled={resolved}
          aria-label="Your answer in digits"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-center font-mono text-3xl text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
        />
        <button
          type="submit"
          disabled={resolved || typed.trim() === ""}
          className="rounded-2xl bg-primary-green px-5 py-3 text-sm font-bold text-warm-cream transition-colors hover:bg-deep-green disabled:opacity-50"
        >
          Dán wò
        </button>
      </form>
      {resolved ? (
        <p className="text-center font-mono text-2xl font-bold text-deep-green">{ex.n}</p>
      ) : null}
    </div>
  );
}

// ---- anchor: which ten/score does this build from? -------------------------------------

export function AnchorExercise({
  ex,
  resolved,
  onAnswer,
}: ExerciseProps<Extract<Exercise, { kind: "anchor" }>>) {
  const [picked, setPicked] = useState<number | null>(null);
  const sign = ex.relation === "subtract" ? "−" : "+";
  return (
    <div className="flex flex-col gap-5">
      <Prompt>Ìpìlẹ̀ wo ni? (which anchor does it build from?)</Prompt>
      <div className="break-words text-center font-serif text-3xl font-bold leading-tight text-deep-green [overflow-wrap:anywhere]">
        {ex.word}
      </div>
      <div className="text-center font-mono text-4xl font-bold text-text-dark">
        {ex.n} = <span className="text-gold">?</span> {sign} {ex.delta}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ex.options.map((o) => (
          <OptionButton
            key={o}
            label={String(o)}
            big
            state={optionState(o, ex.answer, picked, resolved)}
            disabled={resolved}
            onClick={() => {
              setPicked(o);
              onAnswer(o === ex.answer);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---- money: naira phrases to amounts ------------------------------------------------------

export function MoneyExercise({
  ex,
  resolved,
  onAnswer,
}: ExerciseProps<Extract<Exercise, { kind: "money" }>>) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-5">
      <Prompt>Èló ni? (how much is this?)</Prompt>
      <div className="break-words text-center font-serif text-3xl font-bold leading-tight text-deep-green [overflow-wrap:anywhere]">
        {ex.phrase}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ex.options.map((o) => (
          <OptionButton
            key={o}
            label={`₦${o.toLocaleString()}`}
            state={optionState(o, ex.amount, picked, resolved)}
            disabled={resolved}
            onClick={() => {
              setPicked(o);
              onAnswer(o === ex.amount);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---- Dispatcher ------------------------------------------------------------------------------

export function ExerciseView({
  ex,
  resolved,
  onAnswer,
}: {
  ex: Exercise;
  resolved: boolean;
  onAnswer: (correct: boolean) => void;
}) {
  switch (ex.kind) {
    case "count":
      return <CountExercise ex={ex} resolved={resolved} onAnswer={onAnswer} />;
    case "subitize":
      return <SubitizeExercise ex={ex} resolved={resolved} onAnswer={onAnswer} />;
    case "sequence":
      return <SequenceExercise ex={ex} resolved={resolved} onAnswer={onAnswer} />;
    case "match":
      return <MatchExercise ex={ex} resolved={resolved} onAnswer={onAnswer} />;
    case "pick-word":
      return <PickWordExercise ex={ex} resolved={resolved} onAnswer={onAnswer} />;
    case "pick-number":
      return <PickNumberExercise ex={ex} resolved={resolved} onAnswer={onAnswer} />;
    case "spell":
      return <SpellExercise ex={ex} resolved={resolved} onAnswer={onAnswer} />;
    case "fill-syllable":
      return <FillSyllableExercise ex={ex} resolved={resolved} onAnswer={onAnswer} />;
    case "type-number":
      return <TypeNumberExercise ex={ex} resolved={resolved} onAnswer={onAnswer} />;
    case "anchor":
      return <AnchorExercise ex={ex} resolved={resolved} onAnswer={onAnswer} />;
    case "money":
      return <MoneyExercise ex={ex} resolved={resolved} onAnswer={onAnswer} />;
  }
}
