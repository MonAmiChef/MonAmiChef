import { z } from 'zod';

const ingredientCategoryEnum = z.enum([
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

const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  category: ingredientCategoryEnum,
});

export const ParseRecipeResponseSchema = z.object({
  ingredients: z.array(ingredientSchema),
  recipe: z.object({
    name: z.string(),
    description: z.string().nullable(),
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
        description: { type: 'string' },
        prepTimeMin: { type: 'integer' },
        servings: { type: 'integer' },
        difficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
        },
        calories: { type: 'number', description: 'Total calories per serving' },
        proteins: {
          type: 'number',
          description: 'Grams of protein per serving',
        },
        carbs: {
          type: 'number',
          description: 'Grams of carbohydrates per serving',
        },
        fat: { type: 'number', description: 'Grams of fat per serving' },
        fibers: { type: 'number', description: 'Grams of fiber per serving' },
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
