"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface IngredientInput {
  name: string;
  amount: string;
  unit: string;
}

export default function AddRecipePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [servings, setServings] = useState("4");
  const [prepTime, setPrepTime] = useState("15");
  const [cookTime, setCookTime] = useState("30");
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: "", amount: "", unit: "adet" }
  ]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Dynamic ingredient handlers
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "adet" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof IngredientInput, value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  // Dynamic preparation steps handlers
  const handleAddInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const handleRemoveInstruction = (index: number) => {
    if (instructions.length === 1) return;
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Client-side validations
    if (!title.trim()) {
      setError("Lütfen tarif başlığı girin.");
      return;
    }

    const validIngredients = ingredients.filter(ing => ing.name.trim() !== "");
    if (validIngredients.length === 0) {
      setError("Lütfen en az bir malzeme ekleyin.");
      return;
    }

    const validInstructions = instructions.filter(step => step.trim() !== "");
    if (validInstructions.length === 0) {
      setError("Lütfen en az bir tarif adımı ekleyin.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          servings: parseInt(servings, 10) || 1,
          prepTime: parseInt(prepTime, 10) || 0,
          cookTime: parseInt(cookTime, 10) || 0,
          instructions: validInstructions.map(step => step.trim()),
          ingredients: validIngredients.map(ing => ({
            name: ing.name.trim(),
            amount: parseFloat(ing.amount) || 1,
            unit: ing.unit.trim()
          }))
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Tarif eklenirken bir hata oluştu.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu. Lütfen oturum açtığınızdan emin olun ve tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background px-4 py-12 transition-colors duration-300">
      {/* Decorative background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] transition-colors" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] transition-colors" />
      </div>

      <div className="relative max-w-4xl mx-auto z-10 space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri Dön
          </Link>
          <div className="text-xs text-foreground/55">
            Yeni Tarif Ekleme Modülü
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-card-bg border border-card-border shadow-xl rounded-3xl p-6 sm:p-10 w-full transition-all duration-300">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Yeni Yemek Tarifi Ekle
            </h1>
            <p className="text-sm text-foreground/60 mt-1.5">
              Tarif detaylarını, malzemeleri ve hazırlanış adımlarını ekleyerek tarif listenizi zenginleştirin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Grid for General settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-card-border pb-8">
              
              {/* General inputs */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/50">
                  Genel Bilgiler
                </h3>

                <div className="space-y-2">
                  <label htmlFor="title" className="text-xs font-semibold text-foreground/70 block">
                    Tarif Başlığı
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Örn: Ev Yapımı Lazanya"
                    required
                    disabled={loading}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-background border border-card-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder-foreground/45 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200 disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  
                  <div className="space-y-2">
                    <label htmlFor="servings" className="text-xs font-semibold text-foreground/70 block">
                      Kişi Sayısı
                    </label>
                    <input
                      id="servings"
                      type="number"
                      min="1"
                      required
                      disabled={loading}
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-xl py-2.5 px-3 text-sm text-foreground placeholder-foreground/45 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="prepTime" className="text-xs font-semibold text-foreground/70 block">
                      Hazırlama (dk)
                    </label>
                    <input
                      id="prepTime"
                      type="number"
                      min="0"
                      required
                      disabled={loading}
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-xl py-2.5 px-3 text-sm text-foreground placeholder-foreground/45 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="cookTime" className="text-xs font-semibold text-foreground/70 block">
                      Pişirme (dk)
                    </label>
                    <input
                      id="cookTime"
                      type="number"
                      min="0"
                      required
                      disabled={loading}
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-xl py-2.5 px-3 text-sm text-foreground placeholder-foreground/45 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200 disabled:opacity-50"
                    />
                  </div>

                </div>
              </div>

              {/* Informative text box */}
              <div className="bg-primary/[0.02] border border-primary/15 rounded-2xl p-5 flex flex-col justify-center gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Kolay Tarif Paylaşımı
                    </h4>
                    <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
                      Lütfen malzemelerin miktarını ve ölçü birimlerini (gram, kaşık, su bardağı vb.) net yazmaya özen gösterin. Bu sayede tarifleriniz diğer kullanıcıların mutfaklarında daha doğru sonuçlar verecektir.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Ingredients Form Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/50">
                  Malzemeler
                </h3>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  disabled={loading}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-lg py-1.5 px-3 hover:bg-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Malzeme Ekle
                </button>
              </div>

              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    
                    {/* Ingredient Name */}
                    <div className="flex-[2.5]">
                      <input
                        type="text"
                        placeholder="Malzeme Adı (Örn: Süt)"
                        required
                        disabled={loading}
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                        className="w-full bg-background border border-card-border rounded-xl py-2.5 px-3 text-sm text-foreground placeholder-foreground/45 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                      />
                    </div>

                    {/* Ingredient Amount */}
                    <div className="flex-[1]">
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        placeholder="Miktar"
                        required
                        disabled={loading}
                        value={ingredient.amount}
                        onChange={(e) => handleIngredientChange(index, "amount", e.target.value)}
                        className="w-full bg-background border border-card-border rounded-xl py-2.5 px-3 text-sm text-foreground placeholder-foreground/45 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                      />
                    </div>

                    {/* Ingredient Unit */}
                    <div className="flex-[1.5]">
                      <select
                        disabled={loading}
                        value={ingredient.unit}
                        onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                        className="w-full bg-background border border-card-border rounded-xl py-2.5 px-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                      >
                        <option value="adet">adet</option>
                        <option value="gram">gram (g)</option>
                        <option value="kilogram">kilogram (kg)</option>
                        <option value="mililitre">mililitre (ml)</option>
                        <option value="litre">litre (l)</option>
                        <option value="su bardağı">su bardağı</option>
                        <option value="çay bardağı">çay bardağı</option>
                        <option value="yemek kaşığı">yemek kaşığı</option>
                        <option value="tatlı kaşığı">tatlı kaşığı</option>
                        <option value="çay kaşığı">çay kaşığı</option>
                        <option value="diş">diş</option>
                        <option value="paket">paket</option>
                        <option value="demet">demet</option>
                        <option value="tutam">tutam</option>
                      </select>
                    </div>

                    {/* Delete Icon */}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      disabled={loading || ingredients.length === 1}
                      className="p-2 text-foreground/40 hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                  </div>
                ))}
              </div>
            </div>

            {/* Preparation Steps Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/50">
                  Hazırlanış Adımları
                </h3>
                <button
                  type="button"
                  onClick={handleAddInstruction}
                  disabled={loading}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-lg py-1.5 px-3 hover:bg-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Adım Ekle
                </button>
              </div>

              <div className="space-y-4">
                {instructions.map((step, index) => (
                  <div key={index} className="flex gap-3 items-start animate-fadeIn">
                    
                    {/* Step number badge */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-background border border-card-border text-xs font-bold text-primary shrink-0 mt-1">
                      {index + 1}
                    </div>

                    {/* Step instruction text */}
                    <div className="flex-1">
                      <textarea
                        rows={2}
                        placeholder={`Hazırlanış adımı ${index + 1}...`}
                        required
                        disabled={loading}
                        value={step}
                        onChange={(e) => handleInstructionChange(index, e.target.value)}
                        className="w-full bg-background border border-card-border rounded-xl py-2 px-3 text-sm text-foreground placeholder-foreground/45 focus:outline-none focus:border-primary transition-colors disabled:opacity-50 resize-y min-h-[50px]"
                      />
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveInstruction(index)}
                      disabled={loading || instructions.length === 1}
                      className="p-2 text-foreground/40 hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer mt-1"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 dark:border-red-500/30 rounded-xl p-3.5 flex items-start gap-3 transition-all animate-shake">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs font-medium text-red-800 dark:text-red-300 leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-3 transition-all">
                <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-350 leading-relaxed">
                  Tarifiniz başarıyla veritabanına kaydedildi! Ana sayfaya yönlendiriliyorsunuz...
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-card-border">
              <Link
                href="/"
                className="bg-background hover:bg-card-border text-foreground/80 border border-card-border font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm active:scale-[0.98]"
              >
                İptal Et
              </Link>
              <button
                type="submit"
                disabled={loading || success}
                className="bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <span>Tarifi Kaydet</span>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
