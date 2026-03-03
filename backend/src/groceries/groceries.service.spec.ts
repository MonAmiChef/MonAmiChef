import { Test, TestingModule } from '@nestjs/testing';
import { GroceriesService } from './groceries.service';
import { GroceriesRepository } from './groceries.repository';

describe('GroceriesService', () => {
  let service: GroceriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroceriesService,
        {
          provide: GroceriesRepository,
          useValue: {
            addRemoveMealToGroceries: jest.fn(),
            getUserRecipesInGroceries: jest.fn(),
            getUserGroceries: jest.fn(),
            toggleIngredientsStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GroceriesService>(GroceriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
