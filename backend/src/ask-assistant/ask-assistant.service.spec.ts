import { Test, TestingModule } from '@nestjs/testing';
import { AskAssistantService } from './ask-assistant.service';
import { SubstituteService } from '../substitute/substitute.service';
import { GeneralAskService } from '../general-ask/general-ask.service';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import { ParseGroceriesService } from '../parse-groceries/parse-groceries.service';
import { RecipeCacheService } from '../recipe-cache/recipe-cache.service';
import { createFakeGroceryResponse } from '../utils/create-fake-grocery-response';

describe('AskAssistantService', () => {
  let service: AskAssistantService;

  const mockAiAssistantService = {
    inferIntent: jest.fn(),
  };

  const mockParseGroceriesService = {
    parseGroceries: jest.fn(),
  };

  const mockSubstituteService = {
    substituteIngredients: jest.fn(),
  };

  const mockGeneralAskService = {
    generalAsk: jest.fn(),
  };

  const mockRecipeCacheService = {
    getCachedRecipe: jest.fn(),
    storeCacheRecipe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AskAssistantService,
        { provide: AiAssistantService, useValue: mockAiAssistantService },
        { provide: ParseGroceriesService, useValue: mockParseGroceriesService },
        { provide: SubstituteService, useValue: mockSubstituteService },
        { provide: GeneralAskService, useValue: mockGeneralAskService },
        { provide: RecipeCacheService, useValue: mockRecipeCacheService },
      ],
    }).compile();

    service = module.get<AskAssistantService>(AskAssistantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('askAssistant', () => {
    it('should route to parseGroceries for PARSER intent', async () => {
      mockAiAssistantService.inferIntent.mockResolvedValue({
        intent: 'PARSER',
      });
      mockParseGroceriesService.parseGroceries.mockResolvedValue(
        createFakeGroceryResponse(),
      );

      const result = await service.askAssistant({ text: 'carrots' });

      expect(result).toEqual({
        intent: 'PARSER',
        data: createFakeGroceryResponse(),
      });
      expect(mockParseGroceriesService.parseGroceries).toHaveBeenCalledWith({
        text: 'carrots',
      });
    });

    it('should route to substituteIngredients for SUBSTITUTE intent', async () => {
      mockAiAssistantService.inferIntent.mockResolvedValue({
        intent: 'SUBSTITUTE',
      });
      mockSubstituteService.substituteIngredients.mockResolvedValue({
        summary_note: 'Note',
        substitutions: [
          {
            to_replace: 'milk',
            replacement: [
              {
                name: 'almond milk',
                quantity_unit: 'cup',
                explanation: 'dairy free',
                impact: 'neutral',
                impact_score: 5,
              },
            ],
          },
        ],
      });

      const result = await service.askAssistant({ text: 'milk' });

      expect(result.intent).toBe('SUBSTITUTE');
      expect(mockSubstituteService.substituteIngredients).toHaveBeenCalledWith({
        text: 'milk',
      });
    });

    it('should route to generalAsk for GENERAL intent', async () => {
      mockAiAssistantService.inferIntent.mockResolvedValue({
        intent: 'GENERAL',
      });
      mockGeneralAskService.generalAsk.mockResolvedValue({ answer: 'Answer' });

      const result = await service.askAssistant({ text: 'how?' });

      expect(result).toEqual({ intent: 'GENERAL', data: { answer: 'Answer' } });
      expect(mockGeneralAskService.generalAsk).toHaveBeenCalledWith({
        text: 'how?',
      });
    });

    it('should default to generalAsk for unknown intent', async () => {
      mockAiAssistantService.inferIntent.mockResolvedValue({
        intent: 'UNKNOWN',
      });
      mockGeneralAskService.generalAsk.mockResolvedValue({ answer: 'Answer' });

      const result = await service.askAssistant({ text: 'unknown' });

      expect(result).toEqual({ intent: 'GENERAL', data: { answer: 'Answer' } });
      expect(mockGeneralAskService.generalAsk).toHaveBeenCalledWith({
        text: 'unknown',
      });
    });
  });
});
