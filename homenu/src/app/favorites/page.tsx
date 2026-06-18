import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "../../../generated/prisma/client";
import FavoritesListClient from "@/src/components/FavoritesListClient";
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
    <div className="relative min-h-screen w-full bg-background px-4 py-12 transition-colors duration-300">
      {/* Decorative background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <main className="relative max-w-5xl mx-auto z-10 space-y-8">
        
        {/* Page Header */}
        <section className="flex flex-col gap-3">
          <p className="rounded-full border border-card-border bg-foreground/[0.04] px-4 py-1.5 text-xs font-bold tracking-[0.14em] text-foreground/55 uppercase w-fit">
            Kişisel Arşiv
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Favori Tariflerim
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-foreground/60 sm:text-base">
            Beğendiğiniz ve daha sonra kolayca erişmek istediğiniz tarifler.
          </p>
        </section>

        <FavoritesListClient initialFavorites={favorites} />

      </main>
    </div>
  );
}
