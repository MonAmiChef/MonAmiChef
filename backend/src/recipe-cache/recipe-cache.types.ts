import { RecipeCacheType } from '@prisma/client';
import { ParseGroceriesResponse } from '../parser/parser.dto';

export type StoreRecipeParams = {
  inputHash: string;
  aiResponseJson: ParseGroceriesResponse;
  type: RecipeCacheType;
};
