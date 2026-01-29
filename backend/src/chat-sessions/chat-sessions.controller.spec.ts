import { Test, TestingModule } from '@nestjs/testing';
import { ChatSessionsController } from './chat-sessions.controller';
import { ChatSessionsService } from './chat-sessions.service';
import { ChatSessionsRepository } from './chat-sessions.repository';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import { PrismaService } from '../prisma.service';

describe('ChatSessionsController', () => {
  let controller: ChatSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatSessionsController],
      providers: [
        PrismaService,
        ChatSessionsService,
        ChatSessionsRepository,
        AiAssistantService,
      ],
    }).compile();

    controller = module.get<ChatSessionsController>(ChatSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
