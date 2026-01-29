import { Module } from '@nestjs/common';
import { ChatSessionsRepository } from './chat-sessions.repository';
import { ChatSessionsService } from './chat-sessions.service';
import { PrismaService } from '../prisma.service';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';

@Module({
  providers: [
    AiAssistantService,
    ChatSessionsRepository,
    ChatSessionsService,
    PrismaService,
  ],
  exports: [ChatSessionsService, ChatSessionsModule],
})
export class ChatSessionsModule {}
