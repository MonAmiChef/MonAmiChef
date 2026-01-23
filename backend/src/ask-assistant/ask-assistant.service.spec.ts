import { Test, TestingModule } from '@nestjs/testing';
import { AskAssistantService } from './ask-assistant.service';
import { SubstituteService } from '../substitute/substitute.service';
import { GeneralAskService } from '../general-ask/general-ask.service';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import { ParseGroceriesService } from '../parse-groceries/parse-groceries.service';
import { RecipeCacheService } from '../recipe-cache/recipe-cache.service';

describe('AskAssistantService', () => {
  let askAssistantService: AskAssistantService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let recipeCacheService: jest.Mocked<RecipeCacheService>;
  let aiAssistantService: jest.Mocked<AiAssistantService>;

  const mockRecipeCacheService = {
    getCachedRecipe: jest.fn(),
    storeCacheRecipe: jest.fn().mockReturnValue(undefined),
  };

  const mockAiAssistantService = {
    inferIntent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AskAssistantService,
        SubstituteService,
        GeneralAskService,
        ParseGroceriesService,
        { provide: RecipeCacheService, useValue: mockRecipeCacheService },
        {
          provide: AiAssistantService,
          useValue: mockAiAssistantService,
        },
      ],
    }).compile();

    recipeCacheService = module.get(RecipeCacheService);
    askAssistantService = module.get(AskAssistantService);
    aiAssistantService = module.get(AiAssistantService);
  });

  it('should be defined', () => {
    expect(askAssistantService).toBeDefined();
  });

  it('should infer request type as PARSER', async () => {
    mockAiAssistantService.inferIntent.mockResolvedValue({ intent: 'PARSER' });

    const { intent } = await aiAssistantService.inferIntent({
      text: 'Sample text',
    });

    expect(intent).toBe('PARSER');
  });

  it('should infer request type as SUBSTITUTE', async () => {
    mockAiAssistantService.inferIntent.mockResolvedValue({
      intent: 'SUBSTITUTE',
    });

    const { intent } = await aiAssistantService.inferIntent({
      text: 'Sample text',
    });

    expect(intent).toBe('SUBSTITUTE');
  });

  it('should infer request type as GENERAL', async () => {
    mockAiAssistantService.inferIntent.mockResolvedValue({ intent: 'GENERAL' });

    const { intent } = await aiAssistantService.inferIntent({
      text: 'Sample text',
    });

    expect(intent).toBe('GENERAL');
  });
});
