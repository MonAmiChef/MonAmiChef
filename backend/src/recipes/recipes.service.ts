import { Injectable } from '@nestjs/common';
import { ParseRecipeResponse } from './recipes.dto';
import { RecipesRepository } from './recipes.repository';
import { AiAssistantService } from 'src/ai-assistant/ai-assistant.service';
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
  }) {
    const [aiData, image] = await Promise.all([
      this.parseRecipe({ text: messageContent }),
      this.unsplashService.getImageByPrompt(messageContent.substring(0, 30)),
    ]);

    await this.recipesRepository.createFullRecipeContext({
      userId,
      imagePath: image?.url ?? '',
      recipeData: aiData.recipe,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      ingredients: aiData.ingredients as any[],
    });

    return { status: 200 };
  }
}
