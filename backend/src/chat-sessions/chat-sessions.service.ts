import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatSessionsRepository } from './chat-sessions.repository';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
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

    return {
      chats: chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt?.toISOString() ?? new Date().toISOString(),
      })),
    };
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

    return {
      id: chat.id,
      title: chat.title,
      messages: chat.messages.map((msg) => ({
        ...msg,
        createdAt: msg.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt?.toISOString() ?? chat.createdAt.toISOString(),
    };
  }

  async createChat({
    userId,
    message,
  }: {
    userId: string;
    message: string;
  }): Promise<CreateChatSessionResponse> {
    const { text, title } = await this.aiAssistantService.createChatWithTitle({
      message,
    });

    const chat = await this.chatSessionsRepository.createChat({
      title,
      userId,
      userMessage: message,
      modelResponse: text,
    });

    return {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt?.toISOString() ?? chat.createdAt.toISOString(),

      messages: chat.messages.map((msg) => ({
        id: msg.id,
        chatId: msg.chatId,
        content: msg.content,
        role: msg.role.toLowerCase() as 'user' | 'model',
        createdAt: msg.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
    };
  }

  async updateChat({
    chatId,
    message,
  }: {
    chatId: string;
    message: string;
  }): Promise<UpdateChatSessionResponse> {
    const chat = await this.getChat({ chatId });

    if (!chat) {
      throw new NotFoundException(`Chat ${chatId} non trouvé`);
    }

    const { text } = await this.aiAssistantService.updateChat({
      messages: chat.messages,
      newMessage: message,
    });

    const result = await this.chatSessionsRepository.updateChat({
      chatId,
      messages: [
        { content: message, role: 'user' },
        { content: text, role: 'model' },
      ],
    });

    return {
      id: chat.id,
      title: chat.title,
      messages: (result?.messages ?? []).map((msg) => ({
        ...msg,
        createdAt: msg.createdAt?.toISOString() ?? new Date().toISOString(),
        role: msg.role as 'user' | 'model',
      })),
      createdAt: chat?.createdAt ?? new Date().toISOString(),
      updatedAt: chat?.updatedAt ?? new Date().toISOString(),
    };
  }
}
