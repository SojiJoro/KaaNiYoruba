"use client";

import { useState } from "react";
import {
  digitSequenceToYoruba,
  numericInputToYoruba,
  type YorubaMode,
} from "@/lib/yorubaNumbers";

interface ConverterPanelProps {
  mode: YorubaMode;
  onSpeak: (text: string) => void;
}

export function ConverterPanel({ mode, onSpeak }: ConverterPanelProps) {
  const [value, setValue] = useState("25");
  const yoruba = numericInputToYoruba(value, mode);
  const digitYoruba = digitSequenceToYoruba(value, mode);
  const isValid = value.trim() === "" || yoruba !== "";

  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-border bg-warm-cream px-6 py-6 shadow-card">
      <header>
        <h2 className="font-serif text-2xl text-deep-green">Yípadà Nọ́mbà</h2>
        <p className="mt-1 text-sm text-muted">
          Tẹ nọ́mbà, díjítì gígùn, tàbí desímàlì láti rí ọ̀rọ̀ Yorùbá rẹ̀.
        </p>
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-bold text-muted">Nọ́mbà</span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-2xl text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-green"
        />
      </label>

      <div className="mt-2 flex items-end justify-between gap-4 rounded-3xl border border-border bg-background/70 p-5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Yorùbá
          </p>
          <p className="mt-1 break-words font-serif text-[clamp(2rem,9vw,2.25rem)] leading-tight text-deep-green [overflow-wrap:anywhere] sm:text-4xl">
            {yoruba || (value.trim() ? "Nọ́mbà yìí kò pé" : "—")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSpeak(yoruba)}
          className="rounded-full bg-primary-green p-3 text-warm-cream shadow-lg shadow-primary-green/20 transition hover:bg-deep-green"
          aria-label="Gbọ́ pípè"
        >
          <SpeakerIcon />
        </button>
      </div>

      <div className="rounded-3xl border border-border bg-background/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Díjítì kọ̀ọ̀kan
          </p>
          <span className="rounded-full bg-pale-green px-3 py-1 text-[11px] font-bold text-primary-green">
            Any length
          </span>
        </div>
        <p className="mt-2 break-words font-serif text-xl leading-snug text-deep-green [overflow-wrap:anywhere]">
          {digitYoruba || "—"}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Àwọn nọ́mbà pẹ̀lú zero níwájú, nọ́mbà foonu, ID, tàbí
          nọ́mbà tó gùn ju ni a le ka díjítì kọ̀ọ̀kan.
        </p>
      </div>

      <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted">
        Àtọwọ́dọ́wọ́ (Traditional) lo èdè Yorùbá pẹ̀lú ìṣirò
        vigesimal/subtractive. Òde-òní (Modern) nlo àfikún kàn nìkan.
        Desímàlì lo “Ẹsẹ” lẹ́yìn iye odidi, lẹ́yìn náà a ka díjítì
        kọ̀ọ̀kan.
        {!isValid
          ? " Only digits, an optional sign, grouping commas, and one decimal point are supported."
          : ""}
      </p>
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg
      width="22"
      height="22"
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
