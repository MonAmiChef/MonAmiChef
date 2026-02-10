import { Body, Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import {
  SupabaseGuard,
  type AuthenticatedRequest,
} from 'src/supabase-guard/supabase.guard';

@Controller('recipes')
@UseGuards(SupabaseGuard)
export class RecipesController {
  constructor(private recipesService: RecipesService) {}

  @Get(':id')
  async findRecipeWithIngredientsById(
    @Req() req: AuthenticatedRequest,
    @Param('id') recipeId: string,
  ) {
    return this.recipesService.findRecipeWithIngredientsById(
      req.user.id,
      recipeId,
    );
  }
}
