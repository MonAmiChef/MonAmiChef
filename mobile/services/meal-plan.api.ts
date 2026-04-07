import { Session } from '@supabase/supabase-js';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export interface MealPlanEntry {
  id: string;
  userId: string;
  recipeId: string;
  date: string;
  mealType: MealType;
  servings: number;
  createdAt: string;
  updatedAt: string;
  recipe: {
    id: string;
    name: string;
    description: string | null;
    prepTimeMin: number | null;
    difficulty: string | null;
    calories: number | null;
    proteins: number | null;
    carbs: number | null;
    fat: number | null;
    fibers: number | null;
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
    imagePath: string | null;
  };
}

export interface CreateMealPlanEntryInput {
  recipeId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  servings: number;
}

export const mealPlanApi = {
  getMealPlan: async (
    session: Session,
    params: { date?: string; startDate?: string; endDate?: string },
  ): Promise<MealPlanEntry[]> => {
    const { date, startDate, endDate } = params;
    let url = `${API_URL}/meal-plans`;

    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    } else if (date) {
      url += `?date=${date}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch meal plan');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await response.json();
  },

  createEntries: async (
    session: Session,
    entries: CreateMealPlanEntryInput[],
  ): Promise<MealPlanEntry[]> => {
    const response = await fetch(`${API_URL}/meal-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ entries }),
    });

    if (!response.ok) throw new Error('Failed to create meal plan entries');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await response.json();
  },

  deleteEntry: async (session: Session, id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/meal-plans/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to delete meal plan entry');
  },

  updateServings: async (
    session: Session,
    id: string,
    servings: number,
  ): Promise<void> => {
    const response = await fetch(
      `${API_URL}/meal-plans/${id}/servings`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ servings }),
      },
    );

    if (!response.ok) throw new Error('Failed to update servings');
  },
};
