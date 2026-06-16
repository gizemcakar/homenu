import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "../../../../../generated/prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Giriş Yap",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-posta ve şifre zorunludur.");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.trim().toLowerCase(),
          },
        } as any);

        if (!user || !(user as any).password) {
          throw new Error("Kayıtlı kullanıcı bulunamadı veya şifre hatalı.");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          (user as any).password
        );

        if (!isPasswordCorrect) {
          throw new Error("Hatalı şifre.");
        }

        return {
          id: user.id,
          email: (user as any).email,
          name: (user as any).name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-development-secret",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
