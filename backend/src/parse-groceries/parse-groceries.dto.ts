import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ParseGroceriesRequestSchema = z.object({
  text: z
    .string()
    .min(10, 'Text is too short (min 10 characters)')
    .max(5000, 'Text is too long (max 5000 characters)'),
});

export class ParseGroceriesRequestDto extends createZodDto(
  ParseGroceriesRequestSchema,
) {}

export const ParseGroceriesResponseSchema = z
  .object({
    recipe_name: z.string().describe('The name of the recipe'),
    prep_infos: z.object({
      prep_time_min: z.number(),
      servings: z.number(),
      difficulty: z.string(),
    }),
    macros_per_servings: z.object({
      calories: z.number(),
      proteins: z.number(),
      carbs: z.number(),
      fat: z.number(),
      fibers: z.number(),
    }),
    dietary_info: z.object({
      vegetarian: z.boolean(),
      dairy_free: z.boolean(),
      vegan: z.boolean(),
      gluten_free: z.boolean(),
    }),
    ingredients: z
      .array(
        z.object({
          name: z.string().describe('The name of the ingredient'),
          quantity: z.number().describe('The quantity of the ingredient'),
          unit: z
            .string()
            .describe('The unit of the quantity of an ingredient'),
          category: z.string().describe('The category of an ingredient'),
          raw_text: z.string().describe('The original full line of text'),
        }),
      )
      .describe('A list of ingredient object'),
    substitutions: z.array(
      z.object({
        ingredient_name: z.string().describe('The ingredient to substitute'),
        replacement: z.string().describe('The replacement of ingredient_name'),
        reason: z
          .string()
          .describe(
            'The consequences of the replacement (eg: To make it vegan)',
          ),
      }),
    ),
  })
  .describe('Response schema of parsed ingredients from recipe');

export class ParseGroceriesResponseDto extends createZodDto(
  ParseGroceriesResponseSchema,
) {}

export const ParseGroceriesResponseJson = {
  type: 'object',
  properties: {
    recipe_name: { type: 'string' },
    prep_infos: {
      type: 'object',
      properties: {
        prep_time_min: { type: 'number' },
        servings: { type: 'number' },
        difficulty: { type: 'string' },
      },
      required: ['prep_time_min', 'servings', 'difficulty'],
    },
    macros_per_servings: {
      type: 'object',
      properties: {
        calories: { type: 'number' },
        proteins: { type: 'number' },
        carbs: { type: 'number' },
        fat: { type: 'number' },
        fibers: { type: 'number' },
      },
      required: ['calories', 'proteins', 'carbs', 'fat', 'fibers'],
    },
    dietary_info: {
      type: 'object',
      properties: {
        vegetarian: { type: 'boolean' },
        dairy_free: { type: 'boolean' },
        vegan: { type: 'boolean' },
        gluten_free: { type: 'boolean' },
      },
      required: ['vegetarian', 'dairy_free', 'vegan', 'gluten_free'],
    },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'number' },
          unit: { type: 'string' },
          category: { type: 'string' },
          raw_text: { type: 'string' },
        },
        required: ['name', 'quantity', 'unit', 'category', 'raw_text'],
      },
    },
    substitutions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ingredient_name: { type: 'string' },
          replacement: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['ingredient_name', 'replacement', 'reason'],
      },
    },
  },
  required: [
    'recipe_name',
    'prep_infos',
    'macros_per_servings',
    'dietary_info',
    'ingredients',
    'substitutions',
  ],
};

export type ParseGroceriesResponse = z.output<
  typeof ParseGroceriesResponseSchema
>;
