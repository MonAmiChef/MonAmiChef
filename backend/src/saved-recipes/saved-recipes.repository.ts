import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SavedRecipesRepository {
  constructor(private prismaService: PrismaService) {}

  async getSavedRecipes(userId: string) {
    return this.prismaService.savedRecipe.findMany({
      where: { userId: userId },
      include: {
        recipe: true,
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
}
