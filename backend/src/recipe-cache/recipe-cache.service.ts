import { Injectable, Logger } from '@nestjs/common';
import { RecipeCacheRepository } from './recipe-cache.repository';
import { RecipeCache, RecipeCacheType } from '@prisma/client';
import { HashingService } from '../hashing/hashing.service';
import { ParseGroceriesResponse } from '../parser/parser.dto';

@Injectable()
export class RecipeCacheService {
  private readonly logger = new Logger(RecipeCacheService.name);

  constructor(
    private recipeCacheRepository: RecipeCacheRepository,
    private hashingService: HashingService,
  ) {}

  async getCachedRecipe({
    text,
    type,
  }: {
    text: string;
    type: RecipeCacheType;
  }): Promise<RecipeCache | null> {
    const inputHash = this.hashingService.textToHash({ text: text + type });

    return this.recipeCacheRepository.findRecipeByHash({ inputHash });
  }

  async storeCacheRecipe({
    text,
    aiResponseJson,
    type,
  }: {
    text: string;
    aiResponseJson: ParseGroceriesResponse;
    type: RecipeCacheType;
  }): Promise<RecipeCache> {
    const inputHash = this.hashingService.textToHash({ text: text + type });

    return this.recipeCacheRepository.storeRecipe({
      inputHash,
      aiResponseJson,
      type,
    });
  }
}
