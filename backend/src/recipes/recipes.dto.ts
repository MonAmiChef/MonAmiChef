import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const AddMealToPlanRequestSchema = z.object({
  messageContent: z.string(),
});

export type AddMealToPlanRequest = z.output<typeof AddMealToPlanRequestSchema>;

export class AddMealToPlanRequestDto extends createZodDto(
  AddMealToPlanRequestSchema,
) {}

const AddMealToPlanResponseSchema = z.object({
  status: z.number(),
});

export type AddMealToPlanResponse = z.output<
  typeof AddMealToPlanResponseSchema
>;

export class AddMealToPlanResponseDto extends createZodDto(
  AddMealToPlanResponseSchema,
) {}

// PARSE RECIPE

export const IngredientCategoryEnum = z.enum([
  'FRUITS',
  'VEGETABLES',
  'MEAT',
  'FISH',
  'DAIRY',
  'PANTRY',
  'BAKERY',
  'FROZEN',
  'DRINKS',
  'OTHER',
]);

export const IngredientSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  category: IngredientCategoryEnum,
});

export const ParseRecipeResponseSchema = z.object({
  ingredients: z.array(IngredientSchema),
  recipe: z.object({
    name: z.string(),
    prepTimeMin: z.number().int(),
    servings: z.number().int(),
    difficulty: z.string(),
    calories: z.number(),
    proteins: z.number(),
    carbs: z.number(),
    fat: z.number(),
    fibers: z.number(),
    isVegetarian: z.boolean().default(false),
    isVegan: z.boolean().default(false),
    isGlutenFree: z.boolean().default(false),
    isDairyFree: z.boolean().default(false),
  }),
});

export type ParseRecipeResponse = z.output<typeof ParseRecipeResponseSchema>;

export const ParseRecipeResponseJson = {
  type: 'object',
  properties: {
    recipe: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        prepTimeMin: { type: 'integer' },
        servings: { type: 'integer' },
        difficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
        },
        calories: { type: 'number' },
        proteins: { type: 'number' },
        carbs: { type: 'number' },
        fat: { type: 'number' },
        fibers: { type: 'number' },
        isVegetarian: { type: 'boolean' },
        isVegan: { type: 'boolean' },
        isGlutenFree: { type: 'boolean' },
        isDairyFree: { type: 'boolean' },
      },
      required: [
        'name',
        'prepTimeMin',
        'servings',
        'difficulty',
        'proteins',
        'calories',
        'carbs',
        'fat',
        'fibers',
        'isVegetarian',
        'isVegan',
        'isGlutenFree',
        'isDairyFree',
      ],
    },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'number' },
          unit: { type: 'string' },
          category: {
            type: 'string',
            enum: [
              'FRUITS',
              'VEGETABLES',
              'MEAT',
              'FISH',
              'DAIRY',
              'PANTRY',
              'BAKERY',
              'FROZEN',
              'DRINKS',
              'OTHER',
            ],
          },
        },
        required: ['name', 'quantity', 'unit', 'category'],
      },
    },
  },
  required: ['recipe', 'ingredients'],
};
