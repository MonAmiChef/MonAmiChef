import { Test, TestingModule } from '@nestjs/testing';
import { AskAssistantService } from './ask-assistant.service';

describe('AskAssistantService', () => {
  let service: AskAssistantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AskAssistantService],
    }).compile();

    service = module.get<AskAssistantService>(AskAssistantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
