import { Injectable } from '@nestjs/common';
import { ParseRecipeResponse } from './recipes.types';
import { AiAssistantService } from 'src/ai-assistant/ai-assistant.service';
import { RecipesRepository } from './recipes.repository';

@Injectable()
export class RecipesService {
  constructor(
    private aiAssistantService: AiAssistantService,
    private recipesRepository: RecipesRepository,
  ) {}

  async findRecipeWithIngredientsById(userId: string, recipeId: string) {
    return this.recipesRepository.findRecipeWithIngredientsById(
      userId,
      recipeId,
    );
  }

  async parseRecipe({ text }: { text: string }): Promise<ParseRecipeResponse> {
    return this.aiAssistantService.parseRecipe({ text });
  }
}
