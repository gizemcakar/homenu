import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "../../../../generated/prisma/client";
import "@/src/lib/prisma-engine";

const prisma = new PrismaClient();


/**
 * GET: Retrieve the authenticated user's favorite recipes
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Yetkisiz erişim. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    const userWithFavorites = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        favoriteRecipes: {
          include: {
            ingredients: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!userWithFavorites) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(userWithFavorites.favoriteRecipes, { status: 200 });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("GET Favorites error:", error);
    return NextResponse.json(
      { error: "Favoriler getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

/**
 * POST: Toggle a recipe in the user's favorites
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Yetkisiz erişim. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipeId } = body;

    if (!recipeId || typeof recipeId !== "string") {
      return NextResponse.json(
        { error: "recipeId parametresi zorunludur." },
        { status: 400 }
      );
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Tarif bulunamadı." },
        { status: 404 }
      );
    }

    // Check if it's already favorited
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        favoriteRecipes: {
          where: { id: recipeId },
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    const isFavorited = user.favoriteRecipes.length > 0;

    if (isFavorited) {
      // Remove from favorites
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          favoriteRecipes: {
            disconnect: { id: recipeId },
          },
        },
      });
      return NextResponse.json({ action: "removed", message: "Tarif favorilerden çıkarıldı." }, { status: 200 });
    } else {
      // Add to favorites
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          favoriteRecipes: {
            connect: { id: recipeId },
          },
        },
      });
      return NextResponse.json({ action: "added", message: "Tarif favorilere eklendi." }, { status: 200 });
    }
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("POST Favorites error:", error);
    return NextResponse.json(
      { error: "Favori işlemi gerçekleştirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
