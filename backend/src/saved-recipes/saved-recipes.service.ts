import { Injectable } from '@nestjs/common';
import { SavedRecipesRepository } from './saved-recipes.repository';
import { RecipesService } from '../recipes/recipes.service';
import { RecipesRepository } from '../recipes/recipes.repository';
import { UnsplashService } from '../unsplash/unsplash.service';
import { ChatIngredient } from '../chat-sessions/chat-sessions.dto';
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

  async updateServings(userId: string, recipeId: string, servings: number) {
    return this.savedRecipesRepository.updateServings(userId, recipeId, servings);
  }

  async updateFavorite(userId: string, recipeId: string, isFavorite: boolean) {
    return this.savedRecipesRepository.updateFavorite(userId, recipeId, isFavorite);
  }

  async addToSavedRecipes({
    language,
    messageId,
    messageContent,
    userId,
    ingredients: providedIngredients,
  }: {
    language: string;
    messageId: string;
    messageContent: string;
    userId: string;
    ingredients?: ChatIngredient[];
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

    const finalIngredients = providedIngredients?.length
      ? providedIngredients
      : aiData.ingredients;

    await this.recipesRepository.createFullRecipeContext({
      userId,
      imagePath: '',
      recipeData: {
        ...aiData.recipe,
      },
      messageId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ingredients: finalIngredients as any[],
    });

    return { status: 200, alreadyPresent: false };
  }
}
