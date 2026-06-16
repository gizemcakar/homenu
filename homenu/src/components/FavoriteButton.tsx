"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  recipeId: string;
  initialIsFavorited?: boolean;
  onToggle?: (recipeId: string, isFavorited: boolean) => void;
  className?: string;
}

export default function FavoriteButton({
  recipeId,
  initialIsFavorited = false,
  onToggle,
  className = "",
}: FavoriteButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent clicking the parent link/card

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    if (loading) return;

    setLoading(true);
    // Optimistic UI update
    const previousState = isFavorited;
    setIsFavorited(!previousState);

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeId }),
      });

      if (!res.ok) {
        throw new Error("Favorite toggle failed");
      }

      const data = await res.json();
      const newStatus = data.action === "added";
      setIsFavorited(newStatus);
      onToggle?.(recipeId, newStatus);
      router.refresh(); // Refresh server components if any are rendering this state
    } catch (err) {
      // Revert state on error
      // eslint-disable-next-line no-console
      console.error("Favorite toggle error", err);
      setIsFavorited(previousState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={isFavorited ? "Favorilerden Çıkar" : "Favorilere Ekle"}
      className={`group/fav relative p-2.5 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-450 dark:text-zinc-550 hover:text-red-500 hover:border-red-200 dark:hover:text-red-400 dark:hover:border-red-950 active:scale-[0.95] hover:shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 ${className}`}
    >
      <svg
        className={`h-5 w-5 transition-transform duration-250 group-hover/fav:scale-110 ${
          isFavorited ? "fill-red-500 stroke-red-500 dark:fill-red-400 dark:stroke-red-400 scale-[1.05]" : "fill-transparent stroke-current"
        }`}
        viewBox="0 0 24 24"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}
