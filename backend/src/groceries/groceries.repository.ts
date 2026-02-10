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
}
