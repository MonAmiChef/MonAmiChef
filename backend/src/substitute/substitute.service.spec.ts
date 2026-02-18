/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SubstituteService } from './substitute.service';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import { RecipeCacheService } from '../recipe-cache/recipe-cache.service';
import { RecipeCacheRepository } from '../recipe-cache/recipe-cache.repository';
import { PrismaService } from '../prisma.service';
import { HashingService } from '../hashing/hashing.service';

describe('SubstituteService', () => {
  let substituteService: SubstituteService;
  let recipeCacheService: jest.Mocked<RecipeCacheService>;

  const mockRecipeCacheService = {
    getCachedRecipe: jest.fn(),
    storeCacheRecipe: jest.fn().mockReturnValue(undefined),
  };

  const mockAiAssistanceService = {
    substituteIngredients: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashingService,
        SubstituteService,
        PrismaService,
        RecipeCacheRepository,
        { provide: RecipeCacheService, useValue: mockRecipeCacheService },
        { provide: AiAssistantService, useValue: mockAiAssistanceService },
      ],
    }).compile();

    substituteService = module.get(SubstituteService);
    recipeCacheService = module.get(RecipeCacheService);
  });

  it('should be defined', () => {
    expect(substituteService).toBeDefined();
  });

  it('should call storeCacheRecipe when substituting ingredients', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    recipeCacheService.storeCacheRecipe.mockResolvedValue({
      id: '123',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    recipeCacheService.getCachedRecipe.mockResolvedValue(null);

    await substituteService.substituteIngredients({ text: 'Sample text' });
    expect(recipeCacheService.storeCacheRecipe).toHaveBeenCalledTimes(1);
  });
});
