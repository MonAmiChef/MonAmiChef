import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { RecipeSchema } from '../recipes/recipes.dto';
import { ChatIngredientSchema } from '../chat-sessions/chat-sessions.dto';

const AddToSavedRecipesRequestSchema = z.object({
  messageContent: z.string(),
  messageId: z.string(),
  language: z.string().default('english'),
  ingredients: z.array(ChatIngredientSchema).optional(),
  servings: z.number().int().positive().optional(),
});

export class AddToSavedRecipesRequestDto extends createZodDto(
  AddToSavedRecipesRequestSchema,
) {}

const AddToSavedRecipesResponseSchema = z.object({
  status: z.number(),
  alreadyPresent: z.boolean(),
});

export class AddToSavedRecipesResponseDto extends createZodDto(
  AddToSavedRecipesResponseSchema,
) {}

const RemoveFromSavedRecipesRequestSchema = z.object({
  recipeId: z.string(),
});

export class RemoveFromSavedRecipesRequestDto extends createZodDto(
  RemoveFromSavedRecipesRequestSchema,
) {}

const SavedRecipeBaseSchema = z.object({
  recipeId: z.string(),
  userId: z.string(),
  plannedFor: z.coerce.string(),
  createdAt: z.coerce.string(),
  isInGroceryList: z.boolean(),
  servings: z.number(),
});

const GetSavedRecipesResponseSchema = z.array(
  SavedRecipeBaseSchema.extend({ recipe: RecipeSchema }),
);

export type GetSavedRecipesResponse = z.output<
  typeof GetSavedRecipesResponseSchema
>;

export class GetSavedRecipesResponseDto extends createZodDto(
  GetSavedRecipesResponseSchema,
) {}

export type RemoveFromSavedRecipesResponse = z.output<
  typeof SavedRecipeBaseSchema
>;

export class RemoveFromSavedRecipesResponseDto extends createZodDto(
  SavedRecipeBaseSchema,
) {}

const UpdateServingsRequestSchema = z.object({
  recipeId: z.string(),
  servings: z.number().int().min(1),
});

export class UpdateServingsRequestDto extends createZodDto(
  UpdateServingsRequestSchema,
) {}
