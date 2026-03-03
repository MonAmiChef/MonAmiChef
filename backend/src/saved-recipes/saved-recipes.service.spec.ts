import { Test, TestingModule } from '@nestjs/testing';
import { SavedRecipesService } from './saved-recipes.service';
import { SavedRecipesRepository } from './saved-recipes.repository';
import { RecipesRepository } from '../recipes/recipes.repository';
import { RecipesService } from '../recipes/recipes.service';
import { UnsplashService } from '../unsplash/unsplash.service';

describe('SavedRecipesService', () => {
  let service: SavedRecipesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedRecipesService,
        {
          provide: SavedRecipesRepository,
          useValue: {
            getSavedRecipes: jest.fn(),
            removeFromSavedRecipes: jest.fn(),
          },
        },
        {
          provide: RecipesRepository,
          useValue: {
            findByMessageId: jest.fn(),
            addExistingRecipeToPlan: jest.fn(),
            createFullRecipeContext: jest.fn(),
          },
        },
        {
          provide: RecipesService,
          useValue: { parseRecipe: jest.fn() },
        },
        {
          provide: UnsplashService,
          useValue: { getImageByPrompt: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SavedRecipesService>(SavedRecipesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
