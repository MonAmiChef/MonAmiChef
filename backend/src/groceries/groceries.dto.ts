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
