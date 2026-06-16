import React from "react";
import { notFound } from "next/navigation";
import { PrismaClient } from "../../../../generated/prisma/client";
import RecipeDetailClient from "@/src/components/RecipeDetailClient";
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
if (!process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
}

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

  return <RecipeDetailClient recipe={recipe as any} />;
}
