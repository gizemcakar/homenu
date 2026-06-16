"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide the navbar on login and register pages for a clean authentication experience
  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (isAuthPage) return null;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-150 relative py-1 ${
      isActive(path)
        ? "text-zinc-950 dark:text-zinc-50 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-zinc-950 dark:after:bg-zinc-50"
        : "text-zinc-500 dark:text-zinc-400"
    }`;

  const mobileLinkClass = (path: string) =>
    `block text-base font-medium py-2 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 ${
      isActive(path)
        ? "text-zinc-950 dark:text-zinc-50 font-bold"
        : "text-zinc-500 dark:text-zinc-400"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Left Corner: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-zinc-900 dark:bg-zinc-50 rounded-xl transition-all duration-300 group-hover:scale-105">
                <svg
                  className="h-4.5 w-4.5 text-white dark:text-zinc-950"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <span className="text-lg font-black tracking-widest text-zinc-900 dark:text-zinc-50">
                HOMENU
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {status === "authenticated" && (
              <>
                <Link href="/add-recipe" className={linkClass("/add-recipe")}>
                  Tarif Ekle
                </Link>
                <Link href="/favorites" className={linkClass("/favorites")}>
                  Favorilerim
                </Link>
                <Link href="/profile" className={linkClass("/profile")}>
                  Profilim
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Authentication Controls */}
          <div className="hidden md:flex items-center gap-4">
            {status === "loading" ? (
              <div className="h-8 w-24 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            ) : status === "authenticated" ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 max-w-[150px] truncate">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold py-2 px-4 rounded-xl transition-all duration-200 active:scale-[0.97] cursor-pointer"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 text-sm font-semibold py-2 px-4 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-sm font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-200 active:scale-[0.97]"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Icon */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors focus:outline-none cursor-pointer"
            >
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transition-colors">
          <div className="px-4 py-4 space-y-4">
            
            {/* Nav links */}
            {status === "authenticated" && (
              <div className="space-y-2">
                <Link href="/add-recipe" onClick={() => setIsOpen(false)} className={mobileLinkClass("/add-recipe")}>
                  Tarif Ekle
                </Link>
                <Link href="/favorites" onClick={() => setIsOpen(false)} className={mobileLinkClass("/favorites")}>
                  Favorilerim
                </Link>
                <Link href="/profile" onClick={() => setIsOpen(false)} className={mobileLinkClass("/profile")}>
                  Profilim
                </Link>
              </div>
            )}

            {/* Auth actions */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900">
              {status === "authenticated" ? (
                <div className="space-y-3">
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                    {session.user?.name || session.user?.email}
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Çıkış Yap
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center border border-zinc-200 dark:border-zinc-850 text-zinc-850 dark:text-zinc-200 text-sm font-semibold py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
