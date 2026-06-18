"use client";

import React, { useState } from "react";
import Link from "next/link";
import FavoriteButton from "@/src/components/FavoriteButton";

type Ingredient = {
  id: string;
  name: string;
  amount: number;
  unit: string;
};

type Recipe = {
  id: string;
  title: string;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number | null;
  ingredients: Ingredient[];
};

interface FavoritesListClientProps {
  initialFavorites: Recipe[];
}

export default function FavoritesListClient({ initialFavorites }: FavoritesListClientProps) {
  const [favorites, setFavorites] = useState<Recipe[]>(initialFavorites);

  const handleToggle = (recipeId: string, isFavorited: boolean) => {
    if (!isFavorited) {
      setFavorites((prev) => prev.filter((r) => r.id !== recipeId));
    }
  };

  if (favorites.length === 0) {
    return (
      /* Empty State */
      <div className="bg-card-bg border border-card-border rounded-3xl p-10 text-center space-y-5 max-w-lg mx-auto shadow-md animate-fade-in">
        <div className="h-16 w-16 bg-background rounded-full flex items-center justify-center mx-auto text-primary animate-pulse">
          <svg className="h-8 w-8 stroke-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">
            Henüz Favori Tarifiniz Yok
          </h3>
          <p className="text-sm text-foreground/60 leading-relaxed">
            Beğendiğiniz tarifleri favorilerinize ekleyerek burada hızlıca listeleyebilirsiniz.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 text-sm shadow-sm active:scale-[0.98]"
        >
          Tarif Ara
        </Link>
      </div>
    );
  }

  return (
    /* Favorites Grid */
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {favorites.map((r) => (
        <Link href={`/recipe/${r.id}`} key={r.id} className="block group">
          <article className="h-full rounded-2xl border border-card-border bg-card-bg p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-card-border/80 cursor-pointer active:scale-[0.99] flex flex-col justify-between">
            <div>
              {/* Header: Title + Favorite Toggle Button */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {r.title}
                </h3>
                <FavoriteButton
                  recipeId={r.id}
                  initialIsFavorited={true}
                  onToggle={handleToggle}
                />
              </div>
              
              {/* Preparation & Cooking Times */}
              <div className="mt-2.5 flex items-center gap-4 text-xs font-semibold text-foreground/60">
                <span className="flex items-center gap-1">
                  ⏱️ Hazırlık: {r.prepTime ?? "-"} dk
                </span>
                <span className="flex items-center gap-1">
                  🍳 Pişirme: {r.cookTime ?? "-"} dk
                </span>
              </div>

              {/* Ingredients Badges */}
              <div className="mt-4 text-xs text-foreground/60">
                <strong className="text-foreground/80 font-bold block mb-1">Malzemeler:</strong>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {r.ingredients.slice(0, 4).map((ing, i) => (
                    <span key={i} className="inline-block px-2.5 py-1 bg-background rounded-lg text-foreground/85 text-[10px] font-medium border border-card-border">
                      {ing.name}
                    </span>
                  ))}
                  {r.ingredients.length > 4 && (
                    <span className="inline-block px-2.5 py-1 bg-background text-foreground/50 text-[10px] font-bold">
                      +{r.ingredients.length - 4} daha
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Link overlay border */}
            <div className="mt-5 pt-3 border-t border-card-border flex items-center justify-between text-xs font-bold text-foreground/85 group-hover:text-primary transition-colors">
              <span>Tarif Detaylarını Gör</span>
              <span className="text-sm transition-transform group-hover:translate-x-1 inline-block">→</span>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
