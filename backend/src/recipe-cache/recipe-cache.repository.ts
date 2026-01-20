import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { StoreRecipeParams } from './recipe-cache.types';

@Injectable()
export class RecipeCacheRepository {
  constructor(private prismaService: PrismaService) {}

  async getAllCachedRecipes() {
    return this.prismaService.recipeCache.findMany();
  }

  async findRecipeByHash({ inputHash }: { inputHash: string }) {
    return this.prismaService.recipeCache.findUnique({
      where: {
        inputHash,
      },
    });
  }

  async storeRecipe({ inputHash, aiResponseJson, type }: StoreRecipeParams) {
    return this.prismaService.recipeCache.create({
      data: {
        inputHash,
        aiResponseJson,
        type,
      },
    });
  }
}
