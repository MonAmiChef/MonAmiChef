import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  SupabaseGuard,
  type AuthenticatedRequest,
} from 'src/supabase-guard/supabase.guard';
import {
  AddMealToGroceriesRequestDto,
  ToggleIngredientsStatusRequestDto,
} from './groceries.dto';
import { GroceriesService } from './groceries.service';

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
  async getUserGroceries(@Req() req: AuthenticatedRequest) {
    return this.groceriesService.getUserGroceries(req.user.id);
  }

  @Post()
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
