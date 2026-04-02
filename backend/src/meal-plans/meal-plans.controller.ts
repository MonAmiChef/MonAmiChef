import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MealPlanService } from './meal-plans.service';
import {
  SupabaseGuard,
  type AuthenticatedRequest,
} from '../supabase-guard/supabase.guard';
import {
  CreateMealPlanRequestDto,
  UpdateMealPlanServingsRequestDto,
} from './meal-plans.dto';

@Controller('meal-plans')
@UseGuards(SupabaseGuard)
export class MealPlanController {
  constructor(private mealPlanService: MealPlanService) {}

  @Get()
  async getMealPlan(
    @Req() req: AuthenticatedRequest,
    @Query('date') date: string,
  ) {
    console.log('[MealPlanController] GET /meal-plans for user:', req.user.id, 'with date:', date);
    return this.mealPlanService.getMealPlanByDate(req.user.id, date);
  }

  @Post()
  async createMealPlanEntries(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateMealPlanRequestDto,
  ) {
    return this.mealPlanService.createEntries(req.user.id, body.entries);
  }

  @Delete(':id')
  async deleteMealPlanEntry(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.mealPlanService.deleteEntry(id, req.user.id);
  }

  @Patch(':id/servings')
  async updateServings(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateMealPlanServingsRequestDto,
  ) {
    return this.mealPlanService.updateServings(id, req.user.id, body.servings);
  }
}
