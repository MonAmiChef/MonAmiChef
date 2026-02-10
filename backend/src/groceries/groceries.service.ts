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
}
