"use client";

import { useState } from "react";
import {
  digitSequenceToYoruba,
  explainNumber,
  nairaToYoruba,
  numericInputToYoruba,
  type YorubaMode,
} from "@/lib/yorubaNumbers";
import { downloadShareCard } from "@/lib/shareCard";

interface ConverterPanelProps {
  mode: YorubaMode;
}

const REPORT_URL = "https://github.com/SojiJoro/K-/issues/new";

export function ConverterPanel({ mode }: ConverterPanelProps) {
  const [value, setValue] = useState("25");
  const yoruba = numericInputToYoruba(value, mode);
  const digitYoruba = digitSequenceToYoruba(value, mode);
  const isValid = value.trim() === "" || yoruba !== "";

  const numeric = Number(value.replace(/[,_\s]/g, ""));
  const explanation =
    Number.isInteger(numeric) && mode === "traditional"
      ? explainNumber(numeric)
      : null;
  const naira =
    Number.isFinite(numeric) && value.trim() !== "" ? nairaToYoruba(numeric, mode) : "";

  const reportHref = `${REPORT_URL}?title=${encodeURIComponent(
    `Wrong number: ${value} (${mode})`,
  )}&body=${encodeURIComponent(
    `Value: ${value}\nMode: ${mode}\nApp said: ${yoruba}\nIt should be: `,
  )}`;

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
        {yoruba ? (
          <button
            type="button"
            onClick={() => downloadShareCard(value.trim(), yoruba)}
            title="Pín (share as image)"
            className="shrink-0 rounded-full border border-border bg-warm-cream px-4 py-2 text-xs font-bold text-primary-green transition-colors hover:bg-pale-green"
          >
            Pín ↓
          </button>
        ) : null}
      </div>

      {explanation ? (
        <div className="rounded-3xl border border-gold/40 bg-background/70 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Kí ló dé? (Why?)
          </p>
          <p className="mt-2 font-mono text-lg font-bold text-text-dark">
            {explanation.summary}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {explanation.relation === "subtract" ? (
              <>
                Yorùbá counts this <em>down</em> from the next anchor:{" "}
                <span className="font-semibold text-deep-green">
                  {explanation.parts[0].word}
                </span>{" "}
                ({explanation.parts[0].value}) short of{" "}
                <span className="font-semibold text-deep-green">
                  {explanation.anchor.word}
                </span>{" "}
                ({explanation.anchor.value}).
              </>
            ) : (
              <>
                Built <em>up</em> from the anchor below:{" "}
                <span className="font-semibold text-deep-green">
                  {explanation.anchor.word}
                </span>{" "}
                ({explanation.anchor.value}) plus{" "}
                <span className="font-semibold text-deep-green">
                  {explanation.parts[0].word}
                </span>{" "}
                ({explanation.parts[0].value}).
              </>
            )}
          </p>
        </div>
      ) : null}

      {naira ? (
        <div className="rounded-3xl border border-border bg-background/70 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Ní owó (as money)
          </p>
          <p className="mt-1 break-words font-serif text-xl leading-snug text-deep-green [overflow-wrap:anywhere]">
            ₦ — {naira}
          </p>
        </div>
      ) : null}

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
        Desímàlì lo “ààmì” lẹ́yìn iye odidi, lẹ́yìn náà a ka díjítì
        kọ̀ọ̀kan.
        {!isValid
          ? " Only digits, an optional sign, grouping commas, and one decimal point are supported."
          : ""}{" "}
        <a
          href={reportHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary-green underline-offset-2 hover:underline"
        >
          Ṣe àròyé — report a wrong number
        </a>
      </p>
    </div>
  );
}
