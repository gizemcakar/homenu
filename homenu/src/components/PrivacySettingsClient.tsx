"use client";

import React, { useState } from "react";

interface PrivacySettingsProps {
  initialIsProfilePublic: boolean;
  initialShowFavoritesPublic: boolean;
  initialShowRecipesPublic: boolean;
}

export default function PrivacySettingsClient({
  initialIsProfilePublic,
  initialShowFavoritesPublic,
  initialShowRecipesPublic,
}: PrivacySettingsProps) {
  const [isProfilePublic, setIsProfilePublic] = useState(initialIsProfilePublic);
  const [showFavoritesPublic, setShowFavoritesPublic] = useState(initialShowFavoritesPublic);
  const [showRecipesPublic, setShowRecipesPublic] = useState(initialShowRecipesPublic);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleToggle = async (key: string, currentValue: boolean, setter: (val: boolean) => void) => {
    setLoading(key);
    setMessage(null);

    const newValue = !currentValue;
    setter(newValue); // Optimistic update

    try {
      const res = await fetch("/api/profile/privacy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [key]: newValue,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update privacy settings");
      }

      setMessage({ text: "Gizlilik ayarları başarıyla güncellendi.", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      // Revert state
      setter(currentValue);
      setMessage({ text: "Ayarlar güncellenirken bir hata oluştu.", type: "error" });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
          Gizlilik Ayarları
        </h3>
        <p className="text-xs text-foreground/60">
          Hesabınızın ve tariflerinizin diğer kullanıcılar tarafından nasıl görüntüleneceğini kontrol edin.
        </p>
      </div>

      {message && (
        <div
          className={`text-xs font-semibold py-2 px-4 rounded-xl transition-all duration-300 ${
            message.type === "success"
              ? "bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400"
              : "bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        
        {/* Toggle Profile Public */}
        <div className="flex items-center justify-between p-4 bg-background border border-card-border rounded-2xl">
          <div className="space-y-1 pr-4">
            <label className="text-sm font-bold text-foreground block">
              Profilimi Herkese Aç
            </label>
            <span className="text-xs text-foreground/60 block leading-normal">
              Kapalı olduğunda, diğer kullanıcılar profilinizi görüntüleyemez ve "Bu profil gizlidir" uyarısı alır.
            </span>
          </div>
          <button
            onClick={() => handleToggle("isProfilePublic", isProfilePublic, setIsProfilePublic)}
            disabled={loading !== null}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isProfilePublic ? "bg-primary" : "bg-card-border"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${
                isProfilePublic ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle Show Recipes Public */}
        <div className="flex items-center justify-between p-4 bg-background border border-card-border rounded-2xl">
          <div className="space-y-1 pr-4">
            <label className="text-sm font-bold text-foreground block">
              Eklediğim Tarifleri Göster
            </label>
            <span className="text-xs text-foreground/60 block leading-normal">
              Açık olduğunda, profilinizi ziyaret eden kullanıcılar eklediğiniz tariflerin listesini görebilir.
            </span>
          </div>
          <button
            onClick={() => handleToggle("showRecipesPublic", showRecipesPublic, setShowRecipesPublic)}
            disabled={loading !== null}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showRecipesPublic ? "bg-primary" : "bg-card-border"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${
                showRecipesPublic ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle Show Favorites Public */}
        <div className="flex items-center justify-between p-4 bg-background border border-card-border rounded-2xl">
          <div className="space-y-1 pr-4">
            <label className="text-sm font-bold text-foreground block">
              Favori Tariflerimi Göster
            </label>
            <span className="text-xs text-foreground/60 block leading-normal">
              Açık olduğunda, profilinizi ziyaret eden kullanıcılar beğendiğiniz tarifleri görebilir.
            </span>
          </div>
          <button
            onClick={() => handleToggle("showFavoritesPublic", showFavoritesPublic, setShowFavoritesPublic)}
            disabled={loading !== null}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showFavoritesPublic ? "bg-primary" : "bg-card-border"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${
                showFavoritesPublic ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

      </div>
    </div>
  );
}
