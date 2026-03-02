import { Session } from '@supabase/supabase-js';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const recipeApi = {
  getRecipe: async (session: Session, recipeId: string) => {
    const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch saved recipes');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await response.json();
  },
};
