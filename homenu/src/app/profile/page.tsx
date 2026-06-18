import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "../../../generated/prisma/client";
import Link from "next/link";
import FavoriteButton from "@/src/components/FavoriteButton";
import PrivacySettingsClient from "@/src/components/PrivacySettingsClient";
import ProfileEditClient from "@/src/components/ProfileEditClient";
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
          <div className="bg-card-bg border border-card-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
            
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-card-border">
              <div className="h-20 w-20 bg-primary rounded-full flex items-center justify-center shadow-md mb-3 text-white text-2xl font-black">
                {displayName[0].toUpperCase()}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground truncate max-w-full">
                {displayName}
              </h1>
              <p className="text-xs text-foreground/50 mt-1 font-medium select-all">
                {user.email}
              </p>
              <div className="flex flex-col gap-2 mt-4 w-full">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/55 px-3 py-1 bg-foreground/[0.04] rounded-full w-fit mx-auto border border-card-border">
                  HOMENU Üyesi
                </p>
                {user.isProfilePublic && (
                  <Link
                    href={`/profile/${user.id}`}
                    className="text-[11px] font-bold text-foreground/70 hover:text-primary underline underline-offset-4 tracking-wide transition-colors"
                  >
                    Herkese Açık Profilini Gör ↗
                  </Link>
                )}
              </div>
              <div className="mt-6 w-full">
                <ProfileEditClient initialName={user.name || ""} />
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
          <section className="bg-card-bg border border-card-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <h2 className="text-lg font-black tracking-tight text-foreground">
                Kendi Tariflerim ({ownRecipesCount})
              </h2>
              <Link
                href="/add-recipe"
                className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                + Yeni Tarif
              </Link>
            </div>

            {ownRecipes.length === 0 ? (
              <p className="text-xs text-foreground/40 text-center py-6">
                Henüz kendi tarifinizi eklemediniz.
              </p>
            ) : (
              <div className="space-y-4">
                {ownRecipes.map((r) => (
                  <Link href={`/recipe/${r.id}`} key={r.id} className="block group">
                    <div className="p-4 bg-background border border-card-border hover:border-card-border/80 rounded-2xl transition-all duration-200 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {r.title}
                        </h3>
                        <p className="text-[10px] font-semibold text-foreground/50">
                          ⏱️ Toplam: {r.prepTime + r.cookTime} dk · {r.ingredients.length} malzeme
                        </p>
                      </div>
                      <span className="text-sm text-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all">→</span>
                    </div>
                  </Link>
                ))}

                {/* Pagination Controls for Own Recipes */}
                {totalPagesOwn > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-card-border text-xs">
                    <span className="text-foreground/50 font-semibold">
                      Sayfa {pageOwn} / {totalPagesOwn}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile?pageOwn=${Math.max(1, pageOwn - 1)}&pageFav=${pageFav}`}
                        scroll={false}
                        className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                          pageOwn <= 1
                            ? "bg-background border-card-border text-foreground/30 pointer-events-none"
                            : "bg-card-bg border-card-border text-foreground/80 hover:bg-background hover:text-primary"
                        }`}
                      >
                        Geri
                      </Link>
                      <Link
                        href={`/profile?pageOwn=${Math.min(totalPagesOwn, pageOwn + 1)}&pageFav=${pageFav}`}
                        scroll={false}
                        className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                          pageOwn >= totalPagesOwn
                            ? "bg-background border-card-border text-foreground/30 pointer-events-none"
                            : "bg-card-bg border-card-border text-foreground/80 hover:bg-background hover:text-primary"
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
          <section className="bg-card-bg border border-card-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-card-border pb-4">
              <h2 className="text-lg font-black tracking-tight text-foreground">
                Favorilerim ({favRecipesCount})
              </h2>
            </div>

            {favoriteRecipes.length === 0 ? (
              <p className="text-xs text-foreground/40 text-center py-6">
                Henüz hiçbir tarifi favorilemediniz.
              </p>
            ) : (
              <div className="space-y-4">
                {favoriteRecipes.map((r) => (
                  <div key={r.id} className="group relative p-4 bg-background border border-card-border hover:border-card-border/80 rounded-2xl transition-all duration-200 flex items-center justify-between gap-4">
                    <Link href={`/recipe/${r.id}`} className="flex-1 block">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {r.title}
                        </h3>
                        <p className="text-[10px] font-semibold text-foreground/50">
                          ⏱️ Pişirme: {r.cookTime} dk · {r.ingredients.length} malzeme
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-3">
                      <FavoriteButton
                        recipeId={r.id}
                        initialIsFavorited={true}
                      />
                      <span className="text-sm text-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all pointer-events-none">→</span>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls for Favorite Recipes */}
                {totalPagesFav > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-card-border text-xs">
                    <span className="text-foreground/50 font-semibold">
                      Sayfa {pageFav} / {totalPagesFav}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile?pageOwn=${pageOwn}&pageFav=${Math.max(1, pageFav - 1)}`}
                        scroll={false}
                        className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                          pageFav <= 1
                            ? "bg-background border-card-border text-foreground/30 pointer-events-none"
                            : "bg-card-bg border-card-border text-foreground/80 hover:bg-background hover:text-primary"
                        }`}
                      >
                        Geri
                      </Link>
                      <Link
                        href={`/profile?pageOwn=${pageOwn}&pageFav=${Math.min(totalPagesFav, pageFav + 1)}`}
                        scroll={false}
                        className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                          pageFav >= totalPagesFav
                            ? "bg-background border-card-border text-foreground/30 pointer-events-none"
                            : "bg-card-bg border-card-border text-foreground/80 hover:bg-background hover:text-primary"
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
