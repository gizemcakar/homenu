"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProfileEditProps {
  initialName: string;
}

export default function ProfileEditClient({ initialName }: ProfileEditProps) {
  const { update } = useSession();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const trimmedName = name.trim();
    if (trimmedName === "") {
      setMessage({ text: "Ad Soyad alanı boş bırakılamaz.", type: "error" });
      setLoading(false);
      return;
    }

    if (showPasswordFields) {
      if (password.length < 6) {
        setMessage({ text: "Yeni şifre en az 6 karakter olmalıdır.", type: "error" });
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setMessage({ text: "Şifreler eşleşmiyor.", type: "error" });
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          password: showPasswordFields ? password : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Profil güncellenirken bir hata oluştu.");
      }

      // Update next-auth session token
      await update({ name: trimmedName });

      // Refresh the page data to update server components
      router.refresh();

      setMessage({ text: "Profil bilgileriniz başarıyla güncellendi.", type: "success" });
      setIsEditing(false);
      setPassword("");
      setConfirmPassword("");
      setShowPasswordFields(false);

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || "Bir hata oluştu.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {message && (
        <div
          className={`text-xs font-semibold py-2.5 px-4 rounded-xl mb-4 transition-all duration-300 ${
            message.type === "success"
              ? "bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400"
              : "bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {!isEditing ? (
        <button
          onClick={() => {
            setName(initialName);
            setIsEditing(true);
            setMessage(null);
          }}
          className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-sm flex items-center justify-center gap-2"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            ></path>
          </svg>
          Profili Düzenle
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 border border-zinc-150 dark:border-zinc-800 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Ad Soyad
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              placeholder="Ad ve Soyadınızı girin"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-850 dark:text-zinc-100 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-850 dark:hover:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <svg
                className={`w-3 h-3 transform transition-transform ${showPasswordFields ? "rotate-95" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
              Şifre Değiştir
            </button>

            {showPasswordFields && (
              <div className="space-y-3 pt-1 border-t border-zinc-100 dark:border-zinc-900 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Yeni Şifre
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="En az 6 karakter"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-850 dark:text-zinc-100 transition-colors"
                    required={showPasswordFields}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Yeni Şifre (Tekrar)
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Şifreyi onaylayın"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-850 dark:text-zinc-100 transition-colors"
                    required={showPasswordFields}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold py-2 px-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setName(initialName);
                setPassword("");
                setConfirmPassword("");
                setShowPasswordFields(false);
                setMessage(null);
              }}
              disabled={loading}
              className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-bold py-2 px-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              İptal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
