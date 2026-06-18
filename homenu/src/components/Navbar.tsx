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
    `text-sm font-medium transition-colors hover:text-primary relative py-1 ${
      isActive(path)
        ? "text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
        : "text-foreground/60"
    }`;

  const mobileLinkClass = (path: string) =>
    `block text-base font-medium py-2 transition-colors hover:text-primary ${
      isActive(path)
        ? "text-foreground font-bold"
        : "text-foreground/60"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-card-bg/85 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Left Corner: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-1.5 bg-primary rounded-xl transition-all duration-300 group-hover:scale-105">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {/* Stove/Grate Base */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 19.5h14"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 19.5v2.5M16 19.5v2.5"
                  />
                  {/* Pan Body */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 13.5h16c0 3.5-3.5 6-8 6s-8-2.5-8-6z"
                  />
                  {/* Pan Handle */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 13.5L1 11"
                  />
                  {/* Cooking Steam / Heat Waves */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 11c.7-1.5-.7-2.5 0-4M12 9.5c.7-1.8-.7-3 0-4.8M16 10.5c.7-1.5-.7-2.5 0-4"
                  />
                </svg>
              </div>
              <span className="text-lg font-black tracking-widest text-foreground">
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
              <div className="h-8 w-24 animate-pulse rounded-xl bg-card-border/65" />
            ) : status === "authenticated" ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-foreground/60 max-w-[150px] truncate">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-card-bg hover:bg-background border border-card-border text-foreground/80 text-xs font-bold py-2 px-4 rounded-xl transition-all duration-200 active:scale-[0.97] cursor-pointer"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-foreground/75 hover:text-primary text-sm font-semibold py-2 px-4 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-200 active:scale-[0.97]"
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
              className="p-2 text-foreground/60 hover:text-primary transition-colors focus:outline-none cursor-pointer"
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
        <div className="md:hidden border-t border-card-border bg-card-bg transition-colors">
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
            <div className="pt-2 border-t border-card-border">
              {status === "authenticated" ? (
                <div className="space-y-3">
                  <div className="text-xs text-foreground/50 truncate">
                    {session.user?.name || session.user?.email}
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    className="w-full bg-background hover:bg-card-border text-foreground text-sm font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Çıkış Yap
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center border border-card-border text-foreground text-sm font-semibold py-2.5 rounded-xl hover:bg-background transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center bg-primary hover:bg-primary-hover text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
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
