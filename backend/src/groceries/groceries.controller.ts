import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  SupabaseGuard,
  type AuthenticatedRequest,
} from 'src/supabase-guard/supabase.guard';
import { AddMealToGroceriesRequestDto } from './groceries.dto';
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
    await this.groceriesService.getUserRecipesInGroceries(req.user.id);
  }
}
