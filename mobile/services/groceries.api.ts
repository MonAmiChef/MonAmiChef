import { Session } from '@supabase/supabase-js';

export interface MergedIngredient {
  name: string;
  totalQuantity: number;
  unit: string;
  category: string;
  recipes: string[];
  isBought: boolean;
  ingredientIds: string[];
  image: string | null;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const groceriesApi = {
  getUserGroceries: async (session: Session): Promise<MergedIngredient[]> => {
    const response = await fetch(`${API_URL}/groceries`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch groceries list');
    return await response.json();
  },

  toggleIngredientsStatus: async (
    session: Session,
    ingredientIds: string[],
    isBought: boolean,
  ): Promise<{ count: number }> => {
    const response = await fetch(`${API_URL}/groceries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        ingredientIds,
        isBought,
      }),
    });

    if (!response.ok) throw new Error('Failed to toggle ingredients status');
    return response.json() as Promise<{ count: number }>;
  },

  updateRecipeInGroceries: async (
    session: Session,
    recipeId: string,
    newState: boolean,
  ): Promise<void> => {
    const response = await fetch(`${API_URL}/groceries/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        recipeId,
        newState,
      }),
    });

    if (!response.ok) throw new Error('Failed to update recipe in groceries');
  },

  getGroceriesRecipes: async (
    session: Session,
  ): Promise<{ recipeId: string }[]> => {
    const response = await fetch(`${API_URL}/groceries/user-recipes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch saved recipes');
    return response.json() as Promise<{ recipeId: string }[]>;
  },
};
