/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecipeCacheType } from '@prisma/client';
import { ParseGroceriesResponse } from '../parse-groceries/parse-groceries.dto';
import { SubstituteIngredientsResponse } from '../substitute/substitute.dto';

export type StoreRecipeParams = {
  inputHash: string;
  aiResponseJson: any;
  type: RecipeCacheType;
};

export type AiResponseJson =
  | SubstituteIngredientsResponse
  | ParseGroceriesResponse;
