import { Module } from '@nestjs/common';
import { ChatSessionsRepository } from './chat-sessions.repository';
import { ChatSessionsService } from './chat-sessions.service';
import { PrismaService } from 'src/prisma.service';
import { AiAssistantService } from 'src/ai-assistant/ai-assistant.service';

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
