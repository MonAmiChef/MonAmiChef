import { Injectable } from '@nestjs/common';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import {
  ParseGroceriesResponse,
  ParseGroceriesResponseSchema,
} from './parse-groceries.dto';
import { RecipeCacheService } from '../recipe-cache/recipe-cache.service';

@Injectable()
export class ParseGroceriesService {
  constructor(
    private assistantService: AiAssistantService,
    private recipeCacheService: RecipeCacheService,
  ) {}

  async parseGroceries({
    text,
  }: {
    text: string;
  }): Promise<ParseGroceriesResponse> {
    const cachedRecipe = await this.recipeCacheService.getCachedRecipe({
      text,
      type: 'extraction',
    });

    if (cachedRecipe !== null) {
      return ParseGroceriesResponseSchema.parse(cachedRecipe.aiResponseJson);
    }

    const result = await this.assistantService.parseGroceries({
      text,
    });

    await this.recipeCacheService.storeCacheRecipe({
      text,
      aiResponseJson: result,
      type: 'extraction',
    });

    return result;
  }
}
