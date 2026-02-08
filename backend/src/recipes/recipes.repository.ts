import { Injectable } from '@nestjs/common';
import { Ingredient, Prisma, Recipe } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RecipesRepository {
  constructor(private prismaService: PrismaService) {}

  async storeIngredients({
    recipeId,
    ingredients,
  }: {
    recipeId: string;
    ingredients: Ingredient[];
  }) {
    return this.prismaService.ingredient.createMany({
      data: ingredients.map((ingredient) => ({
        ...ingredient,
        recipeId: recipeId,
      })),
    });
  }

  async createRecipeEntry({
    userId,
    recipe,
  }: {
    userId: string;
    recipe: Omit<
      Prisma.RecipeCreateInput,
      'user' | 'ingredients' | 'mealPlans'
    >;
  }): Promise<Recipe> {
    return this.prismaService.recipe.create({
      data: {
        name: recipe.name,
        prepTimeMin: recipe.prepTimeMin,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        calories: recipe.calories,
        proteins: recipe.proteins,
        carbs: recipe.carbs,
        fat: recipe.fat,
        fibers: recipe.fibers,
        isVegetarian: recipe.isVegetarian ?? false,
        isVegan: recipe.isVegan ?? false,
        isGlutenFree: recipe.isGlutenFree ?? false,
        isDairyFree: recipe.isDairyFree ?? false,
        imagePath: recipe.imagePath,
        userId: userId,
      },
    });
  }

  async createMealPlanEntry({
    recipeId,
    userId,
  }: {
    recipeId: string;
    userId: string;
  }) {
    return await this.prismaService.mealPlan.create({
      data: {
        userId,
        recipeId,
        plannedFor: new Date(),
      },
      include: {
        recipe: true,
      },
    });
  }
}
