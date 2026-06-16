"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

interface Recipe {
  id: string;
  title: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  instructions: string[];
  imageUrl: string | null;
  ingredients: Ingredient[];
}

export default function RecipeDetailClient({ recipe }: { recipe: Recipe }) {
  const [servings, setServings] = useState<number>(recipe.servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const multiplier = servings / recipe.servings;

  const handleIncrement = () => {
    setServings((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setServings((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Format decimal numbers nicely (e.g. 1.5, 2, 0.75)
  const formatAmount = (amount: number) => {
    const scaled = amount * multiplier;
    // Round to 2 decimal places to avoid floating point issues (e.g., 0.30000000004)
    const rounded = Math.round((scaled + Number.EPSILON) * 100) / 100;
    return rounded.toString();
  };

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8 sm:py-12 transition-colors duration-300">
      {/* Decorative background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-zinc-200/20 dark:bg-zinc-900/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-zinc-200/20 dark:bg-zinc-900/10 blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto z-10 space-y-6">
        
        {/* Navigation / Header controls */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Tarif Aramaya Dön
          </Link>
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full">
            Tarif Detay Sayfası
          </div>
        </div>

        {/* Recipe Header Card */}
        <div className="overflow-hidden bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg dark:shadow-2xl/20 rounded-3xl transition-colors duration-300">
          
          {/* Recipe Image or Fallback */}
          <div className="relative w-full h-[250px] sm:h-[360px] bg-zinc-100 dark:bg-zinc-950 overflow-hidden border-b border-zinc-200/80 dark:border-zinc-800/80">
            {recipe.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-zinc-200 to-zinc-100 dark:from-zinc-900 dark:to-zinc-850 flex flex-col items-center justify-center p-6 text-center gap-3">
                <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-550">Görsel Eklenmemiş</span>
                </div>
              </div>
            )}
            
            {/* Absolute bottom overlay title */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm">
                {recipe.title}
              </h1>
            </div>
          </div>

          {/* Durations & Quick Stats */}
          <div className="grid grid-cols-3 divide-x divide-zinc-150 dark:divide-zinc-800/80 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 py-4.5 text-center">
            
            <div className="flex flex-col items-center justify-center px-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Hazırlama
              </span>
              <span className="mt-1 text-sm sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1">
                <svg className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.prepTime} dk
              </span>
            </div>

            <div className="flex flex-col items-center justify-center px-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Pişirme
              </span>
              <span className="mt-1 text-sm sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1">
                <svg className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
                {recipe.cookTime} dk
              </span>
            </div>

            <div className="flex flex-col items-center justify-center px-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Toplam Süre
              </span>
              <span className="mt-1 text-sm sm:text-lg font-bold text-zinc-850 dark:text-zinc-50 flex items-center gap-1">
                <svg className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {recipe.prepTime + recipe.cookTime} dk
              </span>
            </div>

          </div>

          {/* Main Recipe Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-zinc-200/80 dark:divide-zinc-800/80">
            
            {/* Ingredients column (2/5 span) */}
            <div className="md:col-span-2 p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Malzemeler
                  </h2>
                  <span className="text-xs text-zinc-450 dark:text-zinc-500 font-medium">
                    (Seçerek hazırlayın)
                  </span>
                </div>

                {/* Servings Portions Selector */}
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Porsiyon: <span className="text-zinc-900 dark:text-zinc-100 font-extrabold text-sm">{servings} Kişilik</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 p-1">
                    <button
                      onClick={handleDecrement}
                      aria-label="Porsiyonu Azalt"
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-650 hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-[0.9] transition-all font-bold cursor-pointer"
                    >
                      －
                    </button>
                    <div className="w-8 text-center text-sm font-bold text-zinc-850 dark:text-zinc-50">
                      {servings}
                    </div>
                    <button
                      onClick={handleIncrement}
                      aria-label="Porsiyonu Artır"
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-650 hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-[0.9] transition-all font-bold cursor-pointer"
                    >
                      ＋
                    </button>
                  </div>
                </div>
              </div>

              {/* Ingredients List */}
              <ul className="space-y-2.5">
                {recipe.ingredients.map((ing) => {
                  const isChecked = checkedIngredients[ing.id];
                  return (
                    <li
                      key={ing.id}
                      onClick={() => toggleIngredient(ing.id)}
                      className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                        isChecked
                          ? "bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200/40 dark:border-zinc-800/40 opacity-55"
                          : "bg-white dark:bg-zinc-950 border-zinc-150 hover:border-zinc-250 dark:border-zinc-850/80 dark:hover:border-zinc-750"
                      }`}
                    >
                      {/* Custom checkbox visual */}
                      <div
                        className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 border transition-all duration-200 ${
                          isChecked
                            ? "bg-zinc-900 border-zinc-900 dark:bg-zinc-50 dark:border-zinc-50 text-white dark:text-zinc-950"
                            : "border-zinc-300 dark:border-zinc-700 bg-transparent"
                        }`}
                      >
                        {isChecked && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Ingredient Text */}
                      <span
                        className={`text-sm font-medium flex-1 text-zinc-800 dark:text-zinc-200 ${
                          isChecked ? "line-through text-zinc-400 dark:text-zinc-600" : ""
                        }`}
                      >
                        {ing.name}
                      </span>

                      {/* Scaled Amount + Unit */}
                      <span
                        className={`text-sm font-bold tracking-tight text-zinc-600 dark:text-zinc-400 shrink-0 ${
                          isChecked ? "text-zinc-400 dark:text-zinc-650" : ""
                        }`}
                      >
                        {formatAmount(ing.amount)} {ing.unit}
                      </span>
                    </li>
                  );
                })}
              </ul>

            </div>

            {/* Preparation Steps column (3/5 span) */}
            <div className="md:col-span-3 p-6 sm:p-8 space-y-6">
              
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Hazırlanışı
              </h2>

              <div className="space-y-6 relative before:absolute before:inset-y-3 before:left-4 before:w-[2px] before:bg-zinc-100 dark:before:bg-zinc-800/80">
                {recipe.instructions.map((step, idx) => {
                  const isCompleted = completedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`flex gap-4 relative select-none cursor-pointer group ${
                        isCompleted ? "opacity-60" : ""
                      }`}
                    >
                      {/* Step Number Circle Indicator */}
                      <div
                        className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300 z-10 ${
                          isCompleted
                            ? "bg-zinc-900 border-zinc-900 dark:bg-zinc-50 dark:border-zinc-50 text-white dark:text-zinc-950"
                            : "bg-white dark:bg-zinc-900 border-zinc-250 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 group-hover:border-zinc-400 dark:group-hover:border-zinc-500"
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      {/* Step Text Block */}
                      <div className="pt-1.5 flex-1">
                        <p
                          className={`text-sm leading-relaxed font-medium text-zinc-750 dark:text-zinc-300 transition-all duration-200 ${
                            isCompleted ? "line-through text-zinc-400 dark:text-zinc-650" : ""
                          }`}
                        >
                          {step}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
