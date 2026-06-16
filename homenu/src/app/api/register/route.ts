import bcrypt from "bcrypt";
import { PrismaClient } from "../../../../generated/prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    const name = typeof body.name === "string" ? body.name.trim() : null;

    if (!email || !password) {
      return Response.json(
        { error: "email ve password zorunludur." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { email },
    } as any);

    if (existingUser) {
      return Response.json(
        { error: "Bu email adresiyle kayıtlı kullanıcı zaten var." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    } as any);

    const { password: _, ...safeUser } = user as any;

    return Response.json(safeUser, { status: 201 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Register API error", error);
    return Response.json(
      { error: "Kayıt işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
