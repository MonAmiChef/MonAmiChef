import { Injectable } from '@nestjs/common';
import { ParseRecipeResponse } from './recipes.types';
import { AiAssistantService } from 'src/ai-assistant/ai-assistant.service';

@Injectable()
export class RecipesService {
  constructor(private aiAssistantService: AiAssistantService) {}

  async parseRecipe({ text }: { text: string }): Promise<ParseRecipeResponse> {
    return this.aiAssistantService.parseRecipe({ text });
  }
}
