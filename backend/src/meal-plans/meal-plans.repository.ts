import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MealType } from '@prisma/client';

@Injectable()
export class MealPlanRepository {
  constructor(private prismaService: PrismaService) {}

  async getMealPlanByDate(userId: string, date: Date) {
    return this.prismaService.mealPlanEntry.findMany({
      where: {
        userId,
        date,
      },
      include: {
        recipe: true,
      },
      orderBy: {
        mealType: 'asc',
      },
    });
  }

  async createEntry(
    userId: string,
    recipeId: string,
    date: Date,
    mealType: MealType,
    servings: number,
  ) {
    return this.prismaService.mealPlanEntry.upsert({
      where: {
        userId_date_mealType: {
          userId,
          date,
          mealType,
        },
      },
      update: {
        recipeId,
        servings,
      },
      create: {
        userId,
        recipeId,
        date,
        mealType,
        servings,
      },
    });
  }

  async deleteEntry(id: string, userId: string) {
    return this.prismaService.mealPlanEntry.delete({
      where: {
        id,
        userId,
      },
    });
  }

  async updateServings(id: string, userId: string, servings: number) {
    return this.prismaService.mealPlanEntry.update({
      where: {
        id,
        userId,
      },
      data: { servings },
    });
  }
}
