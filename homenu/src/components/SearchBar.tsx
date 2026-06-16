"use client";

import React, { useState } from "react";

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
              <article key={r.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-black">{r.title}</h3>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span>Hazırlık: {r.prepTime ?? "-"} dk</span>
                  <span>Pişirme: {r.cookTime ?? "-"} dk</span>
                </div>
                <div className="mt-3 text-sm text-gray-700">
                  <strong>Malzemeler:</strong>
                  <ul className="mt-2 list-disc pl-5">
                    {r.ingredients.map((ing, i) => (
                      <li key={i}>{ing.name}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
