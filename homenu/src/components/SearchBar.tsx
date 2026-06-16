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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setResults(null);

    const ingredients = parseIngredients(query);
    onSearch?.(ingredients);

    if (ingredients.length === 0) {
      setError("Lütfen en az bir malzeme girin.");
      return;
    }

    setLoading(true);
    try {
      const ingredientsParam = ingredients.join(",");
      const res = await fetch(
        `/api/search?ingredients=${encodeURIComponent(ingredientsParam)}&mode=${encodeURIComponent(
          mode
        )}`
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

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="group flex w-full flex-col gap-3 rounded-2xl border border-black/10 bg-white/95 p-3 shadow-sm backdrop-blur-sm transition-shadow duration-200 focus-within:shadow-lg sm:flex-row sm:items-center sm:p-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-black/[0.03] px-3 py-2 ring-1 ring-transparent transition-all duration-200 group-focus-within:bg-black/[0.04] group-focus-within:ring-black/10 sm:px-4 sm:py-3">
            <span className="text-lg leading-none text-black/45" aria-hidden="true">
              ⌕
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/45 sm:text-base"
              aria-label="Malzemeleri virgülle ayırarak gir"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-md bg-white p-1 ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => setMode("all")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  mode === "all" ? "bg-black text-white" : "text-black/70"
                }`}
              >
                Tümünü İçerenler
              </button>
              <button
                type="button"
                onClick={() => setMode("any")}
                className={`ml-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                  mode === "any" ? "bg-black text-white" : "text-black/70"
                }`}
              >
                Herhangi Birini İçerenler
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-black px-5 py-3 text-sm font-medium tracking-wide text-white transition-all duration-200 hover:bg-black/85 active:scale-[0.99] sm:w-auto sm:text-base"
            >
              {loading ? "Aranıyor..." : "Malzeme Ara"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        {results && results.length === 0 && (
          <div className="mt-4 rounded-md border border-gray-100 bg-white/80 p-6 text-center text-sm text-gray-700">
            Eşleşen tarif bulunamadı
          </div>
        )}

        {results && results.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {results.map((r) => (
              <Link href={`/recipe/${r.id}`} key={r.id} className="block group">
                <article className="h-full rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 cursor-pointer active:scale-[0.99] flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors line-clamp-2">
                        {r.title}
                      </h3>
                      <FavoriteButton
                        recipeId={r.id}
                        initialIsFavorited={!!favoritedIds[r.id]}
                        onToggle={handleFavoriteToggle}
                      />
                    </div>
                    <div className="mt-2.5 flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        ⏱️ Hazırlık: {r.prepTime ?? "-"} dk
                      </span>
                      <span className="flex items-center gap-1">
                        🍳 Pişirme: {r.cookTime ?? "-"} dk
                      </span>
                    </div>
                    <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                      <strong className="text-zinc-700 dark:text-zinc-300 font-bold block mb-1">Malzemeler:</strong>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {r.ingredients.slice(0, 5).map((ing, i) => (
                          <span key={i} className="inline-block px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 text-[10px] font-medium border border-zinc-150 dark:border-zinc-750">
                            {ing.name}
                          </span>
                        ))}
                        {r.ingredients.length > 5 && (
                          <span className="inline-block px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-450 text-[10px] font-bold">
                            +{r.ingredients.length - 5} daha
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/85 flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <span>Detayları ve Yapılışı Gör</span>
                    <span className="text-sm transition-transform group-hover:translate-x-1 inline-block">→</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
