import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GroceriesRepository {
  constructor(private prismaService: PrismaService) {}

  async addRemoveMealToGroceries(
    userId: string,
    recipeId: string,
    newState: boolean,
  ) {
    return this.prismaService.savedRecipe.update({
      where: {
        recipeId_userId: {
          userId,
          recipeId,
        },
      },
      data: {
        isInGroceryList: newState,
      },
    });
  }

  async getUserRecipesInGroceries(userId: string) {
    return this.prismaService.savedRecipe.findMany({
      where: {
        userId,
        isInGroceryList: true,
      },
    });
  }

  async getUserGroceries(userId: string, dateStr?: string) {
    console.log('[GroceriesRepo] Fetching groceries for user:', userId, 'with base date:', dateStr);
    
    // Use the provided date or fall back to server's today
    const tomorrowStr = new Date().toISOString().split('T')[0];
    const baseDateStr = dateStr || tomorrowStr;
    const today = new Date(baseDateStr + 'T00:00:00.000Z');
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 10); // Be very inclusive (10 days)

    console.log('[GroceriesRepo] Window:', {
      yesterday: yesterday.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Fetch manually added recipes
    const savedRecipes = await this.prismaService.savedRecipe.findMany({
      where: {
        userId,
        isInGroceryList: true,
      },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                reference: true,
              },
            },
          },
        },
      },
    });
    console.log('[GroceriesRepo] Found saved recipes:', savedRecipes.length);

    // Fetch recipes from meal plan for the next 10 days (+ yesterday buffer)
    const mealPlanEntries = await this.prismaService.mealPlanEntry.findMany({
      where: {
        userId,
        date: {
          gte: yesterday,
          lte: endDate,
        },
      },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                reference: true,
              },
            },
          },
        },
      },
    });
    console.log('[GroceriesRepo] Found meal plan entries:', mealPlanEntries.length);

    // Combine both sources for aggregation
    const allItems = [
      ...savedRecipes.map((s) => ({
        recipe: s.recipe,
        servings: s.servings || 1,
      })),
      ...mealPlanEntries.map((m) => ({
        recipe: m.recipe,
        servings: m.servings,
      })),
    ];
    console.log('[GroceriesRepo] Total items to aggregate:', allItems.length);

    const mergedIngredients = allItems.reduce(
      (acc, item) => {
        if (!item.recipe) return acc;

        const recipeName = item.recipe.name;
        const recipeId = item.recipe.id;
        const servingsFactor = Number(item.servings || 1);

        item.recipe.ingredients.forEach((ing) => {
          const key = `${ing.name.toLowerCase().trim()}_${ing.unit.toLowerCase().trim()}`;
          const adjustedQuantity = ing.quantity * servingsFactor;

          if (!acc[key]) {
            acc[key] = {
              name: ing.name,
              totalQuantity: adjustedQuantity,
              unit: ing.unit,
              category: ing.category,
              recipeDetails: [{ id: recipeId, name: recipeName, servings: servingsFactor }],
              isBought: ing.isBought,
              ingredientIds: [ing.id],
              image: ing.reference?.imageUrl || null,
            };
          } else {
            acc[key].totalQuantity += adjustedQuantity;
            acc[key].isBought = acc[key].isBought && ing.isBought;
            acc[key].ingredientIds.push(ing.id);
            if (!acc[key].image && ing.reference?.imageUrl) {
              acc[key].image = ing.reference.imageUrl;
            }

            const existingRecipe = acc[key].recipeDetails.find(rd => rd.id === recipeId);
            if (existingRecipe) {
              existingRecipe.servings += servingsFactor;
            } else {
              acc[key].recipeDetails.push({ id: recipeId, name: recipeName, servings: servingsFactor });
            }
          }
        });

        return acc;
      },
      {} as Record<string, any>,
    );

    const results = Object.values(mergedIngredients).sort((a, b) =>
      (a.category || '').localeCompare(b.category || ''),
    );
    console.log('[GroceriesRepo] Final ingredients count:', results.length);
    return results;
  }

  async toggleIngredientsStatus(
    userId: string,
    ingredientIds: string[],
    isBought: boolean,
  ) {
    return this.prismaService.ingredient.updateMany({
      where: {
        id: { in: ingredientIds },
        recipe: { userId: userId },
      },
      data: { isBought },
    });
  }
}
