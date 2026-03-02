import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const AddToSavedRecipesRequestSchema = z.object({
  messageContent: z.string(),
  messageId: z.string(),
  language: z.string().default('english'),
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
