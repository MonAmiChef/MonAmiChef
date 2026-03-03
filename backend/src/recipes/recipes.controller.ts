import { Body, Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import {
  SupabaseGuard,
  type AuthenticatedRequest,
} from '../supabase-guard/supabase.guard';
import { ZodResponse } from 'nestjs-zod';
import { GetRecipeResponseDto } from './recipes.dto';

@Controller('recipes')
@UseGuards(SupabaseGuard)
export class RecipesController {
  constructor(private recipesService: RecipesService) {}

  @Get(':id')
  @ZodResponse({ status: 200, type: GetRecipeResponseDto })
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
