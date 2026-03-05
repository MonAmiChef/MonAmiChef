import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { SavedRecipesService } from './saved-recipes.service';
import {
  SupabaseGuard,
  type AuthenticatedRequest,
} from '../supabase-guard/supabase.guard';
import {
  AddToSavedRecipesRequestDto,
  AddToSavedRecipesResponseDto,
  RemoveFromSavedRecipesRequestDto,
  UpdateServingsRequestDto,
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

  @Patch('servings')
  updateServings(
    @Body() body: UpdateServingsRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.savedRecipesService.updateServings(
      req.user.id,
      body.recipeId,
      body.servings,
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
    });
  }
}
