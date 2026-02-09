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
}
