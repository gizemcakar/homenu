import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "../../../generated/prisma/client";
import Link from "next/link";
import FavoriteButton from "@/src/components/FavoriteButton";
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

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    redirect("/login");
  }

  const userWithFavorites = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      favoriteRecipes: {
        include: {
          ingredients: true,
        },
      },
    },
  });

  const favorites = userWithFavorites?.favoriteRecipes || [];

  return (
    <div className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 px-4 py-12 transition-colors duration-300">
      {/* Decorative background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-zinc-200/20 dark:bg-zinc-900/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-zinc-200/20 dark:bg-zinc-900/10 blur-[100px]" />
      </div>

      <main className="relative max-w-5xl mx-auto z-10 space-y-8">
        
        {/* Page Header */}
        <section className="flex flex-col gap-3">
          <p className="rounded-full border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-1.5 text-xs font-bold tracking-[0.14em] text-zinc-500 dark:text-zinc-400 uppercase w-fit">
            Kişisel Arşiv
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Favori Tariflerim
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-base">
            Beğendiğiniz ve daha sonra kolayca erişmek istediğiniz tarifler.
          </p>
        </section>

        {favorites.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-10 text-center space-y-5 max-w-lg mx-auto shadow-md">
            <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400 dark:text-zinc-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Henüz Favori Tarifiniz Yok
              </h3>
              <p className="text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed">
                Beğendiğiniz tarifleri favorilerinize ekleyerek burada hızlıca listeleyebilirsiniz.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 text-sm shadow-sm active:scale-[0.98]"
            >
              Tarif Ara
            </Link>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((r) => (
              <Link href={`/recipe/${r.id}`} key={r.id} className="block group">
                <article className="h-full rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 cursor-pointer active:scale-[0.99] flex flex-col justify-between">
                  <div>
                    {/* Header: Title + Favorite Toggle Button */}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors line-clamp-2">
                        {r.title}
                      </h3>
                      <FavoriteButton
                        recipeId={r.id}
                        initialIsFavorited={true}
                      />
                    </div>
                    
                    {/* Preparation & Cooking Times */}
                    <div className="mt-2.5 flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        ⏱️ Hazırlık: {r.prepTime ?? "-"} dk
                      </span>
                      <span className="flex items-center gap-1">
                        🍳 Pişirme: {r.cookTime ?? "-"} dk
                      </span>
                    </div>

                    {/* Ingredients Badges */}
                    <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                      <strong className="text-zinc-700 dark:text-zinc-300 font-bold block mb-1">Malzemeler:</strong>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {r.ingredients.slice(0, 4).map((ing, i) => (
                          <span key={i} className="inline-block px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 text-[10px] font-medium border border-zinc-150 dark:border-zinc-750">
                            {ing.name}
                          </span>
                        ))}
                        {r.ingredients.length > 4 && (
                          <span className="inline-block px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-450 text-[10px] font-bold">
                            +{r.ingredients.length - 4} daha
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Link overlay border */}
                  <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/85 flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <span>Tarif Detaylarını Gör</span>
                    <span className="text-sm transition-transform group-hover:translate-x-1 inline-block">→</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
