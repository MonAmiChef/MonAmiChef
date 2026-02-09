import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const removeFromMealPlanRequestSchema = z.object({
  recipeId: z.string(),
});

export class RemoveFromMealPlanRequestDto extends createZodDto(
  removeFromMealPlanRequestSchema,
) {}

export const addMealToGroceriesRequestSchema = z.object({
  recipeId: z.string(),
  newState: z.boolean(),
});

export class AddMealToGroceriesRequestDto extends createZodDto(
  addMealToGroceriesRequestSchema,
) {}

export const MealPlanItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  recipeId: z.string(),
  createdAt: z.date(),
  plannedFor: z.date(),
  recipe: z.object({
    id: z.string(),
    name: z.string(),
    calories: z.number().nullable(),
    proteins: z.number().nullable(),
    carbs: z.number().nullable(),
    fat: z.number().nullable(),
    imagePath: z.string().nullable(),
  }),
});

export const MealPlanListSchema = z.array(MealPlanItemSchema);
export class MealPlanListResponseDto extends createZodDto(MealPlanListSchema) {}
