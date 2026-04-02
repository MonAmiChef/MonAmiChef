import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const addMealToGroceriesRequestSchema = z.object({
  recipeId: z.string(),
  newState: z.boolean(),
});

export class AddMealToGroceriesRequestDto extends createZodDto(
  addMealToGroceriesRequestSchema,
) {}

const toggleIngredientsStatusRequestSchema = z.object({
  ingredientIds: z.array(z.string()),
  isBought: z.boolean(),
});

export class ToggleIngredientsStatusRequestDto extends createZodDto(
  toggleIngredientsStatusRequestSchema,
) {}

// Response schemas

const SavedRecipeBaseSchema = z.object({
  recipeId: z.string(),
  userId: z.string(),
  plannedFor: z.coerce.string(),
  createdAt: z.coerce.string(),
  isInGroceryList: z.boolean(),
  servings: z.number(),
});

export type AddRemoveMealToGroceriesResponse = z.output<
  typeof SavedRecipeBaseSchema
>;

export class AddRemoveMealToGroceriesResponseDto extends createZodDto(
  SavedRecipeBaseSchema,
) {}

const GetUserRecipesInGroceriesResponseSchema = z.array(SavedRecipeBaseSchema);

export type GetUserRecipesInGroceriesResponse = z.output<
  typeof GetUserRecipesInGroceriesResponseSchema
>;

export class GetUserRecipesInGroceriesResponseDto extends createZodDto(
  GetUserRecipesInGroceriesResponseSchema,
) {}

const GroceryItemSchema = z.object({
  name: z.string(),
  totalQuantity: z.number(),
  unit: z.string(),
  category: z.string(),
  recipeDetails: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      servings: z.number(),
    }),
  ),
  isBought: z.boolean(),
  ingredientIds: z.array(z.string()),
  image: z.string().nullable(),
});

const GetUserGroceriesResponseSchema = z.array(GroceryItemSchema);

export type GetUserGroceriesResponse = z.output<
  typeof GetUserGroceriesResponseSchema
>;

export class GetUserGroceriesResponseDto extends createZodDto(
  GetUserGroceriesResponseSchema,
) {}

const ToggleIngredientsStatusResponseSchema = z.object({
  count: z.number(),
});

export type ToggleIngredientsStatusResponse = z.output<
  typeof ToggleIngredientsStatusResponseSchema
>;

export class ToggleIngredientsStatusResponseDto extends createZodDto(
  ToggleIngredientsStatusResponseSchema,
) {}
