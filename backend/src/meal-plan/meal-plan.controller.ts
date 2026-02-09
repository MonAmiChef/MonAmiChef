import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import {
  SupabaseGuard,
  type AuthenticatedRequest,
} from 'src/supabase-guard/supabase.guard';
import {
  AddMealToGroceriesRequestDto,
  RemoveFromMealPlanRequestDto,
} from './meal-plan.dto';

@Controller('meal-plan')
@UseGuards(SupabaseGuard)
export class MealPlanController {
  constructor(private mealPlanService: MealPlanService) {}

  @Get()
  async getUserMealPlan(@Req() req: AuthenticatedRequest) {
    return this.mealPlanService.getUserMealPlan(req.user.id);
  }

  @Post('remove')
  async removeMealFromMealPlan(
    @Req() req: AuthenticatedRequest,
    @Body() body: RemoveFromMealPlanRequestDto,
  ) {
    return this.mealPlanService.removeFromMealPlan(req.user.id, body.recipeId);
  }

  @Post('add-groceries')
  async addRemoveMealToGroceries(
    @Req() req: AuthenticatedRequest,
    @Body() body: AddMealToGroceriesRequestDto,
  ) {
    return this.mealPlanService.addRemoveMealToGroceries(
      req.user.id,
      body.recipeId,
      body.newState,
    );
  }
}
