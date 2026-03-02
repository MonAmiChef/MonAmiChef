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
    return this.prismaService.chatSession.create({
      data: {
        userId,
        title,
        preferences,
        exclude,
        messages: {
          create: [
            { content: userMessage, role: 'user', isRecipe: false },
            {
              content: modelResponse,
              role: 'model',
              isRecipe: isResponseRecipe,
            },
          ],
        },
      },
      include: {
        messages: true,
      },
    });
  }

  async updateChat({
    chatId,
    messages,
  }: {
    chatId: string;
    messages: { content: string; role: MessageRole }[];
  }): Promise<{ messages: Message[] }> {
    const formatedMessages = messages.map((msg) => ({
      chatId: chatId,
      content: msg.content,
      role: msg.role,
    }));

    const result = await this.prismaService.message.createManyAndReturn({
      data: formatedMessages,
    });

    return {
      messages: result,
    };
  }
}
