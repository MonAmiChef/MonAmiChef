import { Injectable } from '@nestjs/common';
import {
  CalculateCaloriesRequestDto,
  CalculateCaloriesResponse,
} from './calculate-calories.dto';

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  'very active': 1.8,
  'extra active': 1.9,
};

@Injectable()
export class CalculateCaloriesService {
  calculateCalories(
    userInfos: CalculateCaloriesRequestDto,
  ): CalculateCaloriesResponse {
    const { weight, height, age, gender, physical_activity } = userInfos;

    const weightInKg =
      weight.unit === 'lbs' ? weight.value * 0.453592 : weight.value;
    const heightInCm =
      height.unit === 'inch' ? height.value * 2.54 : height.value;

    const genderOffset = gender === 'male' ? 5 : -161;
    const bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + genderOffset;
    const tdee = bmr * ACTIVITY_MULTIPLIERS[physical_activity];

    const createPlan = (
      targetCalories: number,
      impactText: string,
      impactValue: number,
    ) => ({
      daily_macros: this.generateMacros(targetCalories, weightInKg),
      weight_impact: {
        text: impactText,
        value: impactValue,
        unit: weight.unit,
      },
    });

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      unit: 'kcal/day',
      fluctuation: {
        extreme_weight_loss: createPlan(
          tdee - 1000,
          weight.unit === 'lbs' ? '-2.2 lbs/week' : '-1kg/week',
          1,
        ),
        moderate_weight_loss: createPlan(
          tdee - 500,
          weight.unit === 'lbs' ? '-1.1 lbs/week' : '-0.5kg/week',
          0.5,
        ),
        maintain_weight: createPlan(tdee, 'Maintain weight', 0),
        moderate_weight_gain: createPlan(
          tdee + 300,
          weight.unit === 'lbs' ? '+1.1 lbs/week' : '+0.5kg/week',
          0.5,
        ),
        extreme_weight_gain: createPlan(
          tdee + 700,
          weight.unit === 'lbs' ? '+2.2 lbs/week' : '+1kg/week',
          1,
        ),
      },
    };
  }

  private generateMacros(targetCalories: number, weightInKg: number) {
    const calories = Math.round(targetCalories);
    const proteins = Math.round(weightInKg * 2);
    const fat = Math.round((calories * 0.25) / 9);
    const carbs = Math.round((calories - proteins * 4 - fat * 9) / 4);
    const fiber = Math.round((calories / 1000) * 14);

    return {
      calories,
      proteins,
      carbs,
      fat,
      fiber,
    };
  }
}
