import { Test, TestingModule } from '@nestjs/testing';
import { CalculateCaloriesController } from './calculate-calories.controller';
import { CalculateCaloriesService } from './calculate-calories.service';

describe('CalculateCaloriesController', () => {
  let controller: CalculateCaloriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalculateCaloriesController],
      providers: [CalculateCaloriesService],
    }).compile();

    controller = module.get<CalculateCaloriesController>(
      CalculateCaloriesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
