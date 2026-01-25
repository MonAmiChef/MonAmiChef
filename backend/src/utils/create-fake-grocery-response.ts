import { ParseGroceriesResponse } from '../parse-groceries/parse-groceries.dto';

export const createFakeGroceryResponse = (
  overrides: Partial<ParseGroceriesResponse> = {},
): ParseGroceriesResponse => ({
  recipe_name: 'Test Recipe',
  prep_infos: {
    prep_time_min: 15,
    servings: 2,
    difficulty: 'Easy',
  },
  macros_per_servings: {
    calories: 300,
    proteins: 20,
    carbs: 40,
    fat: 10,
    fibers: 5,
  },
  dietary_info: {
    vegetarian: true,
    dairy_free: true,
    vegan: false,
    gluten_free: true,
  },
  ingredients: [
    {
      name: 'Carrot',
      quantity: 2,
      unit: 'pieces',
      category: 'Vegetables',
      raw_text: '2 big organic carrots',
    },
  ],
  substitutions: [],
  ...overrides,
});
