import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Kàá — the Yorùbá number calculator",
  description:
    "Kàá is a calculator that puts Yorùbá first: every digit, operator, and result rendered in real Yorùbá with full diacritics. Learn why 35 is 'five less than forty'.",
};

export default function AboutPage() {
  return (
    <main className="yoruba-pattern min-h-screen px-5 py-10 text-text-dark">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
            Nípa Kàá · About
          </p>
          <h1 className="mt-2 font-serif text-5xl font-black tracking-tight text-primary-green">
            Kàá
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted">
            A calculator that puts Yorùbá first. Every digit you tap, every
            operator, and every result is rendered in real Yorùbá with full
            diacritics — the Arabic numerals are the footnote, not the
            headline.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-primary-green px-6 py-3 text-sm font-bold text-warm-cream shadow-button transition-transform hover:scale-[1.02]"
            >
              Open the calculator
            </Link>
            <Link
              href="/onka"
              className="rounded-full border border-border bg-warm-cream px-6 py-3 text-sm font-bold text-primary-green transition-colors hover:bg-pale-green"
            >
              How Yorùbá numbers work
            </Link>
          </div>
        </header>

        <section className="rounded-[2rem] border border-border bg-warm-cream p-7 shadow-card">
          <h2 className="font-serif text-2xl text-deep-green">
            Five less than forty
          </h2>
          <p className="mt-3 leading-7 text-muted">
            Yorùbá does arithmetic <em>inside its number words</em>. 35 is{" "}
            <span className="font-serif font-semibold text-deep-green">
              Márùndínlógójì
            </span>{" "}
            — literally “five reduced from forty”. 75 is{" "}
            <span className="font-serif font-semibold text-deep-green">
              Márùndínlọ́gọ́rin
            </span>
            , five short of eighty. The system counts in twenties and reaches
            numbers by adding to or subtracting from the nearest anchor — a
            piece of mathematical heritage encoded in everyday speech. Kàá
            keeps that logic alive by making it the primary way you see every
            number.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-deep-green">What it does</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Calculator", "Add, subtract, multiply, divide — results read out in Yorùbá first."],
              ["Two counting systems", "Traditional vigesimal-subtractive and the modern additive style."],
              ["Converter", "Any number — even phone-number-length digits — to its Yorùbá words."],
              ["Kí ló dé?", "Tap a number to see why it's built the way it is (35 = 40 − 5)."],
              ["Learn mode", "Flashcards and quizzes for the numbers children learn first."],
              ["Works offline", "Install it from your browser; the whole engine runs on your device."],
            ].map(([title, body]) => (
              <li
                key={title}
                className="rounded-2xl border border-border bg-warm-cream p-5"
              >
                <p className="text-sm font-bold uppercase tracking-wide text-primary-green">
                  {title}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[2rem] border border-border bg-warm-cream p-7 shadow-card">
          <h2 className="font-serif text-2xl text-deep-green">
            Ìmúdájú — verification
          </h2>
          <p className="mt-3 leading-7 text-muted">
            The 0–99 forms are hand-verified against published grammars
            (Abraham 1958; Bamgboṣe 1966) and cross-checked references. Forms
            above 100 — where published sources diverge on combining particles
            — are generated from documented rules and are open for review by
            fluent speakers. Spotted something off?{" "}
            <a
              href="https://github.com/SojiJoro/K-/issues/new"
              className="font-semibold text-primary-green underline-offset-2 hover:underline"
            >
              Report a wrong number
            </a>{" "}
            — corrections are credited.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-deep-green">
            Press &amp; partnerships
          </h2>
          <p className="mt-3 leading-7 text-muted">
            Kàá is independently built and open to collaborations with
            educators, cultural programmes, and Yorùbá-language media. Logo and
            screenshots:{" "}
            <a
              href="/icon-512.png"
              className="font-semibold text-primary-green underline-offset-2 hover:underline"
            >
              app icon (PNG)
            </a>
            {" · "}
            <a
              href="/icon.svg"
              className="font-semibold text-primary-green underline-offset-2 hover:underline"
            >
              vector (SVG)
            </a>
            . One-line description: <em>“Kàá — the calculator that counts in
            real Yorùbá.”</em>
          </p>
        </section>

        <footer className="border-t border-border pt-6 text-sm text-muted">
          <Link href="/" className="font-semibold text-primary-green hover:underline">
            ← Back to the calculator
          </Link>
        </footer>
      </article>
    </main>
  );
}
