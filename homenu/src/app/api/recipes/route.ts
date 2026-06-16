import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "../../../../generated/prisma/client";

// Ensure the query engine library path is correctly loaded in local development environments
const enginePath = "/home/gcakar/Desktop/homenu/homenu/generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node";
if (!process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
}

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 1. Session verification
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Yetkisiz erişim. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { title, servings, prepTime, cookTime, instructions, ingredients } = body;

    // 3. Validation
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Geçersiz veya eksik tarif başlığı." },
        { status: 400 }
      );
    }

    const parsedServings = parseInt(servings, 10);
    const parsedPrepTime = parseInt(prepTime, 10);
    const parsedCookTime = parseInt(cookTime, 10);

    if (isNaN(parsedServings) || parsedServings <= 0) {
      return NextResponse.json(
        { error: "Kişi sayısı pozitif bir tam sayı olmalıdır." },
        { status: 400 }
      );
    }

    if (isNaN(parsedPrepTime) || parsedPrepTime < 0) {
      return NextResponse.json(
        { error: "Hazırlama süresi sıfır veya daha büyük bir tam sayı olmalıdır." },
        { status: 400 }
      );
    }

    if (isNaN(parsedCookTime) || parsedCookTime < 0) {
      return NextResponse.json(
        { error: "Pişirme süresi sıfır veya daha büyük bir tam sayı olmalıdır." },
        { status: 400 }
      );
    }

    if (!Array.isArray(instructions) || instructions.length === 0 || !instructions.every(item => typeof item === "string" && item.trim())) {
      return NextResponse.json(
        { error: "Tarif adımları (instructions) en az bir geçerli adım içeren bir dizi olmalıdır." },
        { status: 400 }
      );
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "Malzemeler (ingredients) en az bir malzeme içeren bir dizi olmalıdır." },
        { status: 400 }
      );
    }

    // Validate and format ingredients
    const formattedIngredients = [];
    for (const ing of ingredients) {
      if (!ing || typeof ing !== "object") {
        return NextResponse.json(
          { error: "Geçersiz malzeme formatı." },
          { status: 400 }
        );
      }

      const name = typeof ing.name === "string" ? ing.name.trim() : "";
      const unit = typeof ing.unit === "string" ? ing.unit.trim() : "";
      const amount = parseFloat(ing.amount);

      if (!name) {
        return NextResponse.json(
          { error: "Malzeme adı boş olamaz." },
          { status: 400 }
        );
      }

      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json(
          { error: `${name} için miktar pozitif bir sayı olmalıdır.` },
          { status: 400 }
        );
      }

      formattedIngredients.push({
        name,
        amount,
        unit,
      });
    }

    // 4. Save to database using nested write
    const newRecipe = await prisma.recipe.create({
      data: {
        title: title.trim(),
        servings: parsedServings,
        prepTime: parsedPrepTime,
        cookTime: parsedCookTime,
        instructions: instructions.map(step => step.trim()),
        user: {
          connect: {
            email: session.user.email,
          },
        },
        ingredients: {
          create: formattedIngredients,
        },
      },
      include: {
        ingredients: true,
      },
    } as any);

    // 5. Return created recipe
    return NextResponse.json(newRecipe, { status: 201 });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Recipe creation error:", error);
    return NextResponse.json(
      { error: "Tarif kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
