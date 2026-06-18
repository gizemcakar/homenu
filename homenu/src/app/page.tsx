import SearchBar from "@/src/components/SearchBar";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300 overflow-hidden">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] left-[5%] h-[350px] w-[350px] rounded-full bg-primary/8 blur-[100px] sm:h-[500px] sm:w-[500px]" />
        <div className="absolute top-[35%] -right-[5%] h-[300px] w-[300px] rounded-full bg-accent/6 blur-[120px] sm:h-[450px] sm:w-[450px]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 rounded-3xl border border-card-border bg-card-bg/80 backdrop-blur-md px-6 py-12 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.12)] sm:px-10 sm:py-16">
        <section className="flex w-full max-w-3xl flex-col items-center gap-4 text-center">
          <p className="rounded-full border border-card-border bg-foreground/[0.04] px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
            HoMenu Arama
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Evinizdeki malzemelerle tarif bulun
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-foreground/60 sm:text-base">
            Malzemeleri virgülle ayırarak yazın. Arama işlemini bir tıkla
            başlatın.
          </p>
        </section>

        <SearchBar />
      </main>
    </div>
  );
}
