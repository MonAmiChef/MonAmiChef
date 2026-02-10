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
      where: { userId },
      include: {
        recipe: {
          select: {
            name: true,
            ingredients: true,
          },
        },
      },
    });

    const mergedIngredients = mealPlans.reduce(
      (acc, plan) => {
        const recipeName = plan.recipe.name;

        plan.recipe.ingredients.forEach((ing) => {
          const key = `${ing.name.toLowerCase().trim()}_${ing.unit.toLowerCase().trim()}`;

          if (!acc[key]) {
            acc[key] = {
              name: ing.name,
              totalQuantity: ing.quantity,
              unit: ing.unit,
              category: ing.category,
              recipes: [recipeName],
            };
          } else {
            acc[key].totalQuantity += ing.quantity;

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
        }
      >,
    );

    return Object.values(mergedIngredients).sort((a, b) =>
      a.category.localeCompare(b.category),
    );
  }
}
