import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { SupabaseGuard } from '../supabase-guard/supabase.guard';

describe('RecipesController', () => {
  let controller: RecipesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        {
          provide: RecipesService,
          useValue: { findRecipeWithIngredientsById: jest.fn() },
        },
      ],
    })
      .overrideGuard(SupabaseGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<RecipesController>(RecipesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
