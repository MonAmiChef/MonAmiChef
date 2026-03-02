/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { SavedRecipesRepository } from './saved-recipes.repository';
import { RecipesService } from 'src/recipes/recipes.service';
import { RecipesRepository } from 'src/recipes/recipes.repository';
import { UnsplashService } from 'src/unsplash/unsplash.service';

@Injectable()
export class SavedRecipesService {
  constructor(
    private savedRecipesRepository: SavedRecipesRepository,
    private recipesRepository: RecipesRepository,
    private recipesService: RecipesService,
    private unsplashService: UnsplashService,
  ) {}

  async getSavedRecipes(userId: string) {
    return this.savedRecipesRepository.getSavedRecipes(userId);
  }

  async removeFromSavedRecipes(userId: string, recipeId: string) {
    return this.savedRecipesRepository.removeFromSavedRecipes(userId, recipeId);
  }

  async addToSavedRecipes({
    language,
    messageId,
    messageContent,
    userId,
  }: {
    language: string;
    messageId: string;
    messageContent: string;
    userId: string;
  }) {
    const existingRecipe =
      await this.recipesRepository.findByMessageId(messageId);

    if (existingRecipe) {
      const result = await this.recipesRepository.addExistingRecipeToPlan(
        existingRecipe.id,
        userId,
      );
      return { status: 200, alreadyPresent: result.alreadyPresent ?? false };
    }

    const aiData = await this.recipesService.parseRecipe({
      language,
      text: messageContent,
    });

    await this.recipesRepository.createFullRecipeContext({
      userId,
      imagePath: '',
      recipeData: aiData.recipe,
      messageId,
      ingredients: aiData.ingredients as any[],
    });

    return { status: 200, alreadyPresent: false };
  }
}
