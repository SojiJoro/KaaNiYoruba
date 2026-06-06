import { Calculator } from "@/components/Calculator";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden yoruba-pattern px-5 py-5 text-text-dark sm:py-10">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-soft-green/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-1/3 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-warm-cream/80 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl items-start justify-center sm:items-center">
        <Calculator />
      </div>
    </main>
  );
}
