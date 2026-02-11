import { Injectable } from '@nestjs/common';
import { MealPlanRepository } from './meal-plan.repository';
import { RecipesService } from 'src/recipes/recipes.service';
import { RecipesRepository } from 'src/recipes/recipes.repository';
import { UnsplashService } from 'src/unsplash/unsplash.service';

@Injectable()
export class MealPlanService {
  constructor(
    private mealPlanRepository: MealPlanRepository,
    private recipesRepository: RecipesRepository,
    private recipesService: RecipesService,
    private unsplashService: UnsplashService,
  ) {}

  async getUserMealPlan(userId: string) {
    return this.mealPlanRepository.getUserMealPlan(userId);
  }

  async removeFromMealPlan(userId: string, recipeId: string) {
    return this.mealPlanRepository.removeFromMealPlan(userId, recipeId);
  }

  async addMealToPlan({
    language,
    messageId,
    messageContent,
    userId,
  }: {
    language: string;
    messageId: string;
    messageContent: string;
    userId: string;
  }) {
    const existingRecipe =
      await this.recipesRepository.findByMessageId(messageId);

    if (existingRecipe) {
      const result = await this.recipesRepository.addExistingRecipeToPlan(
        existingRecipe.id,
        userId,
      );
      return { status: 200, alreadyPresent: result.alreadyPresent ?? false };
    }

    const aiData = await this.recipesService.parseRecipe({
      language,
      text: messageContent,
    });

    // const image = await this.unsplashService.getImageByPrompt(messageContent);

    await this.recipesRepository.createFullRecipeContext({
      userId,
      imagePath: '',
      recipeData: aiData.recipe,
      messageId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      ingredients: aiData.ingredients as any[],
    });

    return { status: 200, alreadyPresent: false };
  }
}
