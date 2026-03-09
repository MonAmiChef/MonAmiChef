import { Session } from '@supabase/supabase-js';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type GoalType = 'bulking' | 'cutting' | 'body_recomposition';
export type IngredientRestriction =
  | 'gluten_free'
  | 'dairy_free'
  | 'peanut_free'
  | 'tree_nut_free'
  | 'shellfish_free'
  | 'egg_free'
  | 'soy_free';
export type DietRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'pescetarian'
  | 'keto'
  | 'paleo'
  | 'no_pork'
  | 'no_beef';
export type Aversion =
  | 'no_cilantro'
  | 'no_onions'
  | 'no_garlic'
  | 'no_spicy_food'
  | 'no_mushrooms'
  | 'no_seafood';

export interface UserPreferences {
  id: string;
  userId: string;
  goal: GoalType | null;
  ingredientRestrictions: IngredientRestriction[];
  dietRestrictions: DietRestriction[];
  aversions: Aversion[];
}

export interface UpsertUserPreferencesData {
  goal?: GoalType | null;
  ingredientRestrictions?: IngredientRestriction[];
  dietRestrictions?: DietRestriction[];
  aversions?: Aversion[];
}

export const getUserPreferences = async (
  session: Session,
): Promise<UserPreferences | null> => {
  const response = await fetch(`${API_URL}/user-preferences`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch user preferences');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await response.json();
};

export const upsertUserPreferences = async (
  session: Session,
  data: UpsertUserPreferencesData,
): Promise<UserPreferences> => {
  const response = await fetch(`${API_URL}/user-preferences`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to upsert user preferences');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await response.json();
};
