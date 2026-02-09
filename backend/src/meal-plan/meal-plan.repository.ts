import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MealPlanRepository {
  constructor(private prismaService: PrismaService) {}

  async getUserMealPlan(userId: string) {
    return this.prismaService.mealPlan.findMany({
      where: { userId: userId },
      include: {
        recipe: true,
      },
    });
  }

  async removeFromMealPlan(userId: string, recipeId: string) {
    return this.prismaService.mealPlan.delete({
      where: {
        recipeId_userId: {
          recipeId,
          userId,
        },
      },
    });
  }

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
}
