import { RecipeCacheType } from '@prisma/client';
import { ParseGroceriesResponse } from '../parse-groceries/parse-groceries.dto';
import { SubstituteIngredientsResponse } from '../substitute/substitute.dto';

export type StoreRecipeParams = {
  inputHash: string;
  aiResponseJson: AiResponseJson;
  type: RecipeCacheType;
};

export type AiResponseJson =
  | SubstituteIngredientsResponse
  | ParseGroceriesResponse;
