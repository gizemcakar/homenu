-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable (idempotent)
CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Recipe" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "servings" INTEGER NOT NULL,
        "prepTime" INTEGER NOT NULL,
        "cookTime" INTEGER NOT NULL,
        "instructions" TEXT[],
        "imageUrl" TEXT,
        "userId" TEXT NOT NULL,
        CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Ingredient" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "unit" TEXT NOT NULL,
        "recipeId" TEXT NOT NULL,
        CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys only if they don't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Recipe_userId_fkey') THEN
        ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId")
            REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Ingredient_recipeId_fkey') THEN
        ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_recipeId_fkey" FOREIGN KEY ("recipeId")
            REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END$$;
