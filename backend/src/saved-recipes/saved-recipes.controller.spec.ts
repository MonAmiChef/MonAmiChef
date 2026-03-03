import { Test, TestingModule } from '@nestjs/testing';
import { SavedRecipesController } from './saved-recipes.controller';
import { SavedRecipesService } from './saved-recipes.service';
import { SupabaseGuard } from '../supabase-guard/supabase.guard';

describe('SavedRecipesController', () => {
  let controller: SavedRecipesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedRecipesController],
      providers: [
        {
          provide: SavedRecipesService,
          useValue: {
            getSavedRecipes: jest.fn(),
            removeFromSavedRecipes: jest.fn(),
            addToSavedRecipes: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(SupabaseGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<SavedRecipesController>(SavedRecipesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
