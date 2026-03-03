import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SavedRecipesService } from './saved-recipes.service';
import {
  SupabaseGuard,
  type AuthenticatedRequest,
} from '../supabase-guard/supabase.guard';
import {
  AddToSavedRecipesRequestDto,
  AddToSavedRecipesResponseDto,
  RemoveFromSavedRecipesRequestDto,
} from './saved-recipes.dto';
import { ZodResponse } from 'nestjs-zod';

@Controller('saved-recipes')
@UseGuards(SupabaseGuard)
export class SavedRecipesController {
  constructor(private savedRecipesService: SavedRecipesService) {}

  @Get()
  async getSavedRecipes(@Req() req: AuthenticatedRequest) {
    return this.savedRecipesService.getSavedRecipes(req.user.id);
  }

  @Post('remove')
  async removeFromSavedRecipes(
    @Req() req: AuthenticatedRequest,
    @Body() body: RemoveFromSavedRecipesRequestDto,
  ) {
    return this.savedRecipesService.removeFromSavedRecipes(
      req.user.id,
      body.recipeId,
    );
  }

  @Post('add')
  @ZodResponse({
    status: 200,
    type: AddToSavedRecipesResponseDto,
  })
  addToSavedRecipes(
    @Body() body: AddToSavedRecipesRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.savedRecipesService.addToSavedRecipes({
      language: body.language,
      messageId: body.messageId,
      messageContent: body.messageContent,
      userId: req.user.id,
      ingredients: body.ingredients,
      servings: body.servings,
    });
  }
}
