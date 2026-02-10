import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class GroceriesRepository {
  constructor(private prismaService: PrismaService) {}

  async addRemoveMealToGroceries(
    userId: string,
    recipeId: string,
    newState: boolean,
  ) {
    return this.prismaService.mealPlan.update({
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
    return this.prismaService.mealPlan.findMany({
      where: {
        userId,
      },
    });
  }

  async getUserGroceries(userId: string) {
    const mealPlans = await this.prismaService.mealPlan.findMany({
      where: {
        userId,
        isInGroceryList: true,
      },
      include: {
        recipe: {
          select: {
            name: true,
            servings: true,
            ingredients: true,
          },
        },
      },
    });

    const mergedIngredients = mealPlans.reduce(
      (acc, plan) => {
        const recipeName = plan.recipe.name;
        const planServings = Number(plan.servings || 2);
        const recipeServings = plan.recipe.servings || 2;

        const servingsFactor = planServings / recipeServings;
        plan.recipe.ingredients.forEach((ing) => {
          const key = `${ing.name.toLowerCase().trim()}_${ing.unit.toLowerCase().trim()}`;
          const adjustedQuantity = ing.quantity * servingsFactor;

          if (!acc[key]) {
            acc[key] = {
              name: ing.name,
              totalQuantity: adjustedQuantity,
              unit: ing.unit,
              category: ing.category,
              recipes: [recipeName],
              isBought: ing.isBought,
              ingredientIds: [ing.id],
            };
          } else {
            acc[key].totalQuantity += adjustedQuantity;
            acc[key].isBought = acc[key].isBought && ing.isBought;
            acc[key].ingredientIds.push(ing.id);

            if (!acc[key].recipes.includes(recipeName)) {
              acc[key].recipes.push(recipeName);
            }
          }
        });

        return acc;
      },
      {} as Record<
        string,
        {
          name: string;
          totalQuantity: number;
          unit: string;
          category: string;
          recipes: string[];
          isBought: boolean;
          ingredientIds: string[];
        }
      >,
    );

    return Object.values(mergedIngredients).sort((a, b) =>
      a.category.localeCompare(b.category),
    );
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
