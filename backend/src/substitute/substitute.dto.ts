import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const SubstituteIngredientsRequestSchema = z.object({
  text: z
    .string()
    .min(1)
    .describe(
      'The user input text of ingredients to substitute + possible context',
    ),
});

export class SubstituteIngredientsRequestDto extends createZodDto(
  SubstituteIngredientsRequestSchema,
) {}

export const SubstituteIngredientsResponseSchema = z.object({
  optional_detected_context: z
    .string()
    .optional()
    .describe('Optional detected context, eg: Curry chicken'),

  summary_note: z
    .string()
    .describe('Summary note of the substitutions response from the ai'),

  substitutions: z
    .array(
      z.object({
        to_replace: z.string().describe('The ingredient to replace'),
        replacement: z.array(
          z.object({
            name: z.string().describe('The replacement ingredient'),
            quantity: z
              .number()
              .optional()
              .describe('The quantity of the replacement'),
            quantity_unit: z.string(),
            explanation: z.string().describe('The reason of the replacement'),
            impact: z.string().describe('The impact of the replacement'),
            impact_score: z
              .number()
              .min(1)
              .max(5)
              .describe(
                'The impact score on the dish taste of the replacemant',
              ),
          }),
        ),
      }),
    )
    .min(1),
});

export const SubstituteIngredientsResponseJson = {
  type: 'object',
  properties: {
    optional_detected_context: { type: 'string' },
    summary_note: { type: 'string' },
    substitutions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          to_replace: { type: 'string' },
          replacement: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                quantity: { type: 'number' },
                quantity_unit: { type: 'string' },
                explanation: { type: 'string' },
                impact: { type: 'string' },
                impact_score: { type: 'number' },
              },
              required: [
                'name',
                'quantity',
                'quantity_unit',
                'explanation',
                'impact',
                'impact_score',
              ],
            },
          },
        },
        required: ['to_replace', 'replacement'],
      },
    },
  },
  required: ['summary_note', 'substitutions'],
};

export class SubstituteIngredientsResponseDto extends createZodDto(
  SubstituteIngredientsResponseSchema,
) {}

export type SubstituteIngredientsResponse = z.output<
  typeof SubstituteIngredientsResponseSchema
>;
