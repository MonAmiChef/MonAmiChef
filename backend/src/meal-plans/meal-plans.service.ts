import { Injectable } from '@nestjs/common';
import { MealPlanRepository } from './meal-plans.repository';
import { MealType } from '@prisma/client';

@Injectable()
export class MealPlanService {
  constructor(private mealPlanRepository: MealPlanRepository) {}

  private toDate(dateStr: string): Date {
    return new Date(dateStr + 'T00:00:00.000Z');
  }

  async getMealPlanByDate(userId: string, dateStr: string) {
    return this.mealPlanRepository.getMealPlanByDate(userId, this.toDate(dateStr));
  }

  async getMealPlanInRange(userId: string, startStr: string, endStr: string) {
    return this.mealPlanRepository.getMealPlanByDateRange(
      userId,
      this.toDate(startStr),
      this.toDate(endStr),
    );
  }

  async createEntries(
    userId: string,
    entries: {
      recipeId: string;
      date: string;
      mealType: MealType;
      servings: number;
    }[],
  ) {
    const results = await Promise.all(
      entries.map((entry) =>
        this.mealPlanRepository.createEntry(
          userId,
          entry.recipeId,
          new Date(entry.date + 'T00:00:00.000Z'),
          entry.mealType,
          entry.servings,
        ),
      ),
    );
    return results;
  }

  async deleteEntry(id: string, userId: string) {
    return this.mealPlanRepository.deleteEntry(id, userId);
  }

  async updateServings(id: string, userId: string, servings: number) {
    return this.mealPlanRepository.updateServings(id, userId, servings);
  }
}
