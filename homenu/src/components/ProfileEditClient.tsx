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

  // Name editing states
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(initialName);
  const [loadingName, setLoadingName] = useState(false);

  // Password editing states
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Feedback messages
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingName(true);
    setMessage(null);

    const trimmedName = name.trim();
    if (trimmedName === "") {
      setMessage({ text: "Ad Soyad alanı boş bırakılamaz.", type: "error" });
      setLoadingName(false);
      return;
    }

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ad Soyad güncellenirken bir hata oluştu.");
      }

      // Update next-auth session token
      await update({ name: trimmedName });

      // Refresh the page data to update server components
      router.refresh();

      setMessage({ text: "Ad Soyad başarıyla güncellendi.", type: "success" });
      setIsEditingName(false);

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || "Bir hata oluştu.", type: "error" });
    } finally {
      setLoadingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);
    setMessage(null);

    if (password.length < 6) {
      setMessage({ text: "Yeni şifre en az 6 karakter olmalıdır.", type: "error" });
      setLoadingPassword(false);
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: "Şifreler eşleşmiyor.", type: "error" });
      setLoadingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Şifre güncellenirken bir hata oluştu.");
      }

      setMessage({ text: "Şifreniz başarıyla güncellendi.", type: "success" });
      setIsEditingPassword(false);
      setPassword("");
      setConfirmPassword("");

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || "Bir hata oluştu.", type: "error" });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {message && (
        <div
          className={`text-xs font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 ${
            message.type === "success"
              ? "bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400"
              : "bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 1. Name Editing Flow */}
      <div className="w-full">
        {!isEditingName ? (
          <button
            onClick={() => {
              setName(initialName);
              setIsEditingName(true);
              setIsEditingPassword(false); // Close the other form
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
            Ad Soyad Değiştir
          </button>
        ) : (
          <form onSubmit={handleUpdateName} className="space-y-4 border border-zinc-150 dark:border-zinc-800 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 animate-fadeIn">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Ad Soyad
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loadingName}
                placeholder="Ad ve Soyadınızı girin"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-850 dark:text-zinc-100 transition-colors"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loadingName}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold py-2 px-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loadingName ? "Kaydediliyor..." : "Adı Güncelle"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingName(false);
                  setName(initialName);
                  setMessage(null);
                }}
                disabled={loadingName}
                className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-bold py-2 px-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                İptal
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Password Editing Flow */}
      <div className="w-full">
        {!isEditingPassword ? (
          <button
            onClick={() => {
              setIsEditingPassword(true);
              setIsEditingName(false); // Close the other form
              setMessage(null);
            }}
            className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
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
                d="M15 7a2 2 0 012 2m-5 8a2 2 0 01-2-2V9a2 2 0 012-2h5a2 2 0 012 2v6a2 2 0 01-2 2h-5zM4 10h12"
              ></path>
            </svg>
            Şifre Değiştir
          </button>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4 border border-zinc-150 dark:border-zinc-800 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 animate-fadeIn">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Yeni Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loadingPassword}
                placeholder="En az 6 karakter"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-850 dark:text-zinc-100 transition-colors"
                required
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
                disabled={loadingPassword}
                placeholder="Şifreyi onaylayın"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-850 dark:text-zinc-100 transition-colors"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loadingPassword}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold py-2 px-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loadingPassword ? "Kaydediliyor..." : "Şifreyi Güncelle"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingPassword(false);
                  setPassword("");
                  setConfirmPassword("");
                  setMessage(null);
                }}
                disabled={loadingPassword}
                className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-bold py-2 px-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                İptal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
