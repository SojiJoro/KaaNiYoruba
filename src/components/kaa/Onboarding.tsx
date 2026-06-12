"use client";

import { Fragment, useEffect, useState } from "react";
import { toYoruba } from "@/lib/yorubaNumbers";
import type { KaaSettings } from "./types";

const ONBOARD_FEATURED = [
  { n: 20, note: "one score" },
  { n: 35, note: "five less than forty" },
  { n: 75, note: "five less than eighty" },
  { n: 200, note: "ten twenties" },
];

export function OnboardingOverlay({
  settings,
  setSetting,
  onFinish,
}: {
  settings: KaaSettings;
  setSetting: <K extends keyof KaaSettings>(key: K, value: KaaSettings[K]) => void;
  onFinish: () => void;
}) {
  const [step, setStep] = useState(0);
  const [featured, setFeatured] = useState(0);

  // Rotate the featured number on the welcome step.
  useEffect(() => {
    if (step !== 0) return undefined;
    const id = setInterval(
      () => setFeatured((f) => (f + 1) % ONBOARD_FEATURED.length),
      2600,
    );
    return () => clearInterval(id);
  }, [step]);

  const f = ONBOARD_FEATURED[featured];

  return (
    <div className="onboard" role="dialog" aria-label="Welcome">
      <div className="onboard-inner">
        {step === 0 && (
          <div className="onboard-step">
            <p className="onboard-hello">Ẹ káàbọ̀ — welcome</p>
            <h1 className="onboard-wordmark">Kàá</h1>
            <p className="onboard-tag">
              A calculator that counts in Yorùbá.
              <br />
              Every number you type becomes words.
            </p>
            <div className="onboard-featured" key={f.n}>
              <span className="onboard-featured-n">{f.n}</span>
              <span className="onboard-featured-w">
                {toYoruba(f.n, "traditional")}
              </span>
              <span className="onboard-featured-note">{f.note}</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="onboard-step">
            <p className="onboard-hello">Yan ọ̀nà kíkà rẹ</p>
            <h2 className="onboard-title">How should Kàá count?</h2>
            <div className="mode-cards onboard-modes">
              <button
                type="button"
                className={
                  "mode-card" +
                  (settings.numberMode === "traditional" ? " mode-card-on" : "")
                }
                onClick={() => setSetting("numberMode", "traditional")}
              >
                <span className="mode-card-name">Àtọwọ́dọ́wọ́</span>
                <span className="mode-card-en">
                  Traditional — the full vigesimal system, counting in scores and
                  subtraction
                </span>
                <span className="mode-card-ex">75 → Márùndínlọ́gọ́rin</span>
              </button>
              <button
                type="button"
                className={
                  "mode-card" +
                  (settings.numberMode === "modern" ? " mode-card-on" : "")
                }
                onClick={() => setSetting("numberMode", "modern")}
              >
                <span className="mode-card-name">Òde-òní</span>
                <span className="mode-card-en">
                  Modern — simpler additive phrasing, easier for learners
                </span>
                <span className="mode-card-ex">75 → Àádọ́rin àti Márùn-ún</span>
              </button>
            </div>
            <p className="onboard-fine">You can switch anytime in Ètò (Settings).</p>
          </div>
        )}

        {step === 2 && (
          <div className="onboard-step">
            <p className="onboard-hello">Ohun tí o lè ṣe</p>
            <h2 className="onboard-title">Four ways to use Kàá</h2>
            <ul className="onboard-features">
              <li>
                <b>Ìṣirò</b>
                <span>Calculate — see and hear every expression in Yorùbá</span>
              </li>
              <li>
                <b>Ìtàn</b>
                <span>History — every result kept in numbers and words</span>
              </li>
              <li>
                <b>Yípadà</b>
                <span>Convert — any number, phone digits, or decimals</span>
              </li>
              <li>
                <b>Kọ́ ẹ̀kọ́</b>
                <span>Learn — quiz yourself from Òdo to Mọ́kàndínlọ́gọ́rùn</span>
              </li>
            </ul>
          </div>
        )}

        <div className="onboard-foot">
          <div className="onboard-dots" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className={"dot" + (i === step ? " dot-on" : "")}></span>
            ))}
          </div>
          <div className="onboard-actions">
            {step < 2 ? (
              <Fragment>
                <button type="button" className="link-btn" onClick={onFinish}>
                  Fò — skip
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setStep(step + 1)}
                >
                  Tẹ̀síwájú →
                </button>
              </Fragment>
            ) : (
              <button type="button" className="primary-btn wide" onClick={onFinish}>
                Bẹ̀rẹ̀ — start counting
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
