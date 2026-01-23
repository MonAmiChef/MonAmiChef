import { Test, TestingModule } from '@nestjs/testing';
import { GeneralAskService } from './general-ask.service';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';

describe('GeneralAskService', () => {
  let generalAskService: GeneralAskService;

  const mockAiAssistantService = {
    inferIntent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneralAskService,
        {
          provide: AiAssistantService,
          useValue: mockAiAssistantService,
        },
      ],
    }).compile();

    generalAskService = module.get<GeneralAskService>(GeneralAskService);
  });

  it('should be defined', () => {
    expect(generalAskService).toBeDefined();
  });
});
