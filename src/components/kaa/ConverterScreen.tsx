"use client";

import { useState } from "react";
import {
  digitSequenceToYoruba,
  numericInputToYoruba,
  type YorubaMode,
} from "@/lib/yorubaNumbers";
import { SpeakerGlyph } from "./shared";
import { VOICE_ENABLED } from "./types";

const EXAMPLES = ["75", "200", "1000", "0803", "12.05"];

export function ConverterScreen({
  mode,
  onSpeak,
}: {
  mode: YorubaMode;
  onSpeak: (text: string) => void;
}) {
  const [value, setValue] = useState("25");
  const yoruba = numericInputToYoruba(value, mode);
  const digitYoruba = digitSequenceToYoruba(value, mode);
  const empty = value.trim() === "";

  return (
    <div className="screen screen-convert">
      <header className="screen-head">
        <div>
          <h1 className="screen-title">Yípadà</h1>
          <p className="screen-sub">
            Type any number, long digit string, or decimal to see its Yorùbá
            words
          </p>
        </div>
      </header>

      <label className="convert-field">
        <span className="field-label">Nọ́mbà</span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="25"
          aria-label="Number to convert"
        />
      </label>

      <section className="convert-result">
        <div className="convert-result-head">
          <span className="eyebrow">Yorùbá</span>
          {VOICE_ENABLED && (
            <button
              type="button"
              className="speak-btn"
              aria-label="Gbọ́ pípè (hear it)"
              onClick={() => yoruba && onSpeak(yoruba)}
            >
              <SpeakerGlyph size={18} />
            </button>
          )}
        </div>
        <p className="convert-words">
          {yoruba || (empty ? "—" : "Nọ́mbà yìí kò pé")}
        </p>
      </section>

      <section className="convert-digits">
        <div className="convert-result-head">
          <span className="eyebrow">
            Díjítì kọ̀ọ̀kan <i>digit by digit</i>
          </span>
          {VOICE_ENABLED && (
            <button
              type="button"
              className="speak-btn small"
              aria-label="Gbọ́ díjítì kọ̀ọ̀kan"
              onClick={() => digitYoruba && onSpeak(digitYoruba)}
            >
              <SpeakerGlyph size={15} />
            </button>
          )}
        </div>
        <p className="convert-digit-words">{digitYoruba || "—"}</p>
        <p className="convert-note">
          For phone numbers, IDs, and values with leading zeros, each digit is
          read on its own.
        </p>
      </section>

      <div className="convert-examples">
        <span className="eyebrow">
          Gbìyànjú <i>try</i>
        </span>
        <div className="chip-row">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              className="chip"
              onClick={() => setValue(ex)}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
