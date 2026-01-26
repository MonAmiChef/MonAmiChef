import { Test, TestingModule } from '@nestjs/testing';
import { CalculateCaloriesService } from './calculate-calories.service';
import { CalculateCaloriesRequestDto } from './calculate-calories.dto';

describe('CalculateCaloriesService', () => {
  let service: CalculateCaloriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalculateCaloriesService],
    }).compile();

    service = module.get<CalculateCaloriesService>(CalculateCaloriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCalories', () => {
    it('should calculate correct values for a standard metric male profile', () => {
      const mockUser: CalculateCaloriesRequestDto = {
        age: 24,
        gender: 'male',
        height: { value: 180, unit: 'cm' },
        weight: { value: 75, unit: 'kgs' },
        physical_activity: 'active',
      };

      const result = service.calculateCalories(mockUser);

      expect(result.bmr).toBeCloseTo(1760, -1);
      expect(result.tdee).toBeCloseTo(3036, -1);

      expect(result.fluctuation.maintain_weight.macros.daily_proteins).toBe(
        150,
      );
      expect(result.fluctuation.maintain_weight.weight_impact.text).toContain(
        'Maintain weight',
      );
    });

    it('should correctly convert imperial units to metric before calculating', () => {
      const imperialUser: CalculateCaloriesRequestDto = {
        age: 30,
        gender: 'female',
        height: { value: 65, unit: 'inch' },
        weight: { value: 160, unit: 'lbs' },
        physical_activity: 'sedentary',
      };

      const result = service.calculateCalories(imperialUser);

      expect(result.bmr).toBeGreaterThan(1400);
      expect(result.bmr).toBeLessThan(1500);
    });

    it('should have consistent calorie scaling across fluctuations', () => {
      const mockUser: CalculateCaloriesRequestDto = {
        age: 25,
        gender: 'male',
        height: { value: 180, unit: 'cm' },
        weight: { value: 80, unit: 'kgs' },
        physical_activity: 'moderate',
      };

      const result = service.calculateCalories(mockUser);
      const { fluctuation } = result;

      expect(
        fluctuation.extreme_weight_loss.macros.daily_calories,
      ).toBeLessThan(fluctuation.moderate_weight_loss.macros.daily_calories);

      expect(
        fluctuation.extreme_weight_gain.macros.daily_calories,
      ).toBeGreaterThan(fluctuation.moderate_weight_gain.macros.daily_calories);
    });

    it('should calculate fiber based on calorie intake', () => {
      const mockUser: CalculateCaloriesRequestDto = {
        age: 24,
        gender: 'male',
        height: { value: 180, unit: 'cm' },
        weight: { value: 75, unit: 'kgs' },
        physical_activity: 'sedentary',
      };

      const result = service.calculateCalories(mockUser);
      const calories = result.fluctuation.maintain_weight.macros.daily_calories;
      const expectedFiber = Math.round((calories / 1000) * 14);
      expect(result.fluctuation.maintain_weight.macros.daily_fiber).toBe(
        expectedFiber,
      );
    });
  });
});
