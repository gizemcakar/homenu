import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "../../../../../generated/prisma/client";
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Yetkisiz erişim. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isProfilePublic, showFavoritesPublic, showRecipesPublic } = body;

    // Build update data with only provided parameters
    const updateData: any = {};
    if (typeof isProfilePublic === "boolean") {
      updateData.isProfilePublic = isProfilePublic;
    }
    if (typeof showFavoritesPublic === "boolean") {
      updateData.showFavoritesPublic = showFavoritesPublic;
    }
    if (typeof showRecipesPublic === "boolean") {
      updateData.showRecipesPublic = showRecipesPublic;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Güncellenecek geçerli bir parametre bulunamadı." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        email: true,
        isProfilePublic: true,
        showFavoritesPublic: true,
        showRecipesPublic: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Privacy settings update error:", error);
    return NextResponse.json(
      { error: "Gizlilik ayarları güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
