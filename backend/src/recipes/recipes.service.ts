import { Injectable, NotFoundException } from '@nestjs/common';
import { ParseRecipeResponse } from './recipes.types';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import { RecipesRepository } from './recipes.repository';
import { GetRecipeResponse } from './recipes.dto';

@Injectable()
export class RecipesService {
  constructor(
    private aiAssistantService: AiAssistantService,
    private recipesRepository: RecipesRepository,
  ) {}

  async findRecipeWithIngredientsById(
    userId: string,
    recipeId: string,
  ): Promise<GetRecipeResponse> {
    const recipe = await this.recipesRepository.findRecipeWithIngredientsById(
      userId,
      recipeId,
    );
    if (!recipe) {
      throw new NotFoundException(`Recipe ${recipeId} not found`);
    }
    return recipe;
  }

  async parseRecipe({
    language,
    text,
  }: {
    language: string;
    text: string;
  }): Promise<ParseRecipeResponse> {
    return this.aiAssistantService.parseRecipe({ language, text });
  }
}
