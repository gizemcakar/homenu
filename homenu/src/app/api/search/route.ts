import path from "path";
import fs from "fs";

type PrismaClientType = import("../../../../generated/prisma/client").PrismaClient;

declare global {
  // allow global caching across module reloads in dev
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClientType | undefined;
}

const getEnginePath = () => {
  const localPath = path.join(process.cwd(), "generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node");
  if (fs.existsSync(localPath)) return localPath;
  const parentPath = path.join(process.cwd(), "../generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node");
  if (fs.existsSync(parentPath)) return parentPath;
  return "/home/gcakar/projects/homenu/homenu/generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node";
};

const enginePath = getEnginePath();
process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;

async function getPrismaClient() {
  if (globalThis.__prismaClient) {
    return globalThis.__prismaClient;
  }

  const { PrismaClient } = await import("../../../../generated/prisma/client");
  const prisma = new PrismaClient();
  globalThis.__prismaClient = prisma;
  return prisma;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ingredientsParam = url.searchParams.get("ingredients") || "";
    const mode = (url.searchParams.get("mode") || "any").toLowerCase();

    const ingredients = ingredientsParam
      .split(",")
      .map((ingredient) => ingredient.trim().toLowerCase())
      .filter(Boolean);

    if (ingredients.length === 0) {
      return Response.json(
        { error: "ingredients query param is required" },
        { status: 400 }
      );
    }

    const conditions = ingredients.map((name) => ({
      ingredients: { some: { name: { equals: name, mode: "insensitive" as const } } },
    }));

    const where = mode === "all" ? { AND: conditions } : { OR: conditions };

    const prisma = await getPrismaClient();
    const recipes = await prisma.recipe.findMany({
      where,
      include: { ingredients: true },
    });

    return Response.json({ data: recipes });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Search API error", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
