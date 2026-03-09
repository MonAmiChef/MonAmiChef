import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const goalSchema = z.enum(['bulking', 'cutting', 'body_recomposition']);
const ingredientRestrictionSchema = z.enum([
  'gluten_free',
  'dairy_free',
  'peanut_free',
  'tree_nut_free',
  'shellfish_free',
  'egg_free',
  'soy_free',
]);
const dietRestrictionSchema = z.enum([
  'vegetarian',
  'vegan',
  'pescetarian',
  'keto',
  'paleo',
  'no_pork',
  'no_beef',
]);
const aversionSchema = z.enum([
  'no_cilantro',
  'no_onions',
  'no_garlic',
  'no_spicy_food',
  'no_mushrooms',
  'no_seafood',
]);

export const upsertUserPreferencesSchema = z.object({
  goal: goalSchema.nullable().optional(),
  ingredientRestrictions: z.array(ingredientRestrictionSchema).optional(),
  dietRestrictions: z.array(dietRestrictionSchema).optional(),
  aversions: z.array(aversionSchema).optional(),
});

export type UpsertUserPreferencesRequest = z.infer<
  typeof upsertUserPreferencesSchema
>;

export class UpsertUserPreferencesDto extends createZodDto(
  upsertUserPreferencesSchema,
) {}

export type GoalType = z.infer<typeof goalSchema>;
export type IngredientRestriction = z.infer<typeof ingredientRestrictionSchema>;
export type DietRestriction = z.infer<typeof dietRestrictionSchema>;
export type Aversion = z.infer<typeof aversionSchema>;

export type UpdateProfileRequest = UpsertUserPreferencesRequest;
