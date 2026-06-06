import { Calculator } from '@/components/Calculator';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden yoruba-pattern px-4 py-6 text-cocoa dark:text-cream sm:py-10">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-moss/20 blur-3xl dark:bg-moss/10" />
      <div className="pointer-events-none absolute -right-28 top-1/3 h-80 w-80 rounded-full bg-rust/15 blur-3xl dark:bg-rust/10" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-paper-dark/70 blur-3xl dark:bg-cocoa-light/20" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <Calculator />
      </div>
    </main>
  );
}
