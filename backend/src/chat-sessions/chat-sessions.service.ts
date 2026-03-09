import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatSessionsRepository } from './chat-sessions.repository';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import {
  CreateChatSessionResponse,
  GetAllChatsSessionResponse,
  GetChatSessionResponse,
  UpdateChatSessionResponse,
} from './chat-sessions.dto';
import { PreferenceTag } from '@prisma/client';
import { ProfilePreferences } from './chat-sessions.dto';

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
    userId,
  }: {
    chatId: string;
    userId: string;
  }): Promise<GetChatSessionResponse> {
    const chat = await this.chatSessionsRepository.getChat({ chatId, userId });

    if (!chat) {
      throw new NotFoundException(`Failed to retrieve chat with id ${chatId}`);
    }

    return {
      id: chat.id,
      title: chat.title,
      preferences: chat.preferences,
      exclude: chat.exclude,
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
    preferences,
    exclude,
    fallbackLanguage,
    profilePreferences,
  }: {
    userId: string;
    message: string;
    preferences: PreferenceTag[];
    exclude: PreferenceTag[];
    fallbackLanguage: string;
    profilePreferences?: ProfilePreferences;
  }): Promise<CreateChatSessionResponse> {
    const {
      text,
      title,
      isRecipe: isResponseRecipe,
      ingredients,
      servings,
    } = await this.aiAssistantService.createChatWithTitle({
      message,
      preferences,
      exclude,
      fallbackLanguage,
      profilePreferences,
    });

    const chat = await this.chatSessionsRepository.createChat({
      title,
      userId,
      userMessage: message,
      modelResponse: text,
      preferences,
      exclude,
      isResponseRecipe,
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
        isRecipe: msg.isRecipe,
        role: msg.role.toLowerCase() as 'user' | 'model',
        createdAt: msg.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
      ingredients: isResponseRecipe ? ingredients : undefined,
      servings: isResponseRecipe ? servings : undefined,
    };
  }

  async updateChat({
    chatId,
    userId,
    message,
    preferences,
    exclude,
    language,
  }: {
    chatId: string;
    userId: string;
    message: string;
    preferences: PreferenceTag[];
    exclude: PreferenceTag[];
    language: string;
  }): Promise<UpdateChatSessionResponse> {
    const chat = await this.getChat({ chatId, userId });

    if (!chat) {
      throw new NotFoundException(`Chat ${chatId} non trouvé`);
    }

    const { text, isRecipe, ingredients, servings } =
      await this.aiAssistantService.updateChat({
        messages: chat.messages,
        newMessage: message,
        preferences,
        exclude,
        language,
      });

    const result = await this.chatSessionsRepository.updateChat({
      chatId,
      messages: [
        { content: message, role: 'user', isRecipe: false },
        { content: text, role: 'model', isRecipe },
      ],
      preferences,
      exclude,
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
      ingredients: isRecipe ? ingredients : undefined,
      servings: isRecipe ? servings : undefined,
    };
  }
}
