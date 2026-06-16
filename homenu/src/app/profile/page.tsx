import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "../../../generated/prisma/client";

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

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    redirect("/login");
  }

  const email = session.user.email;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    redirect("/login");
  }

  const displayName = user.name && user.name.trim() !== "" ? user.name : "Hoş Geldin";

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm transition-all duration-300">
          
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center pb-8 border-b border-zinc-100 dark:border-zinc-900">
            <div className="h-24 w-24 bg-zinc-900 dark:bg-zinc-50 rounded-full flex items-center justify-center shadow-md mb-4 text-white dark:text-zinc-950 text-3xl font-black">
              {displayName[0].toUpperCase()}
            </div>
            {/* Displaying name in big typography above email */}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {displayName}
            </h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1 font-medium">
              {user.email}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-3 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full">
              HOMENU Üyesi
            </p>
          </div>

          {/* Profile Details */}
          <div className="py-8 space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                E-posta Adresi
              </label>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-2xl text-zinc-800 dark:text-zinc-200 font-medium">
                {user.email}
              </div>
            </div>

            {user.name && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Ad Soyad
                </label>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-2xl text-zinc-800 dark:text-zinc-200 font-medium">
                  {user.name}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Hesap Durumu
              </label>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-2xl text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Aktif ve Güvenli
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
