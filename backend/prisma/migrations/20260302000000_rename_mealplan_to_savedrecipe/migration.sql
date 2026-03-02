ALTER TABLE "MealPlan" RENAME TO "SavedRecipe";

ALTER TABLE "SavedRecipe" RENAME CONSTRAINT "MealPlan_pkey" TO "SavedRecipe_pkey";
ALTER TABLE "SavedRecipe" RENAME CONSTRAINT "MealPlan_recipeId_fkey" TO "SavedRecipe_recipeId_fkey";
ALTER TABLE "SavedRecipe" RENAME CONSTRAINT "MealPlan_userId_fkey" TO "SavedRecipe_userId_fkey";
