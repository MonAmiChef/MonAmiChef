import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const addMealToGroceriesRequestSchema = z.object({
  recipeId: z.string(),
  newState: z.boolean(),
});

export class AddMealToGroceriesRequestDto extends createZodDto(
  addMealToGroceriesRequestSchema,
) {}
