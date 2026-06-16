import SearchBar from "@/src/components/SearchBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-12 sm:px-6 lg:px-8">
      <main className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 rounded-3xl border border-black/5 bg-white px-6 py-12 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.35)] sm:px-10 sm:py-16">
        <section className="flex w-full max-w-3xl flex-col items-center gap-4 text-center">
          <p className="rounded-full border border-black/10 bg-black/[0.03] px-4 py-1.5 text-xs font-medium tracking-[0.14em] text-black/55 uppercase">
            HoMenu Arama
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Evinizdeki malzemelerle tarif bulun
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-black/60 sm:text-base">
            Malzemeleri virgulle ayirarak yazin. Arama islemini bir tikla
            baslatin.
          </p>
        </section>

        <SearchBar />
      </main>
    </div>
  );
}
