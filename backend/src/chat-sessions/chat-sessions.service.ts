import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatSessionsRepository } from './chat-sessions.repository';
import { Message, MessageRole } from '@prisma/client';
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

    const createdAt = new Date();

    return {
      id: chat.id,
      title: chat.title,
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
    const { text, title } = await this.aiAssistantService.chat({
      messages: [],
      newMessage: message,
    });

    const chat = await this.chatSessionsRepository.createChat({
      title,
      userId,
      message,
    });

    const updatedChat = await this.chatSessionsRepository.updateChat({
      id: chat.id,
      message: text ?? '',
      role: 'model',
    });

    return {
      id: chat.id,
      title,
      messages: updatedChat?.messages ?? [],
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt?.toISOString() ?? new Date().toISOString(),
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
    const { text } = await this.aiAssistantService.chat({
      messages: (chat?.messages as Message[]) ?? [],
      newMessage: message,
    });

    await this.chatSessionsRepository.updateChat({
      id: chatId,
      message,
      role,
    });
    const updatedChat = await this.chatSessionsRepository.updateChat({
      id: chatId,
      message: text ?? '',
      role: 'model',
    });

    return {
      id: chat.id,
      title: chat.title,
      messages: updatedChat?.messages ?? [],
      createdAt:
        updatedChat?.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt:
        updatedChat?.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
