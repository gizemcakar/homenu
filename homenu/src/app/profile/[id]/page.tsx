import React from "react";
import { notFound } from "next/navigation";
import { PrismaClient } from "../../../../generated/prisma/client";
import Link from "next/link";
import FavoriteButton from "@/src/components/FavoriteButton";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
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

interface PublicProfileProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pageOwn?: string; pageFav?: string }>;
}

export default async function PublicProfilePage({ params, searchParams }: PublicProfileProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  // Fetch target user's details
  const targetUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!targetUser) {
    notFound();
  }

  // Check if current user is viewing their own profile, if so, we can let them view it anyway
  const session = await getServerSession(authOptions);
  const isOwnProfile = session?.user?.email === targetUser.email;

  // Enforce global privacy: If private and NOT viewing own profile, block view
  if (!targetUser.isProfilePublic && !isOwnProfile) {
    return (
      <div className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 px-4 py-16 flex items-center justify-center transition-colors">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-sm">
          <div className="h-16 w-16 bg-red-100 dark:bg-red-950/30 text-red-650 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Gizli Profil</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Bu kullanıcı profilini dış dünyaya kapatmıştır. Gizlilik ayarlarından dolayı içerik görüntülenemez.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-semibold py-2.5 px-6 rounded-xl transition-colors active:scale-[0.98]"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const resolvedSearchParams = await searchParams;
  const pageOwn = parseInt(resolvedSearchParams.pageOwn || "1", 10) || 1;
  const pageFav = parseInt(resolvedSearchParams.pageFav || "1", 10) || 1;

  const displayName = targetUser.name && targetUser.name.trim() !== "" ? targetUser.name : "Kullanıcı";

  // Check if we should display target user's recipes
  let ownRecipes: any[] = [];
  let ownRecipesCount = 0;
  if (targetUser.showRecipesPublic || isOwnProfile) {
    const skipOwn = (pageOwn - 1) * ITEMS_PER_PAGE;
    ownRecipesCount = await prisma.recipe.count({
      where: { userId: targetUser.id },
    });
    ownRecipes = await prisma.recipe.findMany({
      where: { userId: targetUser.id },
      skip: skipOwn,
      take: ITEMS_PER_PAGE,
      include: {
        ingredients: true,
      },
      orderBy: {
        id: "desc",
      },
    });
  }

  // Check if we should display target user's favorites
  let favoriteRecipes: any[] = [];
  let favRecipesCount = 0;
  if (targetUser.showFavoritesPublic || isOwnProfile) {
    const skipFav = (pageFav - 1) * ITEMS_PER_PAGE;
    favRecipesCount = await prisma.recipe.count({
      where: {
        favoritedBy: {
          some: {
            id: targetUser.id,
          },
        },
      },
    });
    favoriteRecipes = await prisma.recipe.findMany({
      where: {
        favoritedBy: {
          some: {
            id: targetUser.id,
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
  }

  // Check which of the favorites are favorited by the VIEWING user (to display heart states correctly)
  const viewerFavoritedIds: Record<string, boolean> = {};
  if (session && session.user && session.user.email) {
    const viewer = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        favoriteRecipes: {
          select: { id: true },
        },
      },
    });
    if (viewer) {
      viewer.favoriteRecipes.forEach((recipe) => {
        viewerFavoritedIds[recipe.id] = true;
      });
    }
  }

  const totalPagesOwn = Math.max(1, Math.ceil(ownRecipesCount / ITEMS_PER_PAGE));
  const totalPagesFav = Math.max(1, Math.ceil(favRecipesCount / ITEMS_PER_PAGE));

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Card: Target user general details (2/5 span) */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center flex flex-col items-center gap-4">
            <div className="h-24 w-24 bg-zinc-900 dark:bg-zinc-50 rounded-full flex items-center justify-center shadow-md text-white dark:text-zinc-950 text-3xl font-black">
              {displayName[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                {displayName}
              </h1>
              {isOwnProfile && (
                <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mt-1 select-none">
                  (Kendi Profiliniz)
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200/50 dark:border-zinc-800">
                HOMENU Üyesi
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-3 py-1 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full border border-emerald-500/15">
                Kamuya Açık Profil
              </span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 mt-3 hover:underline underline-offset-4"
            >
              ← Tarif Aramaya Git
            </Link>
          </div>
        </div>

        {/* Right Section: Content Lists (3/5 span) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* User's Created Recipes list */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
              <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                Eklediği Tarifler ({ownRecipesCount})
              </h2>
            </div>

            {!targetUser.showRecipesPublic && !isOwnProfile ? (
              <p className="text-xs text-zinc-450 dark:text-zinc-500 text-center py-6">
                🔒 Bu kullanıcının eklediği tarifler gizlidir.
              </p>
            ) : ownRecipes.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-6">
                Eklenmiş bir tarif bulunmuyor.
              </p>
            ) : (
              <div className="space-y-4">
                {ownRecipes.map((r) => (
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
                        initialIsFavorited={!!viewerFavoritedIds[r.id]}
                      />
                      <span className="text-sm text-zinc-400 group-hover:translate-x-1 transition-transform pointer-events-none">→</span>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls for Own Recipes */}
                {totalPagesOwn > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-850 text-xs">
                    <span className="text-zinc-450 dark:text-zinc-500 font-semibold">
                      Sayfa {pageOwn} / {totalPagesOwn}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${id}?pageOwn=${Math.max(1, pageOwn - 1)}&pageFav=${pageFav}`}
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
                        href={`/profile/${id}?pageOwn=${Math.min(totalPagesOwn, pageOwn + 1)}&pageFav=${pageFav}`}
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

          {/* User's Favorite Recipes list */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
              <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                Beğendiği Tarifler ({favRecipesCount})
              </h2>
            </div>

            {!targetUser.showFavoritesPublic && !isOwnProfile ? (
              <p className="text-xs text-zinc-455 dark:text-zinc-500 text-center py-6">
                🔒 Bu kullanıcının favorilediği tarifler gizlidir.
              </p>
            ) : favoriteRecipes.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-6">
                Beğenilmiş bir tarif bulunmuyor.
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
                        initialIsFavorited={!!viewerFavoritedIds[r.id]}
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
                        href={`/profile/${id}?pageOwn=${pageOwn}&pageFav=${Math.max(1, pageFav - 1)}`}
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
                        href={`/profile/${id}?pageOwn=${pageOwn}&pageFav=${Math.min(totalPagesFav, pageFav + 1)}`}
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
