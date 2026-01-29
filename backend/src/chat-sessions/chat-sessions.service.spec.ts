import { Test, TestingModule } from '@nestjs/testing';
import { ChatSessionsService } from './chat-sessions.service';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import { ChatSessionsRepository } from './chat-sessions.repository';
import { PrismaService } from '../prisma.service';

describe('ChatSessionsService', () => {
  let service: ChatSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        ChatSessionsService,
        ChatSessionsRepository,
        AiAssistantService,
      ],
    }).compile();

    service = module.get<ChatSessionsService>(ChatSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
