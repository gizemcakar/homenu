-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showFavoritesPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showRecipesPublic" BOOLEAN NOT NULL DEFAULT true;
