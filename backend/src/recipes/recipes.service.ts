import { Injectable } from '@nestjs/common';
import { AddMealToPlanResponse, ParseRecipeResponse } from './recipes.dto';
import { RecipesRepository } from './recipes.repository';
import { AiAssistantService } from 'src/ai-assistant/ai-assistant.service';
import { Ingredient, Recipe } from '@prisma/client';
import { UnsplashService } from 'src/unsplash/unsplash.service';

@Injectable()
export class RecipesService {
  constructor(
    private recipesRepository: RecipesRepository,
    private aiAssistantService: AiAssistantService,
    private unsplashService: UnsplashService,
  ) {}

  async parseRecipe({ text }: { text: string }): Promise<ParseRecipeResponse> {
    return this.aiAssistantService.parseRecipe({ text });
  }

  async addMealToPlan({
    messageContent,
    userId,
  }: {
    messageContent: string;
    userId: string;
  }): Promise<AddMealToPlanResponse> {
    // Parse recipe and ingredients from raw text
    const { recipe, ingredients } = await this.parseRecipe({
      text: messageContent,
    });

    // Retrieve unsplash image
    const image = await this.unsplashService.getImageByPrompt(recipe.name);

    // Store the recipe in db
    const storedRecipe = await this.recipesRepository.createRecipeEntry({
      userId,
      recipe: recipe as Recipe,
      imagePath: image?.url ?? '',
    });

    // Store the resulting list of ingredients in DB
    await this.recipesRepository.storeIngredients({
      recipeId: storedRecipe.id,
      ingredients: ingredients as Ingredient[],
    });

    // Create meal plan entry
    await this.recipesRepository.createMealPlanEntry({
      userId,
      recipeId: storedRecipe.id,
    });

    return {
      status: 200,
    };
  }
}
