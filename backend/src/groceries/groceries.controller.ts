import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  SupabaseGuard,
  type AuthenticatedRequest,
} from '../supabase-guard/supabase.guard';
import {
  AddMealToGroceriesRequestDto,
  GetUserGroceriesResponseDto,
  ToggleIngredientsStatusRequestDto,
  ToggleIngredientsStatusResponseDto,
} from './groceries.dto';
import { GroceriesService } from './groceries.service';
import { ZodResponse } from 'nestjs-zod';

@Controller('groceries')
@UseGuards(SupabaseGuard)
export class GroceriesController {
  constructor(private groceriesService: GroceriesService) {}

  @Post('add')
  async addRemoveMealToGroceries(
    @Req() req: AuthenticatedRequest,
    @Body() body: AddMealToGroceriesRequestDto,
  ) {
    return this.groceriesService.addRemoveMealToGroceries(
      req.user.id,
      body.recipeId,
      body.newState,
    );
  }

  @Get('user-recipes')
  async getUserRecipesInGroceries(@Req() req: AuthenticatedRequest) {
    return this.groceriesService.getUserRecipesInGroceries(req.user.id);
  }

  @Get()
  @ZodResponse({ status: 200, type: GetUserGroceriesResponseDto })
  async getUserGroceries(
    @Req() req: AuthenticatedRequest,
    @Query('date') date?: string,
  ) {
    console.log('[GroceriesController] GET /groceries for user:', req.user.id, 'with date:', date);
    return this.groceriesService.getUserGroceries(req.user.id, date);
  }

  @Post()
  @ZodResponse({ status: 200, type: ToggleIngredientsStatusResponseDto })
  async toggleIngredientsStatus(
    @Req() req: AuthenticatedRequest,
    @Body() body: ToggleIngredientsStatusRequestDto,
  ) {
    return this.groceriesService.toggleIngredientsStatus(
      req.user.id,
      body.ingredientIds,
      body.isBought,
    );
  }
}
