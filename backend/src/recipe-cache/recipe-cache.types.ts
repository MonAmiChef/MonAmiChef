/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecipeCacheType } from '@prisma/client';

export type StoreRecipeParams = {
  inputHash: string;
  aiResponseJson: any;
  type: RecipeCacheType;
};
