import { components } from '@/types/api';
import { Session } from '@supabase/supabase-js';

type GetRecipeResponse = components['schemas']['GetRecipeResponseDto_Output'];

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const recipeApi = {
  getRecipe: async (
    session: Session,
    recipeId: string,
  ): Promise<GetRecipeResponse> => {
    const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch recipe');
    return response.json() as Promise<GetRecipeResponse>;
  },
};
