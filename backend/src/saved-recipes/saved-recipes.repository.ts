import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SavedRecipesRepository {
  constructor(private prismaService: PrismaService) {}

  async getSavedRecipes(userId: string) {
    return this.prismaService.savedRecipe.findMany({
      where: { userId: userId },
      include: {
        recipe: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async removeFromSavedRecipes(userId: string, recipeId: string) {
    return this.prismaService.savedRecipe.delete({
      where: {
        recipeId_userId: {
          recipeId,
          userId,
        },
      },
    });
  }

  async updateServings(userId: string, recipeId: string, servings: number) {
    return this.prismaService.savedRecipe.update({
      where: {
        recipeId_userId: {
          recipeId,
          userId,
        },
      },
      data: { servings },
    });
  }

  async updateFavorite(userId: string, recipeId: string, isFavorite: boolean) {
    return this.prismaService.savedRecipe.update({
      where: {
        recipeId_userId: {
          recipeId,
          userId,
        },
      },
      data: {
        isFavorite,
        favoritedAt: isFavorite ? new Date() : null,
      },
    });
  }
}
