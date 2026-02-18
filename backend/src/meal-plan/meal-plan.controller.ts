import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import {
  SupabaseGuard,
  type AuthenticatedRequest,
} from 'src/supabase-guard/supabase.guard';
import {
  AddMealToPlanRequestDto,
  AddMealToPlanResponseDto,
  RemoveFromMealPlanRequestDto,
} from './meal-plan.dto';
import { ZodResponse } from 'nestjs-zod';

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

  @Post('add')
  @ZodResponse({
    status: 200,
    type: AddMealToPlanResponseDto,
  })
  addMealToPlan(
    @Body() body: AddMealToPlanRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.mealPlanService.addMealToPlan({
      language: body.language,
      messageId: body.messageId,
      messageContent: body.messageContent,
      userId: req.user.id,
    });
  }
}
