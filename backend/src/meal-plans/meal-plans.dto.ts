import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { RecipeSchema } from '../recipes/recipes.dto';

const MealTypeEnum = z.enum(['BREAKFAST', 'LUNCH', 'DINNER']);

const CreateMealPlanEntrySchema = z.object({
  recipeId: z.string(),
  date: z.string(), // YYYY-MM-DD
  mealType: MealTypeEnum,
  servings: z.number().int().min(1).default(1),
});

const CreateMealPlanRequestSchema = z.object({
  entries: z.array(CreateMealPlanEntrySchema).min(1),
});

export class CreateMealPlanRequestDto extends createZodDto(
  CreateMealPlanRequestSchema,
) {}

const MealPlanEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  recipeId: z.string(),
  date: z.coerce.string(),
  mealType: MealTypeEnum,
  servings: z.number(),
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
});

const MealPlanEntryWithRecipeSchema = MealPlanEntrySchema.extend({
  recipe: RecipeSchema,
});

const GetMealPlanResponseSchema = z.array(MealPlanEntryWithRecipeSchema);

export type GetMealPlanResponse = z.output<typeof GetMealPlanResponseSchema>;

export class GetMealPlanResponseDto extends createZodDto(
  GetMealPlanResponseSchema,
) {}

const CreateMealPlanResponseSchema = z.array(MealPlanEntrySchema);

export type CreateMealPlanResponse = z.output<
  typeof CreateMealPlanResponseSchema
>;

export class CreateMealPlanResponseDto extends createZodDto(
  CreateMealPlanResponseSchema,
) {}

const UpdateMealPlanServingsRequestSchema = z.object({
  servings: z.number().int().min(1),
});

export class UpdateMealPlanServingsRequestDto extends createZodDto(
  UpdateMealPlanServingsRequestSchema,
) {}
