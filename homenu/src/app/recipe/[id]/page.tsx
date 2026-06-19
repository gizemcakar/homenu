import React from "react";
import { notFound } from "next/navigation";
import { PrismaClient } from "../../../../generated/prisma/client";
import RecipeDetailClient from "@/src/components/RecipeDetailClient";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import "@/src/lib/prisma-engine";

const prisma = new PrismaClient();


interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  // Fetch recipe details including its ingredients
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: true,
    },
  });

  if (!recipe) {
    notFound();
  }

  let initialIsFavorited = false;
  const session = await getServerSession(authOptions);
  if (session && session.user && session.user.email) {
    const favoriteCount = await prisma.user.count({
      where: {
        email: session.user.email,
        favoriteRecipes: {
          some: {
            id: id,
          },
        },
      },
    } as any);
    initialIsFavorited = favoriteCount > 0;
  }

  return <RecipeDetailClient recipe={recipe as any} initialIsFavorited={initialIsFavorited} />;
}
