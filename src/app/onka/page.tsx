import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How Yorùbá numbers work — Ònkà Yorùbá explained",
  description:
    "The Yorùbá counting system explained: counting in twenties, the add/subtract rule, why 35 is 'five less than forty', the hundreds built on igba (200), and classical units like ọkẹ́ (20,000).",
};

function Y({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-serif font-semibold text-deep-green">{children}</span>
  );
}

export default function OnkaPage() {
  return (
    <main className="yoruba-pattern min-h-screen px-5 py-10 text-text-dark">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
            Ònkà Yorùbá
          </p>
          <h1 className="mt-2 font-serif text-4xl font-black tracking-tight text-primary-green sm:text-5xl">
            How Yorùbá numbers work
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted">
            Yorùbá has one of the world&apos;s most mathematically interesting
            counting systems: it counts in twenties and builds numbers by{" "}
            <em>subtracting</em> as often as adding. Here is the whole system
            in five short steps — try each one live in the{" "}
            <Link href="/" className="font-semibold text-primary-green hover:underline">
              calculator
            </Link>
            .
          </p>
        </header>

        <section className="rounded-[2rem] border border-border bg-warm-cream p-7 shadow-card">
          <h2 className="font-serif text-2xl text-deep-green">1 · The units, 1–10</h2>
          <p className="mt-3 leading-7 text-muted">
            <Y>Ọ̀kan</Y> (1), <Y>Méjì</Y> (2), <Y>Mẹ́ta</Y> (3), <Y>Mẹ́rin</Y> (4),{" "}
            <Y>Márùn-ún</Y> (5), <Y>Mẹ́fà</Y> (6), <Y>Méje</Y> (7), <Y>Mẹ́jọ</Y> (8),{" "}
            <Y>Mẹ́sàn-án</Y> (9), <Y>Mẹ́wàá</Y> (10). These ten words — plus the
            anchors below — generate everything else.
          </p>
        </section>

        <section className="rounded-[2rem] border border-border bg-warm-cream p-7 shadow-card">
          <h2 className="font-serif text-2xl text-deep-green">
            2 · The rule: add up to 4, subtract from 5
          </h2>
          <p className="mt-3 leading-7 text-muted">
            Between the round tens, Yorùbá adds the small numbers and{" "}
            <em>subtracts</em> the large ones. 21 is <Y>Mọ́kànlélógún</Y> — “one{" "}
            <em>on top of</em> twenty”. But 26 is <Y>Mẹ́rìndínlọ́gbọ̀n</Y> —
            “four <em>short of</em> thirty”. Units 1–4 attach upward with{" "}
            <Y>lé</Y>; units 5–9 count down from the next ten with <Y>dín</Y>.
            That is why 35 is <Y>Márùndínlógójì</Y>, five less than forty.
          </p>
        </section>

        <section className="rounded-[2rem] border border-border bg-warm-cream p-7 shadow-card">
          <h2 className="font-serif text-2xl text-deep-green">
            3 · Counting in twenties
          </h2>
          <p className="mt-3 leading-7 text-muted">
            The system is <em>vigesimal</em> — base twenty. <Y>Ogún</Y> (20) is
            the foundation: 40 is <Y>Ogójì</Y> (20×2), 60 is <Y>Ọgọ́ta</Y>{" "}
            (20×3), 80 is <Y>Ọgọ́rin</Y> (20×4), 100 is <Y>Ọgọ́rùn-ún</Y> (20×5).
            The odd tens are subtractive again: 50, <Y>Àádọ́ta</Y>, is “ten
            short of sixty”; 70, <Y>Àádọ́rin</Y>, ten short of eighty.
          </p>
        </section>

        <section className="rounded-[2rem] border border-border bg-warm-cream p-7 shadow-card">
          <h2 className="font-serif text-2xl text-deep-green">
            4 · Hundreds built on igba (200)
          </h2>
          <p className="mt-3 leading-7 text-muted">
            Above 100 the anchor becomes <Y>Igba</Y> (200). Even hundreds are
            its multiples — 600 <Y>Ẹgbẹ̀ta</Y> (200×3), 800 <Y>Ẹgbẹ̀rin</Y>{" "}
            (200×4), 1,000 <Y>Ẹgbẹ̀rún</Y> (200×5) — and the odd hundreds are
            “a hundred less”: 500 is <Y>Ẹ̀ẹ́dẹ́gbẹ̀ta</Y>, 600 minus 100.
            Compounds join base-first: 105 is <Y>Ọgọ́rùn-ún ó lé Márùn-ún</Y>{" "}
            (100 + 5), and 595 flips to subtraction — <Y>Ẹgbẹ̀ta ó dín
            Márùn-ún</Y>, 600 − 5.
          </p>
        </section>

        <section className="rounded-[2rem] border border-border bg-warm-cream p-7 shadow-card">
          <h2 className="font-serif text-2xl text-deep-green">
            5 · The big classical units
          </h2>
          <p className="mt-3 leading-7 text-muted">
            Before colonial currency, Yorùbá commerce counted cowries in large
            fixed units: <Y>Ẹgbàá</Y> (2,000) and the “bag”, <Y>Ọkẹ́</Y>{" "}
            (20,000) — so 40,000 is <Y>Ọkẹ́ méjì</Y>, two bags. Modern speech
            also borrows international scale words (<Y>Mílíọ̀nù</Y>,{" "}
            <Y>Bílíọ̀nù</Y>) for arithmetic, and Kàá supports both: the
            traditional forms where they are attested, the modern decimal
            style everywhere else.
          </p>
        </section>

        <section className="rounded-[2rem] border border-gold/40 bg-warm-cream p-7 shadow-card">
          <h2 className="font-serif text-2xl text-deep-green">Try it yourself</h2>
          <p className="mt-3 leading-7 text-muted">
            Open the{" "}
            <Link href="/" className="font-semibold text-primary-green hover:underline">
              calculator
            </Link>{" "}
            and type 35, 75, 595, or 20000 — then switch between the
            traditional and modern modes to see both layers of the language at
            work. The converter&apos;s <em>Kí ló dé?</em> panel shows the
            arithmetic inside any number you give it.
          </p>
        </section>

        <footer className="border-t border-border pt-6 text-sm text-muted">
          Sources: Abraham, <em>Dictionary of Modern Yoruba</em> (1958);
          Bamgboṣe, <em>A Grammar of Yoruba</em> (1966); full notes in the{" "}
          <a
            href="https://github.com/SojiJoro/K-/blob/main/docs/yoruba-number-logic.md"
            className="font-semibold text-primary-green hover:underline"
          >
            project research document
          </a>
          .{" "}
          <Link href="/about" className="font-semibold text-primary-green hover:underline">
            About Kàá →
          </Link>
        </footer>
      </article>
    </main>
  );
}
