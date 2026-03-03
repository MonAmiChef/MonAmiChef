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
    });
  }

  async getChat({
    chatId,
    userId,
  }: {
    chatId: string;
    userId: string;
  }): Promise<(ChatSession & { messages: Message[] }) | null> {
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
  }: {
    title: string;
    userId: string;
    userMessage: string;
    modelResponse: string;
    preferences: PreferenceTag[];
    exclude: PreferenceTag[];
    isResponseRecipe: boolean;
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
            },
          ],
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async updateChat({
    chatId,
    messages,
    preferences,
    exclude,
  }: {
    chatId: string;
    messages: { content: string; role: MessageRole; isRecipe?: boolean }[];
    preferences: PreferenceTag[];
    exclude: PreferenceTag[];
  }): Promise<{ messages: Message[] }> {
    const now = new Date();
    const formatedMessages = messages.map((msg, index) => ({
      chatId: chatId,
      content: msg.content,
      role: msg.role,
      isRecipe: msg.isRecipe ?? false,
      createdAt: new Date(now.getTime() + index),
    }));

    const [, result] = await this.prismaService.$transaction([
      this.prismaService.chatSession.update({
        where: { id: chatId },
        data: { preferences, exclude },
      }),
      this.prismaService.message.createManyAndReturn({
        data: formatedMessages,
      }),
    ]);

    return {
      messages: result as Message[],
    };
  }
}
