import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import {
  SupabaseGuard,
  type AuthenticatedRequest,
} from 'src/supabase-guard/supabase.guard';

@Controller('meal-plan')
@UseGuards(SupabaseGuard)
export class MealPlanController {
  constructor(private mealPlanService: MealPlanService) {}

  @Get()
  async getUserMealPlan(@Req() req: AuthenticatedRequest) {
    return this.mealPlanService.getUserMealPlan(req.user.id);
  }
}
