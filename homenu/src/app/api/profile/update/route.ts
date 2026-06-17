import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "../../../../../generated/prisma/client";
import bcrypt from "bcrypt";
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
    const { name, password } = body;

    const updateData: any = {};

    // Validate and update Name
    if (typeof name === "string") {
      const trimmedName = name.trim();
      if (trimmedName === "") {
        return NextResponse.json(
          { error: "İsim alanı boş bırakılamaz." },
          { status: 400 }
        );
      }
      updateData.name = trimmedName;
    }

    // Validate and update Password if provided
    if (password !== undefined && password !== null) {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json(
          { error: "Şifre en az 6 karakter uzunluğunda olmalıdır." },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Güncellenecek herhangi bir veri gönderilmedi." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Profil bilgileri güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
