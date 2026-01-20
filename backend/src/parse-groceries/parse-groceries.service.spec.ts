/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ParseGroceriesService } from './parse-groceries.service';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import { RecipeCacheService } from '../recipe-cache/recipe-cache.service';
import { HashingService } from '../hashing/hashing.service';
import { PrismaService } from '../prisma.service';
import { RecipeCacheRepository } from '../recipe-cache/recipe-cache.repository';

describe('ParseGroceriesService', () => {
  let parserService: ParseGroceriesService;
  let recipeCacheService: jest.Mocked<RecipeCacheService>;

  const mockRecipeCacheService = {
    getCachedRecipe: jest.fn(),
    storeCacheRecipe: jest.fn().mockReturnValue(undefined),
  };

  const mockAiAssistantService = {
    parseGroceries: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AiAssistantService, useValue: mockAiAssistantService },
        { provide: RecipeCacheService, useValue: mockRecipeCacheService },
        ParseGroceriesService,
        RecipeCacheRepository,
        HashingService,
        PrismaService,
      ],
    }).compile();

    parserService = module.get(ParseGroceriesService);
    recipeCacheService = module.get(RecipeCacheService);
  });

  it('should be defined', () => {
    expect(parserService).toBeDefined();
  });

  it('should call storeCacheRecipe when parsing groceries', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    recipeCacheService.storeCacheRecipe.mockResolvedValue({
      id: '123',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    recipeCacheService.getCachedRecipe.mockResolvedValue(null);

    await parserService.parseGroceries({ text: 'Sample grocery text' });
    expect(recipeCacheService.storeCacheRecipe).toHaveBeenCalledTimes(1);
  });
});
