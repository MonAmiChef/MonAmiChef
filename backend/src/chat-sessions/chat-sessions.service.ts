import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatSessionsRepository } from './chat-sessions.repository';
import { MessageRole } from '@prisma/client';
import { AiAssistantService } from 'src/ai-assistant/ai-assistant.service';
import {
  CreateChatSessionResponse,
  GetAllChatsSessionResponse,
  GetChatSessionResponse,
  UpdateChatSessionResponse,
} from './chat-sessions.dto';

@Injectable()
export class ChatSessionsService {
  constructor(
    private chatSessionsRepository: ChatSessionsRepository,
    private aiAssistantService: AiAssistantService,
  ) {}

  async getAllUserChats({
    userId,
  }: {
    userId: string;
  }): Promise<GetAllChatsSessionResponse> {
    const chats = await this.chatSessionsRepository.getAllUserChats({ userId });

    return chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    }));
  }

  async getChat({
    chatId,
  }: {
    chatId: string;
  }): Promise<GetChatSessionResponse> {
    const chat = await this.chatSessionsRepository.getChat({ chatId });

    if (!chat) {
      throw new NotFoundException(`Failed to retrieve chat with id ${chatId}`);
    }

    const createdAt = new Date();

    return {
      id: chat.id,
      name: 'Test',
      messages: chat.messages,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };
  }

  async createChat({
    userId,
    message,
  }: {
    userId: string;
    message: string;
  }): Promise<CreateChatSessionResponse> {
    const modelResponse = await this.aiAssistantService.chat({
      messages: [],
      newMessage: message,
    });

    const chat = await this.chatSessionsRepository.createChat({
      userId,
      message,
    });

    const updatedChat = await this.chatSessionsRepository.updateChat({
      id: chat.id,
      message: modelResponse ?? '',
      role: 'model',
    });

    return {
      id: chat.id,
      name: 'Test',
      messages: updatedChat?.messages ?? [],
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    };
  }

  async updateChat({
    chatId,
    message,
    role,
  }: {
    chatId: string;
    message: string;
    role: MessageRole;
  }): Promise<UpdateChatSessionResponse> {
    const chat = await this.getChat({ chatId });
    const modelResponse = await this.aiAssistantService.chat({
      messages: chat?.messages ?? [],
      newMessage: message,
    });

    await this.chatSessionsRepository.updateChat({
      id: chatId,
      message,
      role,
    });
    const updatedChat = await this.chatSessionsRepository.updateChat({
      id: chatId,
      message: modelResponse ?? '',
      role,
    });

    return {
      id: chat.id,
      name: 'Test',
      messages: updatedChat?.messages ?? [],
      createdAt: updatedChat?.createdAt.toISOString() ?? '',
      updatedAt: updatedChat?.updatedAt.toISOString() ?? '',
    };
  }
}
