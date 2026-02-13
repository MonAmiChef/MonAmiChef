import { components } from '@/types/api';
import { Session } from '@supabase/supabase-js';

type AddMealRequest = components['schemas']['AddMealToPlanRequestDto'];
type AddMealResponse = components['schemas']['AddMealToPlanResponseDto_Output'];

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const mealPlanApi = {
  addMealToPlan: async (
    language: string,
    messageContent: string,
    messageId: string,
    session: Session,
  ): Promise<AddMealResponse> => {
    const body: AddMealRequest = { messageContent, messageId, language };
    const response = await fetch(`${API_URL}/meal-plan/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error('Failed to add meal to plan');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await response.json();
  },

  removeFromMealPlan: async (session: Session, recipeId: string) => {
    const response = await fetch(`${API_URL}/meal-plan/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        recipeId,
      }),
    });

    if (!response.ok) throw new Error('Failed to remove meal from plan');
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

  getMealPlan: async (session: Session) => {
    const response = await fetch(`${API_URL}/meal-plan`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch meal plan');
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
