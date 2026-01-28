import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const CalculateCaloriesRequestSchema = z.object({
  age: z.number().min(15).max(80),
  height: z
    .object({
      value: z.number().min(50),
      unit: z.enum(['cm', 'inch']),
    })
    .describe('User height'),
  weight: z
    .object({
      value: z.number().min(20),
      unit: z.enum(['kgs', 'lbs']),
    })
    .describe('User weight'),
  gender: z.enum(['male', 'female']).describe('User gender'),
  physical_activity: z
    .enum([
      'sedentary',
      'light',
      'moderate',
      'active',
      'very active',
      'extra active',
    ])
    .describe('User daily physical activity'),
});

export class CalculateCaloriesRequestDto extends createZodDto(
  CalculateCaloriesRequestSchema,
) {}

const MacrosSchema = z.object({
  calories: z.number().int().positive(),
  proteins: z.number().positive(),
  carbs: z.number().positive(),
  fiber: z.number().nonnegative(),
  fat: z.number().positive(),
});

const WeightFluctuationSchema = z.object({
  daily_macros: MacrosSchema,
  weight_impact: z.object({
    text: z.string(),
    value: z.number(),
    unit: z.enum(['kgs', 'lbs']),
  }),
});

export const CalculateCaloriesResponseSchema = z.object({
  bmr: z.number().describe('Basal Metabolic Rate (calories burned at rest)'),
  tdee: z
    .number()
    .describe('Total Daily Energy Expenditure (calories burned with activity)'),
  unit: z.literal('kcal/day'),
  fluctuation: z.record(z.string(), WeightFluctuationSchema),
});

export class CalculateCaloriesResponseDto extends createZodDto(
  CalculateCaloriesResponseSchema,
) {}

export type CalculateCaloriesResponse = z.output<
  typeof CalculateCaloriesResponseSchema
>;
