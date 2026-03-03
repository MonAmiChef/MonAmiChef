import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import { RecipesRepository } from './recipes.repository';

describe('RecipesService', () => {
  let service: RecipesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: AiAssistantService,
          useValue: { parseRecipe: jest.fn() },
        },
        {
          provide: RecipesRepository,
          useValue: { findRecipeWithIngredientsById: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
