import { Test, TestingModule } from '@nestjs/testing';
import { GroceriesController } from './groceries.controller';
import { GroceriesService } from './groceries.service';
import { SupabaseGuard } from '../supabase-guard/supabase.guard';

describe('GroceriesController', () => {
  let controller: GroceriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroceriesController],
      providers: [
        {
          provide: GroceriesService,
          useValue: {
            addRemoveMealToGroceries: jest.fn(),
            getUserRecipesInGroceries: jest.fn(),
            getUserGroceries: jest.fn(),
            toggleIngredientsStatus: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(SupabaseGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<GroceriesController>(GroceriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
