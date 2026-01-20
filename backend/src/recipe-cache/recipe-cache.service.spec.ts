/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RecipeCacheService } from './recipe-cache.service';
import { RecipeCacheRepository } from './recipe-cache.repository';
import { HashingService } from '../hashing/hashing.service';
import { createFakeGroceryResponse } from '../utils/create-fake-grocery-response';

describe('RecipeCacheService', () => {
  let recipeCacheService: RecipeCacheService;
  let recipeCacheRepository: jest.Mocked<RecipeCacheRepository>;

  const mockRecipeCacheRepository = {
    findByHash: jest.fn(),
    storeRecipe: jest.fn(),
    getAllCachedRecipes: jest.fn(),
    findRecipeByHash: jest.fn(),
  };

  const mockHashingService = {
    textToHash: jest.fn().mockReturnValue('hash_123'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeCacheService,
        { provide: RecipeCacheRepository, useValue: mockRecipeCacheRepository },
        { provide: HashingService, useValue: mockHashingService },
      ],
    }).compile();

    recipeCacheRepository = module.get(RecipeCacheRepository);
    recipeCacheService = module.get(RecipeCacheService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(recipeCacheService).toBeDefined();
  });

  it('should store non-existing recipe in cache', async () => {
    const fakeRecipe = createFakeGroceryResponse();

    recipeCacheRepository.findRecipeByHash.mockResolvedValue(null);

    await recipeCacheService.storeCacheRecipe({
      text: 'Some recipe text',
      aiResponseJson: fakeRecipe,
      type: 'extraction',
    });

    expect(recipeCacheRepository.storeRecipe).toHaveBeenCalledWith(
      expect.objectContaining({
        inputHash: 'hash_123',
        aiResponseJson: fakeRecipe,
        type: 'extraction',
      }),
    );
  });
});
