import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  prepTimeMin: z.number().nullable(),
  servings: z.number().nullable(),
  difficulty: z.string().nullable(),
  instructions: z.array(z.string()),
  calories: z.number().nullable(),
  proteins: z.number().nullable(),
  carbs: z.number().nullable(),
  fat: z.number().nullable(),
  fibers: z.number().nullable(),
  isVegetarian: z.boolean(),
  isVegan: z.boolean(),
  isGlutenFree: z.boolean(),
  isDairyFree: z.boolean(),
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
  userId: z.string(),
  imagePath: z.string().nullable(),
  messageId: z.string().nullable(),
});

const IngredientReferenceSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    imageUrl: z.string().nullable(),
  })
  .nullable();

const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  recipeId: z.string(),
  category: z.string(),
  referenceId: z.string().nullable(),
  isBought: z.boolean(),
  reference: IngredientReferenceSchema,
});

const GetRecipeResponseSchema = RecipeSchema.extend({
  ingredients: z.array(IngredientSchema),
});

export type GetRecipeResponse = z.output<typeof GetRecipeResponseSchema>;

export class GetRecipeResponseDto extends createZodDto(
  GetRecipeResponseSchema,
) {}
