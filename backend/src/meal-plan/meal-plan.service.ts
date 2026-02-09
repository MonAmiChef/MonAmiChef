import { Injectable } from '@nestjs/common';
import { MealPlanRepository } from './meal-plan.repository';

@Injectable()
export class MealPlanService {
  constructor(private mealPlanRepository: MealPlanRepository) {}

  async getUserMealPlan(userId: string) {
    return this.mealPlanRepository.getUserMealPlan(userId);
  }
}
