import "@/src/lib/prisma-engine";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

type PrismaClientType = import("../../../../generated/prisma/client").PrismaClient;

declare global {
  // allow global caching across module reloads in dev
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClientType | undefined;
}

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

    const ingredientFilter = mode === "all" ? { AND: conditions } : { OR: conditions };

    const prisma = await getPrismaClient();

    // Yalnızca Bento Grid kategori aramalarında (source=category) kendi tariflerini filtrele.
    // Manuel malzeme aramasında (source=manual) kendi tarifleri de dahil tüm sonuçlar gösterilir.
    const source = url.searchParams.get("source") || "manual";
    let userIdToExclude: string | undefined = undefined;

    if (source === "category") {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (user) {
          userIdToExclude = user.id;
        }
      }
    }

    const where = userIdToExclude
      ? {
          AND: [
            ingredientFilter,
            { userId: { not: userIdToExclude } },
          ],
        }
      : ingredientFilter;

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

