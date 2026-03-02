import { components } from '@/types/api';
import { Session } from '@supabase/supabase-js';

type AddToSavedRecipesRequest =
  components['schemas']['AddToSavedRecipesRequestDto'];
type AddToSavedRecipesResponse =
  components['schemas']['AddToSavedRecipesResponseDto_Output'];

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const savedRecipesApi = {
  addToSavedRecipes: async (
    language: string,
    messageContent: string,
    messageId: string,
    session: Session,
  ): Promise<AddToSavedRecipesResponse> => {
    const body: AddToSavedRecipesRequest = {
      messageContent,
      messageId,
      language,
    };
    const response = await fetch(`${API_URL}/saved-recipes/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error('Failed to add to saved recipes');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await response.json();
  },

  removeFromSavedRecipes: async (session: Session, recipeId: string) => {
    const response = await fetch(`${API_URL}/saved-recipes/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        recipeId,
      }),
    });

    if (!response.ok) throw new Error('Failed to remove from saved recipes');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await response.json();
  },

  addToGroceries: async (
    session: Session,
    recipeId: string,
    newState: boolean,
  ) => {
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

    if (!response.ok) throw new Error('Failed to add recipe to groceries');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await response.json();
  },

  getSavedRecipes: async (session: Session) => {
    const response = await fetch(`${API_URL}/saved-recipes`, {
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

  getGroceriesRecipes: async (session: Session) => {
    const response = await fetch(`${API_URL}/groceries/user-recipes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch recipes in groceries');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await response.json();
  },
};
