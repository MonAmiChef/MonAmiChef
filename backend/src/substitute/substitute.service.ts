import { Injectable } from '@nestjs/common';
import { RecipeCacheService } from '../recipe-cache/recipe-cache.service';
import {
  SubstituteIngredientsResponse,
  SubstituteIngredientsResponseSchema,
} from './substitute.dto';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';

@Injectable()
export class SubstituteService {
  constructor(
    private recipeCacheService: RecipeCacheService,
    private assistantService: AiAssistantService,
  ) {}

  async substituteIngredients({
    text,
  }: {
    text: string;
  }): Promise<SubstituteIngredientsResponse> {
    const cachedSubstitution = await this.recipeCacheService.getCachedRecipe({
      text,
      type: 'substitution',
    });

    if (cachedSubstitution !== null) {
      return SubstituteIngredientsResponseSchema.parse(
        cachedSubstitution.aiResponseJson,
      );
    }

    const result = await this.assistantService.substituteIngredients({
      text,
    });

    await this.recipeCacheService.storeCacheRecipe({
      text,
      aiResponseJson: result,
      type: 'substitution',
    });

    return result;
  }
}
