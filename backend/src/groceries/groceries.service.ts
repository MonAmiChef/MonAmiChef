import { Injectable } from '@nestjs/common';
import { GroceriesRepository } from './groceries.repository';

@Injectable()
export class GroceriesService {
  constructor(private groceriesRepository: GroceriesRepository) {}

  async addRemoveMealToGroceries(
    userId: string,
    recipeId: string,
    newState: boolean,
  ) {
    return this.groceriesRepository.addRemoveMealToGroceries(
      userId,
      recipeId,
      newState,
    );
  }

  async getUserRecipesInGroceries(userId: string) {
    return this.groceriesRepository.getUserRecipesInGroceries(userId);
  }

  async getUserGroceries(userId: string) {
    return this.groceriesRepository.getUserGroceries(userId);
  }

  async toggleIngredientsStatus(
    userId: string,
    ingredientIds: string[],
    isBought: boolean,
  ) {
    return this.groceriesRepository.toggleIngredientsStatus(
      userId,
      ingredientIds,
      isBought,
    );
  }
}
