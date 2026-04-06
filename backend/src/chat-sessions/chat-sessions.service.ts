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
        preferences: chat.preferences,
        exclude: chat.exclude,
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
        role: msg.role.toLowerCase() as 'user' | 'model',
        createdAt: msg.createdAt?.toISOString() ?? new Date().toISOString(),
        // Map linked recipe data if it exists
        calories: msg.Recipe?.calories ?? 0,
        proteins: msg.Recipe?.proteins ?? 0,
        carbs: msg.Recipe?.carbs ?? 0,
        fat: msg.Recipe?.fat ?? 0,
        prepTime: msg.Recipe?.prepTimeMin ?? 0,
        title: msg.Recipe?.name,
        description: msg.Recipe?.description,
        instructions: msg.Recipe?.instructions ?? [],
        difficulty: msg.Recipe?.difficulty,
        isVegetarian: msg.Recipe?.isVegetarian ?? false,
        isVegan: msg.Recipe?.isVegan ?? false,
        isGlutenFree: msg.Recipe?.isGlutenFree ?? false,
        isDairyFree: msg.Recipe?.isDairyFree ?? false,
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
      isRecipe,
      ingredients,
      servings,
      calories,
      proteins,
      carbs,
      fat,
      prepTime,
      recipeName,
      description,
      instructions,
      difficulty,
      isVegetarian,
      isVegan,
      isGlutenFree,
      isDairyFree,
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
      isResponseRecipe: isRecipe,
      recipeData: isRecipe
        ? {
            ingredients,
            servings,
            calories,
            proteins,
            carbs,
            fat,
            prepTime,
            title: recipeName || title,
            description,
            instructions: instructions ?? [],
            difficulty,
            isVegetarian,
            isVegan,
            isGlutenFree,
            isDairyFree,
          }
        : undefined,
    });

    return {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt?.toISOString() ?? chat.createdAt.toISOString(),
      recipeName: isRecipe ? (recipeName || title) : "",
      ingredients: isRecipe ? ingredients : [],
      servings: isRecipe ? servings : 1,
      calories: isRecipe ? calories : 0,
      proteins: isRecipe ? proteins : 0,
      carbs: isRecipe ? carbs : 0,
      fat: isRecipe ? fat : 0,
      prepTime: isRecipe ? prepTime : 0,
      messages: chat.messages.map((msg) => ({
        id: msg.id,
        chatId: msg.chatId,
        content: msg.content,
        isRecipe: msg.isRecipe,
        role: msg.role.toLowerCase() as 'user' | 'model',
        createdAt: msg.createdAt?.toISOString() ?? new Date().toISOString(),
        calories: msg.Recipe?.calories ?? 0,
        proteins: msg.Recipe?.proteins ?? 0,
        carbs: msg.Recipe?.carbs ?? 0,
        fat: msg.Recipe?.fat ?? 0,
        prepTime: msg.Recipe?.prepTimeMin ?? 0,
        title: msg.Recipe?.name,
        description: msg.Recipe?.description,
        instructions: msg.Recipe?.instructions ?? [],
        difficulty: msg.Recipe?.difficulty,
        isVegetarian: msg.Recipe?.isVegetarian ?? false,
        isVegan: msg.Recipe?.isVegan ?? false,
        isGlutenFree: msg.Recipe?.isGlutenFree ?? false,
        isDairyFree: msg.Recipe?.isDairyFree ?? false,
      })),
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

    const {
      text,
      isRecipe,
      ingredients,
      servings,
      calories,
      proteins,
      carbs,
      fat,
      prepTime,
      recipeName,
      description,
      instructions,
      difficulty,
      isVegetarian,
      isVegan,
      isGlutenFree,
      isDairyFree,
    } = await this.aiAssistantService.updateChat({
      messages: chat.messages.map((m) => ({
        role: m.role,
        content: m.content,
        isRecipe: m.isRecipe,
      })),
      newMessage: message,
      preferences,
      exclude,
      language,
    });

    const result = await this.chatSessionsRepository.updateChat({
      chatId,
      userId,
      messages: [
        { content: message, role: 'user', isRecipe: false },
        {
          content: text,
          role: 'model',
          isRecipe,
          recipeData: isRecipe
            ? {
                ingredients,
                servings,
                calories,
                proteins,
                carbs,
                fat,
                prepTime,
                title: recipeName || chat.title,
                description,
                instructions: instructions ?? [],
                difficulty,
                isVegetarian,
                isVegan,
                isGlutenFree,
                isDairyFree,
              }
            : undefined,
        },
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
        role: msg.role.toLowerCase() as 'user' | 'model',
        calories: msg.Recipe?.calories ?? 0,
        proteins: msg.Recipe?.proteins ?? 0,
        carbs: msg.Recipe?.carbs ?? 0,
        fat: msg.Recipe?.fat ?? 0,
        prepTime: msg.Recipe?.prepTimeMin ?? 0,
        title: msg.Recipe?.name,
        description: msg.Recipe?.description,
        instructions: msg.Recipe?.instructions ?? [],
        difficulty: msg.Recipe?.difficulty,
        isVegetarian: msg.Recipe?.isVegetarian ?? false,
        isVegan: msg.Recipe?.isVegan ?? false,
        isGlutenFree: msg.Recipe?.isGlutenFree ?? false,
        isDairyFree: msg.Recipe?.isDairyFree ?? false,
      })),
      createdAt: chat?.createdAt ?? new Date().toISOString(),
      updatedAt: chat?.updatedAt ?? new Date().toISOString(),
      ingredients: isRecipe ? ingredients : undefined,
      servings: isRecipe ? servings : undefined,
      calories: isRecipe ? calories : 0,
      proteins: isRecipe ? proteins : 0,
      carbs: isRecipe ? carbs : 0,
      fat: isRecipe ? fat : 0,
      prepTime: isRecipe ? prepTime : 0,
    };
  }
}
