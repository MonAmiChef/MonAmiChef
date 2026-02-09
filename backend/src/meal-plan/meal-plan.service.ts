import { Injectable } from '@nestjs/common';
import { MealPlanRepository } from './meal-plan.repository';

@Injectable()
export class MealPlanService {
  constructor(private mealPlanRepository: MealPlanRepository) {}

  async getUserMealPlan(userId: string) {
    return this.mealPlanRepository.getUserMealPlan(userId);
  }

  async removeFromMealPlan(userId: string, recipeId: string) {
    return this.mealPlanRepository.removeFromMealPlan(userId, recipeId);
  }

  async addRemoveMealToGroceries(
    userId: string,
    recipeId: string,
    newState: boolean,
  ) {
    return this.mealPlanRepository.addRemoveMealToGroceries(
      userId,
      recipeId,
      newState,
    );
  }
}
