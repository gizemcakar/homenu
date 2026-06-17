import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "../../../generated/prisma/client";
import Link from "next/link";
import FavoriteButton from "@/src/components/FavoriteButton";
import PrivacySettingsClient from "@/src/components/PrivacySettingsClient";
import path from "path";
import fs from "fs";

// Ensure the query engine library path is correctly loaded in local development environments
const getEnginePath = () => {
  const localPath = path.join(process.cwd(), "generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node");
  if (fs.existsSync(localPath)) return localPath;
  const parentPath = path.join(process.cwd(), "../generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node");
  if (fs.existsSync(parentPath)) return parentPath;
  return "/home/gcakar/projects/homenu/homenu/generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node";
};

const enginePath = getEnginePath();
process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;

const prisma = new PrismaClient();

const ITEMS_PER_PAGE = 5;

interface ProfilePageProps {
  searchParams: Promise<{ pageOwn?: string; pageFav?: string }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const pageOwn = parseInt(resolvedSearchParams.pageOwn || "1", 10) || 1;
  const pageFav = parseInt(resolvedSearchParams.pageFav || "1", 10) || 1;

  const email = session.user.email;

  // 1. Fetch user data including privacy settings
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    redirect("/login");
  }

  const displayName = user.name && user.name.trim() !== "" ? user.name : "Hoş Geldin";

  // 2. Query count and paginated own recipes
  const skipOwn = (pageOwn - 1) * ITEMS_PER_PAGE;
  const ownRecipesCount = await prisma.recipe.count({
    where: { userId: user.id },
  });
  const ownRecipes = await prisma.recipe.findMany({
    where: { userId: user.id },
    skip: skipOwn,
    take: ITEMS_PER_PAGE,
    include: {
      ingredients: true,
    },
    orderBy: {
      id: "desc", // Show newest first
    },
  });

  // 3. Query count and paginated favorite recipes
  const skipFav = (pageFav - 1) * ITEMS_PER_PAGE;
  const favRecipesCount = await prisma.recipe.count({
    where: {
      favoritedBy: {
        some: {
          id: user.id,
        },
      },
    },
  });
  const favoriteRecipes = await prisma.recipe.findMany({
    where: {
      favoritedBy: {
        some: {
          id: user.id,
        },
      },
    },
    skip: skipFav,
    take: ITEMS_PER_PAGE,
    include: {
      ingredients: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  const totalPagesOwn = Math.max(1, Math.ceil(ownRecipesCount / ITEMS_PER_PAGE));
  const totalPagesFav = Math.max(1, Math.ceil(favRecipesCount / ITEMS_PER_PAGE));

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Side: Profile Details & Privacy settings (2/5 grid span) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
            
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="h-20 w-20 bg-zinc-900 dark:bg-zinc-50 rounded-full flex items-center justify-center shadow-md mb-3 text-white dark:text-zinc-950 text-2xl font-black">
                {displayName[0].toUpperCase()}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 truncate max-w-full">
                {displayName}
              </h1>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-medium select-all">
                {user.email}
              </p>
              <div className="flex flex-col gap-2 mt-4 w-full">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 py-1 bg-zinc-150/40 dark:bg-zinc-900 rounded-full w-fit mx-auto border border-zinc-200/50 dark:border-zinc-800">
                  HOMENU Üyesi
                </p>
                {user.isProfilePublic && (
                  <Link
                    href={`/profile/${user.id}`}
                    className="text-[11px] font-bold text-zinc-650 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 underline underline-offset-4 tracking-wide"
                  >
                    Kamuya Açık Profil Bağlantısı ↗
                  </Link>
                )}
              </div>
            </div>

            {/* Profile Privacy Controls (Client Toggles) */}
            <PrivacySettingsClient
              initialIsProfilePublic={user.isProfilePublic}
              initialShowFavoritesPublic={user.showFavoritesPublic}
              initialShowRecipesPublic={user.showRecipesPublic}
            />

          </div>
        </div>

        {/* Right Side: Lists & Dashboards (3/5 grid span) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* User's Created Recipes Section */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
              <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                Kendi Tariflerim ({ownRecipesCount})
              </h2>
              <Link
                href="/add-recipe"
                className="text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 hover:bg-zinc-150/70 transition-colors"
              >
                + Yeni Tarif
              </Link>
            </div>

            {ownRecipes.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-6">
                Henüz kendi tarifinizi eklemediniz.
              </p>
            ) : (
              <div className="space-y-4">
                {ownRecipes.map((r) => (
                  <Link href={`/recipe/${r.id}`} key={r.id} className="block group">
                    <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-750 rounded-2xl transition-all duration-200 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-50 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors line-clamp-1">
                          {r.title}
                        </h3>
                        <p className="text-[10px] font-semibold text-zinc-450 dark:text-zinc-500">
                          ⏱️ Toplam: {r.prepTime + r.cookTime} dk · {r.ingredients.length} malzeme
                        </p>
                      </div>
                      <span className="text-sm text-zinc-400 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </Link>
                ))}

                {/* Pagination Controls for Own Recipes */}
                {totalPagesOwn > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-850 text-xs">
                    <span className="text-zinc-450 dark:text-zinc-500 font-semibold">
                      Sayfa {pageOwn} / {totalPagesOwn}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile?pageOwn=${Math.max(1, pageOwn - 1)}&pageFav=${pageFav}`}
                        scroll={false}
                        className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                          pageOwn <= 1
                            ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-150 text-zinc-300 dark:text-zinc-700 pointer-events-none"
                            : "bg-white dark:bg-zinc-950 border-zinc-200 text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50"
                        }`}
                      >
                        Geri
                      </Link>
                      <Link
                        href={`/profile?pageOwn=${Math.min(totalPagesOwn, pageOwn + 1)}&pageFav=${pageFav}`}
                        scroll={false}
                        className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                          pageOwn >= totalPagesOwn
                            ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-150 text-zinc-300 dark:text-zinc-700 pointer-events-none"
                            : "bg-white dark:bg-zinc-950 border-zinc-200 text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50"
                        }`}
                      >
                        İleri
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* User's Favorite Recipes Section */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
              <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                Favorilerim ({favRecipesCount})
              </h2>
            </div>

            {favoriteRecipes.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-6">
                Henüz hiçbir tarifi favorilemediniz.
              </p>
            ) : (
              <div className="space-y-4">
                {favoriteRecipes.map((r) => (
                  <div key={r.id} className="group relative p-4 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-750 rounded-2xl transition-all duration-200 flex items-center justify-between gap-4">
                    <Link href={`/recipe/${r.id}`} className="flex-1 block">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-50 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors line-clamp-1">
                          {r.title}
                        </h3>
                        <p className="text-[10px] font-semibold text-zinc-450 dark:text-zinc-500">
                          ⏱️ Pişirme: {r.cookTime} dk · {r.ingredients.length} malzeme
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-3">
                      <FavoriteButton
                        recipeId={r.id}
                        initialIsFavorited={true}
                      />
                      <span className="text-sm text-zinc-400 group-hover:translate-x-1 transition-transform pointer-events-none">→</span>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls for Favorite Recipes */}
                {totalPagesFav > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-850 text-xs">
                    <span className="text-zinc-450 dark:text-zinc-500 font-semibold">
                      Sayfa {pageFav} / {totalPagesFav}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile?pageOwn=${pageOwn}&pageFav=${Math.max(1, pageFav - 1)}`}
                        scroll={false}
                        className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                          pageFav <= 1
                            ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-150 text-zinc-300 dark:text-zinc-700 pointer-events-none"
                            : "bg-white dark:bg-zinc-950 border-zinc-200 text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50"
                        }`}
                      >
                        Geri
                      </Link>
                      <Link
                        href={`/profile?pageOwn=${pageOwn}&pageFav=${Math.min(totalPagesFav, pageFav + 1)}`}
                        scroll={false}
                        className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                          pageFav >= totalPagesFav
                            ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-150 text-zinc-300 dark:text-zinc-700 pointer-events-none"
                            : "bg-white dark:bg-zinc-950 border-zinc-200 text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50"
                        }`}
                      >
                        İleri
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

        </div>

      </div>
    </main>
  );
}
