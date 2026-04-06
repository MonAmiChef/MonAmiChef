import { Injectable } from '@nestjs/common';
import {
  ChatSession,
  Message,
  MessageRole,
  PreferenceTag,
} from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatSessionsRepository {
  constructor(private prismaService: PrismaService) {}

  async getAllUserChats({
    userId,
  }: {
    userId: string;
  }): Promise<ChatSession[]> {
    return this.prismaService.chatSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getChat({
    chatId,
    userId,
  }: {
    chatId: string;
    userId: string;
  }): Promise<any | null> {
    return this.prismaService.chatSession.findUnique({
      where: {
        id: chatId,
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            Recipe: {
              include: {
                ingredients: true,
              },
            },
          },
        },
      },
    });
  }

  async createChat({
    title,
    userId,
    userMessage,
    modelResponse,
    preferences,
    exclude,
    isResponseRecipe,
    recipeData,
  }: {
    title: string;
    userId: string;
    userMessage: string;
    modelResponse: string;
    preferences: PreferenceTag[];
    exclude: PreferenceTag[];
    isResponseRecipe: boolean;
    recipeData?: {
      ingredients: any[];
      servings?: number;
      calories?: number;
      proteins?: number;
      carbs?: number;
      fat?: number;
      prepTime?: number;
      title?: string;
      description?: string;
      instructions?: string[];
      difficulty?: string;
      isVegetarian?: boolean;
      isVegan?: boolean;
      isGlutenFree?: boolean;
      isDairyFree?: boolean;
    };
  }) {
    const now = new Date();
    return this.prismaService.chatSession.create({
      data: {
        userId,
        title,
        preferences,
        exclude,
        messages: {
          create: [
            {
              content: userMessage,
              role: 'user',
              isRecipe: false,
              createdAt: now,
            },
            {
              content: modelResponse,
              role: 'model',
              isRecipe: isResponseRecipe,
              createdAt: new Date(now.getTime() + 1),
              Recipe:
                isResponseRecipe && recipeData
                  ? {
                      create: {
                        userId,
                        name: recipeData.title || title,
                        calories: recipeData.calories,
                        proteins: recipeData.proteins,
                        carbs: recipeData.carbs,
                        fat: recipeData.fat,
                        prepTimeMin: recipeData.prepTime,
                        description: recipeData.description,
                        instructions: recipeData.instructions ?? [],
                        difficulty: recipeData.difficulty,
                        isVegetarian: recipeData.isVegetarian ?? false,
                        isVegan: recipeData.isVegan ?? false,
                        isGlutenFree: recipeData.isGlutenFree ?? false,
                        isDairyFree: recipeData.isDairyFree ?? false,
                        ingredients: {
                          create: recipeData.ingredients.map((ing) => ({
                            name: ing.name,
                            quantity: ing.quantity,
                            unit: ing.unit,
                            category: ing.category,
                          })),
                        },
                      },
                    }
                  : undefined,
            },
          ],
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { Recipe: { include: { ingredients: true } } },
        },
      },
    });
  }

  async updateChat({
    chatId,
    userId,
    messages,
    preferences,
    exclude,
  }: {
    chatId: string;
    userId: string;
    messages: {
      content: string;
      role: MessageRole;
      isRecipe?: boolean;
      recipeData?: {
        ingredients: any[];
        servings?: number;
        calories?: number;
        proteins?: number;
        carbs?: number;
        fat?: number;
        prepTime?: number;
        title?: string;
        description?: string;
        instructions?: string[];
        difficulty?: string;
        isVegetarian?: boolean;
        isVegan?: boolean;
        isGlutenFree?: boolean;
        isDairyFree?: boolean;
      };
    }[];
    preferences: PreferenceTag[];
    exclude: PreferenceTag[];
  }): Promise<{ messages: any[] }> {
    const now = new Date();

    const resultMessages: any[] = [];

    await this.prismaService.$transaction(async (tx) => {
      await tx.chatSession.update({
        where: { id: chatId },
        data: { preferences, exclude },
      });

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const createdMsg = await tx.message.create({
          data: {
            chatId: chatId,
            content: msg.content,
            role: msg.role,
            isRecipe: msg.isRecipe ?? false,
            createdAt: new Date(now.getTime() + i),
            Recipe:
              msg.isRecipe && msg.recipeData
                ? {
                    create: {
                      userId,
                      name: msg.recipeData.title || 'Chefs Suggestion',
                      calories: msg.recipeData.calories,
                      proteins: msg.recipeData.proteins,
                      carbs: msg.recipeData.carbs,
                      fat: msg.recipeData.fat,
                      prepTimeMin: msg.recipeData.prepTime,
                      description: msg.recipeData.description,
                      instructions: msg.recipeData.instructions ?? [],
                      difficulty: msg.recipeData.difficulty,
                      isVegetarian: msg.recipeData.isVegetarian ?? false,
                      isVegan: msg.recipeData.isVegan ?? false,
                      isGlutenFree: msg.recipeData.isGlutenFree ?? false,
                      isDairyFree: msg.recipeData.isDairyFree ?? false,
                      ingredients: {
                        create: msg.recipeData.ingredients.map((ing: any) => ({
                          name: ing.name,
                          quantity: ing.quantity,
                          unit: ing.unit,
                          category: ing.category,
                        })),
                      },
                    },
                  }
                : undefined,
          },
          include: {
            Recipe: {
              include: {
                ingredients: true,
              },
            },
          },
        });
        resultMessages.push(createdMsg);
      }
    });

    return {
      messages: resultMessages,
    };
  }
}
