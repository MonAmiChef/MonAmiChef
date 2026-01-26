import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const CalculateCaloriesRequestSchema = z.object({
  age: z.number().min(15).max(80),
  height: z
    .object({
      value: z.number(),
      unit: z.enum(['cm', 'inch']),
    })
    .describe('User height'),
  weight: z
    .object({
      value: z.number(),
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

const WeightFluctuationObject = z.object({
  macros: z.object({
    daily_calories: z.number(),
    daily_proteins: z.number(),
    daily_carbs: z.number(),
    daily_fiber: z.number(),
    daily_fat: z.number(),
  }),
  weight_impact: z.object({ text: z.string(), unit: z.enum(['kgs', 'lbs']) }),
});

export const CalculateCaloriesResponseSchema = z.object({
  bmr: z.number().describe('Basal Metabolic Rate (calories burned at rest)'),
  tdee: z
    .number()
    .describe('Total Daily Energy Expenditure (calories burned with activity)'),
  unit: z.string().default('kcal/day'),
  fluctuation: z.object({
    extreme_weight_loss: WeightFluctuationObject,
    moderate_weight_loss: WeightFluctuationObject,
    maintain_weight: WeightFluctuationObject,
    moderate_weight_gain: WeightFluctuationObject,
    extreme_weight_gain: WeightFluctuationObject,
  }),
});

export class CalculateCaloriesResponseDto extends createZodDto(
  CalculateCaloriesResponseSchema,
) {}

export type CalculateCaloriesResponse = z.output<
  typeof CalculateCaloriesResponseSchema
>;
