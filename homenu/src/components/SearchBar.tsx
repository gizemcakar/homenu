"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import FavoriteButton from "./FavoriteButton";

type Ingredient = { id?: string; name: string; amount?: number; unit?: string };
type Recipe = {
  id: string;
  title: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  ingredients: Ingredient[];
};

export default function SearchBar({
  placeholder = "Örn: ekşi maya, lor peyniri, yumurta...",
  onSearch,
}: {
  placeholder?: string;
  onSearch?: (ingredients: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"all" | "any">("any");
  const [results, setResults] = useState<Recipe[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status } = useSession();
  const [favoritedIds, setFavoritedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/favorites")
        .then((res) => (res.ok ? res.json() : []))
        .then((data: any[]) => {
          const ids: Record<string, boolean> = {};
          data.forEach((recipe) => {
            ids[recipe.id] = true;
          });
          setFavoritedIds(ids);
        })
        .catch((err) => console.error("Error loading favorites", err));
    } else {
      setFavoritedIds({});
    }
  }, [status]);

  const handleFavoriteToggle = (recipeId: string, isFavorited: boolean) => {
    setFavoritedIds((prev) => ({
      ...prev,
      [recipeId]: isFavorited,
    }));
  };

  const parseIngredients = (value: string) =>
    value
      .split(",")
      .map((ingredient) => ingredient.trim())
      .filter(Boolean)
      .map((s) => s.toLowerCase());

  async function performSearch(ingredients: string[], source: "category" | "manual" = "manual") {
    if (ingredients.length === 0) {
      setError("Lütfen en az bir malzeme girin.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const ingredientsParam = ingredients.join(",");
      const res = await fetch(
        `/api/search?ingredients=${encodeURIComponent(ingredientsParam)}&mode=${encodeURIComponent(
          mode
        )}&source=${source}`
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();
      setResults(json.data ?? []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Search fetch error", err);
      setError("Arama sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResults(null);
    const ingredients = parseIngredients(query);
    onSearch?.(ingredients);
    // Manuel arama: kendi tarifleri de dahil
    await performSearch(ingredients, "manual");
  }

  const searchCategory = async (ingredientsStr: string) => {
    setQuery(ingredientsStr);
    setResults(null);
    const ingredients = parseIngredients(ingredientsStr);
    onSearch?.(ingredients);
    // Bento Grid kategori araması: kendi tarifleri dahil değil
    await performSearch(ingredients, "category");
  };

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="group flex w-full flex-col gap-3 rounded-2xl border border-card-border bg-card-bg/75 p-3 shadow-sm backdrop-blur-md transition-shadow duration-200 focus-within:shadow-lg sm:flex-row sm:items-center sm:p-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-foreground/[0.03] px-3 py-2 ring-1 ring-transparent transition-all duration-200 group-focus-within:bg-foreground/[0.05] group-focus-within:ring-primary/20 sm:px-4 sm:py-3">
            <span className="text-lg leading-none text-foreground/45" aria-hidden="true">
              ⌕
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/45 sm:text-base"
              aria-label="Malzemeleri virgülle ayırarak gir"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-md bg-card-bg p-1 ring-1 ring-card-border">
              <button
                type="button"
                onClick={() => setMode("all")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  mode === "all" ? "bg-primary text-white" : "text-foreground/70"
                }`}
              >
                Tümünü İçerenler
              </button>
              <button
                type="button"
                onClick={() => setMode("any")}
                className={`ml-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                  mode === "any" ? "bg-primary text-white" : "text-foreground/70"
                }`}
              >
                Herhangi Birini İçerenler
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-medium tracking-wide text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.99] sm:w-auto sm:text-base"
            >
              {loading ? "Aranıyor..." : "Malzeme Ara"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-4">
        {error && (
          <div className="rounded-md border border-red-250/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {results && (
          <div className="flex justify-end mb-4 animate-fade-in">
            <button
              onClick={() => {
                setResults(null);
                setQuery("");
                setError(null);
              }}
              className="text-xs font-bold text-foreground/50 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              ← Arama Sonuçlarını Temizle ve Kategorilere Dön
            </button>
          </div>
        )}

        {results && results.length === 0 && (
          <div className="mt-4 rounded-md border border-card-border bg-card-bg/80 p-6 text-center text-sm text-foreground/70">
            Eşleşen tarif bulunamadı
          </div>
        )}

        {results && results.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 animate-fade-in">
            {results.map((r) => (
              <Link href={`/recipe/${r.id}`} key={r.id} className="block group">
                <article className="h-full rounded-2xl border border-card-border bg-card-bg p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-card-border/80 cursor-pointer active:scale-[0.99] flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {r.title}
                      </h3>
                      <FavoriteButton
                        recipeId={r.id}
                        initialIsFavorited={!!favoritedIds[r.id]}
                        onToggle={handleFavoriteToggle}
                      />
                    </div>
                    <div className="mt-2.5 flex items-center gap-4 text-xs font-semibold text-foreground/60">
                      <span className="flex items-center gap-1">
                        ⏱️ Hazırlık: {r.prepTime ?? "-"} dk
                      </span>
                      <span className="flex items-center gap-1">
                        🍳 Pişirme: {r.cookTime ?? "-"} dk
                      </span>
                    </div>
                    <div className="mt-4 text-xs text-foreground/60">
                      <strong className="text-foreground/80 font-bold block mb-1">Malzemeler:</strong>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {r.ingredients.slice(0, 5).map((ing, i) => (
                          <span key={i} className="inline-block px-2.5 py-1 bg-background rounded-lg text-foreground/85 text-[10px] font-medium border border-card-border">
                            {ing.name}
                          </span>
                        ))}
                        {r.ingredients.length > 5 && (
                          <span className="inline-block px-2.5 py-1 bg-background text-foreground/50 text-[10px] font-bold">
                            +{r.ingredients.length - 5} daha
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-3 border-t border-card-border flex items-center justify-between text-xs font-bold text-foreground/85 group-hover:text-primary transition-colors">
                    <span>Detayları ve Yapılışı Gör</span>
                    <span className="text-sm transition-transform group-hover:translate-x-1 inline-block">→</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {!results && !loading && (
          <div className="mt-12 w-full animate-fade-in">
            <h2 className="text-center text-xs font-semibold tracking-[0.15em] text-foreground/45 uppercase mb-6">
              Popüler Malzeme Kombinasyonlarını Keşfedin
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Pratik Kahvaltı */}
              <button
                type="button"
                onClick={() => searchCategory("yumurta, peynir, ekmek")}
                className="group text-left relative overflow-hidden md:col-span-2 rounded-2xl border border-card-border bg-card-bg/60 p-6 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[160px] border-t-2 border-t-amber-500/80 hover:bg-card-bg/85"
              >
                <div className="z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                      Güne Harika Başlayın
                    </span>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      Pratik Kahvaltı
                    </h3>
                    <p className="mt-1.5 text-xs text-foreground/60 max-w-md leading-relaxed">
                      Yumurta, peynir ve ekmekle hazırlanan nefis sabah lezzetleri.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-background px-2.5 py-0.5 rounded border border-card-border font-medium text-foreground/80">yumurta</span>
                    <span className="text-[10px] bg-background px-2.5 py-0.5 rounded border border-card-border font-medium text-foreground/80">peynir</span>
                    <span className="text-[10px] bg-background px-2.5 py-0.5 rounded border border-card-border font-medium text-foreground/80">ekmek</span>
                  </div>
                </div>
                <span className="absolute right-4 bottom-4 text-5xl opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-300" role="img" aria-label="kahvaltı">
                  🍳
                </span>
              </button>

              {/* Card 2: Akşam Yemeği */}
              <button
                type="button"
                onClick={() => searchCategory("tavuk, patates, soğan")}
                className="group text-left relative overflow-hidden md:col-span-1 rounded-2xl border border-card-border bg-card-bg/60 p-6 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[160px] border-t-2 border-t-red-800/80 hover:bg-card-bg/85"
              >
                <div className="z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-red-800/10 text-red-800 dark:text-red-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                      Doyurucu & Klasik
                    </span>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      Akşam Yemeği
                    </h3>
                    <p className="mt-1.5 text-xs text-foreground/60 leading-relaxed">
                      Tavuk, patates ve soğanla hazırlanan doyurucu akşam yemekleri.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-background px-2.5 py-0.5 rounded border border-card-border font-medium text-foreground/80">tavuk</span>
                    <span className="text-[10px] bg-background px-2.5 py-0.5 rounded border border-card-border font-medium text-foreground/80">patates</span>
                  </div>
                </div>
                <span className="absolute right-4 bottom-4 text-5xl opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-300" role="img" aria-label="akşam yemeği">
                  🍗
                </span>
              </button>

              {/* Card 3: Tatlı Kaçamağı */}
              <button
                type="button"
                onClick={() => searchCategory("çikolata, süt, un, şeker")}
                className="group text-left relative overflow-hidden md:col-span-1 rounded-2xl border border-card-border bg-card-bg/60 p-6 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[160px] border-t-2 border-t-pink-500/80 hover:bg-card-bg/85"
              >
                <div className="z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-700 dark:text-pink-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                      Tatlı Krizlerine
                    </span>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      Tatlı Kaçamağı
                    </h3>
                    <p className="mt-1.5 text-xs text-foreground/60 leading-relaxed">
                      Çikolata ve sütle yapabileceğiniz enfes kaçamaklar.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-background px-2.5 py-0.5 rounded border border-card-border font-medium text-foreground/80">çikolata</span>
                    <span className="text-[10px] bg-background px-2.5 py-0.5 rounded border border-card-border font-medium text-foreground/80">süt</span>
                  </div>
                </div>
                <span className="absolute right-4 bottom-4 text-5xl opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-300" role="img" aria-label="tatlı">
                  🍫
                </span>
              </button>

              {/* Card 4: Fit & Sağlıklı */}
              <button
                type="button"
                onClick={() => searchCategory("yulaf, muz, bal")}
                className="group text-left relative overflow-hidden md:col-span-1 rounded-2xl border border-card-border bg-card-bg/60 p-6 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[160px] border-t-2 border-t-emerald-500/80 hover:bg-card-bg/85"
              >
                <div className="z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                      Hafif & Enerjik
                    </span>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      Fit & Sağlıklı
                    </h3>
                    <p className="mt-1.5 text-xs text-foreground/60 leading-relaxed">
                      Yulaf, muz ve bal ile hafif ve besleyici lezzetler.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-background px-2.5 py-0.5 rounded border border-card-border font-medium text-foreground/80">yulaf</span>
                    <span className="text-[10px] bg-background px-2.5 py-0.5 rounded border border-card-border font-medium text-foreground/80">muz</span>
                  </div>
                </div>
                <span className="absolute right-4 bottom-4 text-5xl opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-300" role="img" aria-label="sağlıklı">
                  🥣
                </span>
              </button>

              {/* Card 5: İtalyan Rüzgarı */}
              <button
                type="button"
                onClick={() => searchCategory("makarna, domates, sarımsak")}
                className="group text-left relative overflow-hidden md:col-span-1 rounded-2xl border border-card-border bg-card-bg/60 p-6 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[160px] border-t-2 border-t-orange-500/80 hover:bg-card-bg/85"
              >
                <div className="z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-355 text-[10px] font-bold uppercase tracking-wider mb-2">
                      Akdeniz Esintisi
                    </span>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      İtalyan Rüzgarı
                    </h3>
                    <p className="mt-1.5 text-xs text-foreground/60 leading-relaxed">
                      Makarna ve taze domates soslu Akdeniz klasikleri.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-background px-2.5 py-0.5 rounded border border-card-border font-medium text-foreground/80">makarna</span>
                    <span className="text-[10px] bg-background px-2.5 py-0.5 rounded border border-card-border font-medium text-foreground/80">domates</span>
                  </div>
                </div>
                <span className="absolute right-4 bottom-4 text-5xl opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-300" role="img" aria-label="makarna">
                  🍝
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


