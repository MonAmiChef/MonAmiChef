import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const AddMealToPlanRequestSchema = z.object({
  messageContent: z.string(),
  messageId: z.string(),
});

export class AddMealToPlanRequestDto extends createZodDto(
  AddMealToPlanRequestSchema,
) {}

const AddMealToPlanResponseSchema = z.object({
  status: z.number(),
  alreadyPresent: z.boolean(),
});

export class AddMealToPlanResponseDto extends createZodDto(
  AddMealToPlanResponseSchema,
) {}

// REMOVE

const removeFromMealPlanRequestSchema = z.object({
  recipeId: z.string(),
});

export class RemoveFromMealPlanRequestDto extends createZodDto(
  removeFromMealPlanRequestSchema,
) {}

const addMealToGroceriesRequestSchema = z.object({
  recipeId: z.string(),
  newState: z.boolean(),
});

export class AddMealToGroceriesRequestDto extends createZodDto(
  addMealToGroceriesRequestSchema,
) {}
