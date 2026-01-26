import { Injectable } from '@nestjs/common';
import {
  CalculateCaloriesRequestDto,
  CalculateCaloriesResponse,
} from './calculate-calories.dto';

@Injectable()
export class CalculateCaloriesService {
  calculateCalories(
    userInfos: CalculateCaloriesRequestDto,
  ): CalculateCaloriesResponse {
    const weightInKg =
      userInfos.weight.unit === 'lbs'
        ? userInfos.weight.value * 0.453592
        : userInfos.weight.value;
    const heightInCm =
      userInfos.height.unit === 'inch'
        ? userInfos.height.value * 2.54
        : userInfos.height.value;

    const genderOffset = userInfos.gender === 'male' ? 5 : -161;
    const bmr =
      10 * weightInKg + 6.25 * heightInCm - 5 * userInfos.age + genderOffset;

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      'very active': 1.8,
      'extra active': 1.9,
    };
    const tdee = bmr * activityMultipliers[userInfos.physical_activity];

    const generatePlan = (calories: number, weight: number) => {
      const daily_calories = Math.round(calories);
      const daily_proteins = Math.round(weight * 2);
      const daily_fat = Math.round((calories * 0.25) / 9);
      const daily_carbs = Math.round(
        (calories - daily_proteins * 4 - daily_fat * 9) / 4,
      );
      const daily_fiber = Math.round((calories / 1000) * 14);

      return {
        daily_calories,
        daily_proteins,
        daily_carbs,
        daily_fat,
        daily_fiber,
      };
    };

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      unit: 'kcal/day',
      fluctuation: {
        extreme_weight_loss: {
          macros: generatePlan(tdee - 1000, weightInKg),
          weight_impact:
            userInfos.weight.unit === 'lbs'
              ? { text: '-2.2 lbs per week', unit: 'lbs' }
              : { text: '-1kg per week', unit: 'kgs' },
        },
        moderate_weight_loss: {
          macros: generatePlan(tdee - 500, weightInKg),
          weight_impact:
            userInfos.weight.unit === 'lbs'
              ? { text: '-1.1 lbs per week', unit: 'lbs' }
              : {
                  text: '-0.5kg per week',
                  unit: 'kgs',
                },
        },
        maintain_weight: {
          macros: generatePlan(tdee, weightInKg),
          weight_impact:
            userInfos.weight.unit === 'lbs'
              ? { text: 'Maintain weight', unit: 'lbs' }
              : { text: 'Maintain weight', unit: 'kgs' },
        },
        moderate_weight_gain: {
          macros: generatePlan(tdee + 300, weightInKg),
          weight_impact:
            userInfos.weight.unit === 'lbs'
              ? { text: '+1.1 lbs per week', unit: 'lbs' }
              : { text: '+0.5kg per week', unit: 'kgs' },
        },
        extreme_weight_gain: {
          macros: generatePlan(tdee + 700, weightInKg),
          weight_impact:
            userInfos.weight.unit === 'lbs'
              ? { text: '+2.2 lbs per week', unit: 'lbs' }
              : { text: '+1kg per week', unit: 'kgs' },
        },
      },
    };
  }
}
